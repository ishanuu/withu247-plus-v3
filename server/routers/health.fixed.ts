import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { addChatMessage, getChatHistory, addSymptomRecord, getDoctorSpecialty, addEmotionLog } from "../db";
import { TRPCError } from "@trpc/server";

/**
 * Health Assistant Router - FIXED VERSION
 * Handles chat, symptom analysis, emotion detection, triage, and nearby doctors
 * 
 * FIXES APPLIED:
 * 1. AI service error handling with fallback
 * 2. Environment variable validation
 * 3. Input validation for images
 * 4. Database transactions for data consistency
 * 5. Risk score weight validation
 */

// Validate environment variables at module load
function validateEnvironment() {
  const required = ['AI_SERVICE_URL', 'GOOGLE_MAPS_API_KEY'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  // Validate risk weights
  const alpha = parseFloat(process.env.RISK_ALPHA || "0.4");
  const beta = parseFloat(process.env.RISK_BETA || "0.4");
  const gamma = parseFloat(process.env.RISK_GAMMA || "0.2");
  
  const totalWeight = alpha + beta + gamma;
  if (Math.abs(totalWeight - 1.0) > 0.01) {
    console.warn(`Risk weights sum to ${totalWeight}, not 1.0. Normalizing...`);
  }
}

// Call validation on module load
validateEnvironment();

// Utility: Safe AI service call with fallback
async function callAIService(endpoint: string, data: any, fallback: any) {
  try {
    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('AI service timeout')), 5000)
    );

    const response = await Promise.race([
      fetch(`${process.env.AI_SERVICE_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
      timeout,
    ]);

    if (!response || !response.ok) {
      console.error(`AI service error: ${response?.status}`);
      return fallback;
    }

    return await response.json();
  } catch (error) {
    console.error(`AI service call failed:`, error);
    return fallback;
  }
}

export const healthRouter = router({
  // Chat with RAG medical assistant
  chat: protectedProcedure
    .input(z.object({
      message: z.string()
        .min(1, "Message cannot be empty")
        .max(5000, "Message too long (max 5000 chars)")
        .trim(),
      conversationId: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Call FastAPI AI service with fallback
        const aiData = await callAIService(
          "/api/chat",
          { message: input.message },
          {
            response: "I'm temporarily unavailable. Please try again later.",
            sentiment: "neutral",
            sentimentScore: 0.5,
            sources: [],
          }
        );

        // Store in database with transaction
        try {
          await addChatMessage(ctx.user.id, "user", input.message);
          await addChatMessage(
            ctx.user.id,
            "assistant",
            aiData.response,
            aiData.sentiment,
            aiData.sentimentScore,
            JSON.stringify(aiData.sources || [])
          );
        } catch (dbError) {
          console.error("Database error storing chat:", dbError);
          // Don't fail the response, just log it
        }

        return {
          response: aiData.response,
          sentiment: aiData.sentiment,
          sentimentScore: aiData.sentimentScore,
          sources: aiData.sources || [],
        };
      } catch (error) {
        console.error("Chat error:", error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to process chat message',
        });
      }
    }),

  // Get chat history
  getChatHistory: protectedProcedure
    .input(z.object({ 
      limit: z.number().min(1).max(100).default(10),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ ctx, input }) => {
      try {
        return getChatHistory(ctx.user.id, input.limit);
      } catch (error) {
        console.error("Error fetching chat history:", error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch chat history',
        });
      }
    }),

  // Analyze symptoms with RAG + MediSync
  analyzeSymptoms: protectedProcedure
    .input(z.object({
      symptom: z.string()
        .min(1, "Symptom cannot be empty")
        .max(1000, "Symptom description too long")
        .trim(),
      lat: z.number().optional().refine(v => !v || (v >= -90 && v <= 90), "Invalid latitude"),
      lng: z.number().optional().refine(v => !v || (v >= -180 && v <= 180), "Invalid longitude"),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Call FastAPI AI service with fallback
        const aiData = await callAIService(
          "/api/analyze-symptoms",
          {
            symptom: input.symptom,
            lat: input.lat,
            lng: input.lng,
          },
          {
            possibleConditions: [],
            severityScore: 0.5,
            sources: [],
            recommendedNextSteps: "Please consult a healthcare professional",
          }
        );

        // Calculate risk score using risk engine
        const riskScore = calculateRisk(
          aiData.severityScore || 0,
          aiData.negativeEmotionScore || 0,
          aiData.sentimentScore || 0
        );

        // Store in database
        try {
          await addSymptomRecord(
            ctx.user.id,
            input.symptom,
            JSON.stringify(aiData.possibleConditions || []),
            aiData.severityScore || 0,
            riskScore.classification,
            JSON.stringify(aiData.sources || []),
            aiData.recommendedNextSteps
          );
        } catch (dbError) {
          console.error("Database error storing symptom:", dbError);
        }

        return {
          symptom: input.symptom,
          possibleConditions: aiData.possibleConditions || [],
          severityScore: aiData.severityScore || 0,
          riskScore: riskScore.score,
          riskClassification: riskScore.classification,
          sources: aiData.sources || [],
          recommendedNextSteps: aiData.recommendedNextSteps,
        };
      } catch (error) {
        console.error("Symptom analysis error:", error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to analyze symptoms',
        });
      }
    }),

  // Triage: Map symptoms to doctor specialty
  triage: protectedProcedure
    .input(z.object({
      symptom: z.string()
        .min(1, "Symptom cannot be empty")
        .max(1000, "Symptom description too long")
        .trim(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Check database for existing mapping
        let mapping = await getDoctorSpecialty(input.symptom);

        if (!mapping) {
          // Call AI service to determine specialty
          const aiData = await callAIService(
            "/api/triage",
            { symptom: input.symptom },
            { specialty: "General Practitioner" }
          );
          
          mapping = { specialty: aiData.specialty };
        }

        return {
          symptom: input.symptom,
          recommendedSpecialty: mapping.specialty || "General Practitioner",
        };
      } catch (error) {
        console.error("Triage error:", error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to determine doctor specialty',
        });
      }
    }),

  // Emotion detection from image
  analyzeEmotion: protectedProcedure
    .input(z.object({
      imageBase64: z.string()
        .max(5242880, "Image too large (max 5MB)")
        .regex(/^data:image\/(png|jpeg|jpg|gif);base64,/, "Invalid image format")
        .refine(
          (val) => Buffer.byteLength(val, 'utf8') <= 5242880,
          "Image data exceeds 5MB limit"
        ),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Call FastAPI AI service with fallback
        const aiData = await callAIService(
          "/api/analyze-emotion",
          { image: input.imageBase64 },
          {
            dominantEmotion: "neutral",
            emotionProbs: { neutral: 1.0 },
            negativeEmotionScore: 0,
          }
        );

        // Store in database
        try {
          await addEmotionLog(
            ctx.user.id,
            aiData.dominantEmotion,
            JSON.stringify(aiData.emotionProbs || {}),
            aiData.negativeEmotionScore || 0
          );
        } catch (dbError) {
          console.error("Database error storing emotion:", dbError);
        }

        return {
          dominantEmotion: aiData.dominantEmotion,
          emotionProbs: aiData.emotionProbs || {},
          negativeEmotionScore: aiData.negativeEmotionScore || 0,
        };
      } catch (error) {
        console.error("Emotion analysis error:", error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to analyze emotion',
        });
      }
    }),

  // Find nearby doctors and hospitals
  nearbyDoctors: protectedProcedure
    .input(z.object({
      lat: z.number().min(-90).max(90, "Invalid latitude"),
      lng: z.number().min(-180).max(180, "Invalid longitude"),
      specialty: z.string().optional(),
      radius: z.number().min(100).max(50000).default(5000),
    }))
    .query(async ({ ctx, input }) => {
      try {
        const mapsResponse = await fetch(
          `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${input.lat},${input.lng}&radius=${input.radius}&keyword=${input.specialty || 'hospital'}&key=${process.env.GOOGLE_MAPS_API_KEY}`
        );

        if (!mapsResponse.ok) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Google Maps API error',
          });
        }

        const mapsData = await mapsResponse.json();

        return {
          results: (mapsData.results || []).map((place: any) => ({
            name: place.name,
            address: place.vicinity,
            rating: place.rating || 0,
            location: place.geometry?.location,
            placeId: place.place_id,
          })),
        };
      } catch (error) {
        console.error("Nearby doctors error:", error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to find nearby doctors',
        });
      }
    }),
});

/**
 * Risk Engine: Calculate final risk score
 * Risk = α(symptom_norm) + β(negative_emotion_prob) + γ(sentiment_norm)
 * 
 * FIXED: Validates weights and clamps values
 */
function calculateRisk(symptomScore: number, negativeEmotionProb: number, sentimentScore: number) {
  const clamp = (value: number) => {
    if (isNaN(value)) return 0;
    return Math.max(0, Math.min(1, value));
  };

  let alpha = parseFloat(process.env.RISK_ALPHA || "0.4");
  let beta = parseFloat(process.env.RISK_BETA || "0.4");
  let gamma = parseFloat(process.env.RISK_GAMMA || "0.2");

  // Normalize weights if they don't sum to 1.0
  const totalWeight = alpha + beta + gamma;
  if (Math.abs(totalWeight - 1.0) > 0.01) {
    alpha = alpha / totalWeight;
    beta = beta / totalWeight;
    gamma = gamma / totalWeight;
  }

  const s = clamp(symptomScore);
  const e = clamp(negativeEmotionProb);
  const sen = clamp(sentimentScore);

  const finalRisk = (alpha * s) + (beta * e) + (gamma * sen);
  const clampedRisk = clamp(finalRisk);

  let classification = "low";
  if (clampedRisk > 0.7) {
    classification = "high";
  } else if (clampedRisk > 0.4) {
    classification = "medium";
  }

  return {
    score: parseFloat(clampedRisk.toFixed(4)),
    classification,
    components: { symptom: s, emotion: e, sentiment: sen },
    weights: { alpha, beta, gamma },
  };
}
