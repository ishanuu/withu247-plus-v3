import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { addChatMessage, getChatHistory, addSymptomRecord, getDoctorSpecialty, addEmotionLog } from "../db";
import { TRPCError } from "@trpc/server";

/**
 * Health Assistant Router - FIXED VERSION
 * Handles chat, symptom analysis, emotion detection, triage, and nearby doctors
 * 
 * CRITICAL FIXES APPLIED:
 * 1. AI service error handling with fallback (Fix #1)
 * 2. Environment variable validation (Fix #3)
 * 3. Image upload validation (Fix #4)
 * 4. Risk score weight validation (Fix #5)
 * 5. Input sanitization (Fix #9)
 */

// ============================================================================
// ENVIRONMENT VALIDATION (Fix #3)
// ============================================================================

function validateEnvironment() {
  const required = ['AI_SERVICE_URL', 'GOOGLE_MAPS_API_KEY'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.warn(`⚠️ Missing environment variables: ${missing.join(', ')}`);
  }

  // Validate risk weights
  const alpha = parseFloat(process.env.RISK_ALPHA || "0.4");
  const beta = parseFloat(process.env.RISK_BETA || "0.4");
  const gamma = parseFloat(process.env.RISK_GAMMA || "0.2");
  
  const totalWeight = alpha + beta + gamma;
  if (Math.abs(totalWeight - 1.0) > 0.01) {
    console.warn(`⚠️ Risk weights sum to ${totalWeight.toFixed(2)}, not 1.0. Will normalize.`);
  }
}

// Validate on module load
validateEnvironment();

// ============================================================================
// AI SERVICE WRAPPER WITH FALLBACK (Fix #1)
// ============================================================================

interface AIServiceOptions {
  endpoint: string;
  data: any;
  fallback: any;
  timeout?: number;
}

async function callAIService(options: AIServiceOptions) {
  const { endpoint, data, fallback, timeout = 5000 } = options;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(`${process.env.AI_SERVICE_URL}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      signal: controller.signal as any,
    });

    clearTimeout(timeoutId);

    if (!response || !response.ok) {
      console.error(`❌ AI service error: ${response?.status}`);
      return fallback;
    }

    return await response.json();
  } catch (error: any) {
    console.error(`❌ AI service call failed (${endpoint}):`, error.message);
    return fallback;
  }
}

// ============================================================================
// INPUT SANITIZATION (Fix #9)
// ============================================================================

function sanitizeInput(input: string, maxLength: number = 5000): string {
  if (!input) return '';
  
  // Remove null bytes and control characters
  let sanitized = input.replace(/[\x00-\x1F\x7F]/g, '');
  
  // Trim to max length
  sanitized = sanitized.substring(0, maxLength).trim();
  
  return sanitized;
}

// ============================================================================
// HEALTH ROUTER
// ============================================================================

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
        // Sanitize input (Fix #9)
        const sanitizedMessage = sanitizeInput(input.message);

        // Call AI service with fallback (Fix #1)
        const aiData = await callAIService({
          endpoint: "/api/chat",
          data: { message: sanitizedMessage },
          fallback: {
            response: "I'm temporarily unavailable. Please try again later.",
            sentiment: "neutral",
            sentimentScore: 0.5,
            sources: [],
          },
          timeout: 5000,
        });

        // Store in database (with error handling)
        try {
          await addChatMessage(ctx.user.id, "user", sanitizedMessage);
          await addChatMessage(
            ctx.user.id,
            "assistant",
            aiData.response,
            aiData.sentiment,
            aiData.sentimentScore,
            JSON.stringify(aiData.sources || [])
          );
        } catch (dbError) {
          console.error("⚠️ Database error storing chat:", dbError);
          // Don't fail the response, just log it
        }

        return {
          response: aiData.response,
          sentiment: aiData.sentiment,
          sentimentScore: aiData.sentimentScore,
          sources: aiData.sources || [],
        };
      } catch (error) {
        console.error("❌ Chat error:", error);
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
        console.error("❌ Error fetching chat history:", error);
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
      lat: z.number()
        .min(-90, "Invalid latitude")
        .max(90, "Invalid latitude")
        .optional(),
      lng: z.number()
        .min(-180, "Invalid longitude")
        .max(180, "Invalid longitude")
        .optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Sanitize input (Fix #9)
        const sanitizedSymptom = sanitizeInput(input.symptom, 1000);

        // Call AI service with fallback (Fix #1)
        const aiData = await callAIService({
          endpoint: "/api/analyze-symptoms",
          data: {
            symptom: sanitizedSymptom,
            lat: input.lat,
            lng: input.lng,
          },
          fallback: {
            possibleConditions: [],
            severityScore: 0.5,
            sources: [],
            recommendedNextSteps: "Please consult a healthcare professional",
          },
          timeout: 8000,
        });

        // Calculate risk score using risk engine (Fix #5)
        const riskScore = calculateRisk(
          aiData.severityScore || 0,
          aiData.negativeEmotionScore || 0,
          aiData.sentimentScore || 0
        );

        // Store in database (with error handling)
        try {
          await addSymptomRecord(
            ctx.user.id,
            sanitizedSymptom,
            JSON.stringify(aiData.possibleConditions || []),
            aiData.severityScore || 0,
            riskScore.classification,
            JSON.stringify(aiData.sources || []),
            aiData.recommendedNextSteps
          );
        } catch (dbError) {
          console.error("⚠️ Database error storing symptom:", dbError);
        }

        return {
          symptom: sanitizedSymptom,
          possibleConditions: aiData.possibleConditions || [],
          severityScore: aiData.severityScore || 0,
          riskScore: riskScore.score,
          riskClassification: riskScore.classification,
          sources: aiData.sources || [],
          recommendedNextSteps: aiData.recommendedNextSteps,
        };
      } catch (error) {
        console.error("❌ Symptom analysis error:", error);
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
        // Sanitize input (Fix #9)
        const sanitizedSymptom = sanitizeInput(input.symptom, 1000);

        // Check database for existing mapping
        let mapping = await getDoctorSpecialty(sanitizedSymptom);

        if (!mapping) {
          // Call AI service to determine specialty (Fix #1)
          const aiData = await callAIService({
            endpoint: "/api/triage",
            data: { symptom: sanitizedSymptom },
            fallback: { specialty: "General Practitioner" },
            timeout: 5000,
          });

          return {
            symptom: sanitizedSymptom,
            recommendedSpecialty: aiData.specialty || "General Practitioner",
          };
        }

        return {
          symptom: sanitizedSymptom,
          recommendedSpecialty: mapping.specialty || "General Practitioner",
        };
      } catch (error) {
        console.error("❌ Triage error:", error);
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
        .regex(/^data:image\/(png|jpeg|jpg|gif);base64,/, "Invalid image format - must be PNG, JPEG, JPG, or GIF")
        .refine(
          (val) => Buffer.byteLength(val, 'utf8') <= 5242880,
          "Image data exceeds 5MB limit"
        ),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Call AI service with fallback (Fix #1)
        const aiData = await callAIService({
          endpoint: "/api/analyze-emotion",
          data: { image: input.imageBase64 },
          fallback: {
            dominantEmotion: "neutral",
            emotionProbs: { neutral: 1.0 },
            negativeEmotionScore: 0,
          },
          timeout: 10000,
        });

        // Store in database (with error handling)
        try {
          await addEmotionLog(
            ctx.user.id,
            aiData.dominantEmotion,
            JSON.stringify(aiData.emotionProbs || {}),
            aiData.negativeEmotionScore || 0
          );
        } catch (dbError) {
          console.error("⚠️ Database error storing emotion:", dbError);
        }

        return {
          dominantEmotion: aiData.dominantEmotion,
          emotionProbs: aiData.emotionProbs || {},
          negativeEmotionScore: aiData.negativeEmotionScore || 0,
        };
      } catch (error) {
        console.error("❌ Emotion analysis error:", error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to analyze emotion',
        });
      }
    }),

  // Find nearby doctors and hospitals
  nearbyDoctors: protectedProcedure
    .input(z.object({
      lat: z.number()
        .min(-90, "Invalid latitude")
        .max(90, "Invalid latitude"),
      lng: z.number()
        .min(-180, "Invalid longitude")
        .max(180, "Invalid longitude"),
      specialty: z.string().max(100).optional(),
      radius: z.number().min(100).max(50000).default(5000),
    }))
    .query(async ({ ctx, input }) => {
      try {
        if (!process.env.GOOGLE_MAPS_API_KEY) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Google Maps API not configured',
          });
        }

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
        console.error("❌ Nearby doctors error:", error);
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
 * FIXED: Validates weights and clamps values (Fix #5)
 */
function calculateRisk(symptomScore: number, negativeEmotionProb: number, sentimentScore: number) {
  const clamp = (value: number) => {
    if (isNaN(value)) return 0;
    return Math.max(0, Math.min(1, value));
  };

  let alpha = parseFloat(process.env.RISK_ALPHA || "0.4");
  let beta = parseFloat(process.env.RISK_BETA || "0.4");
  let gamma = parseFloat(process.env.RISK_GAMMA || "0.2");

  // Normalize weights if they don't sum to 1.0 (Fix #5)
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
