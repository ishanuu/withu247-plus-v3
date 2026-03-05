import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { addChatMessage, getChatHistory, addSymptomRecord, getDoctorSpecialty, addEmotionLog } from "../db";

/**
 * Health Assistant Router
 * Handles chat, symptom analysis, emotion detection, triage, and nearby doctors
 */
export const healthRouter = router({
  // Chat with RAG medical assistant
  chat: protectedProcedure
    .input(z.object({
      message: z.string().min(1),
      conversationId: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Call FastAPI AI service for RAG + sentiment analysis
        const aiResponse = await fetch(process.env.AI_SERVICE_URL + "/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: input.message }),
        });

        if (!aiResponse.ok) {
          throw new Error("AI service error");
        }

        const aiData = await aiResponse.json();

        // Store in database
        await addChatMessage(
          ctx.user.id,
          "user",
          input.message
        );

        await addChatMessage(
          ctx.user.id,
          "assistant",
          aiData.response,
          aiData.sentiment,
          aiData.sentimentScore,
          JSON.stringify(aiData.sources || [])
        );

        return {
          response: aiData.response,
          sentiment: aiData.sentiment,
          sentimentScore: aiData.sentimentScore,
          sources: aiData.sources || [],
        };
      } catch (error) {
        console.error("Chat error:", error);
        throw new Error("Failed to process chat message");
      }
    }),

  // Get chat history
  getChatHistory: protectedProcedure
    .input(z.object({ limit: z.number().optional() }))
    .query(async ({ ctx, input }) => {
      return getChatHistory(ctx.user.id, input.limit);
    }),

  // Analyze symptoms with RAG + MediSync
  analyzeSymptoms: protectedProcedure
    .input(z.object({
      symptom: z.string().min(1),
      lat: z.number().optional(),
      lng: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Call FastAPI AI service for RAG symptom analysis
        const aiResponse = await fetch(process.env.AI_SERVICE_URL + "/api/analyze-symptoms", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            symptom: input.symptom,
            lat: input.lat,
            lng: input.lng,
          }),
        });

        if (!aiResponse.ok) {
          throw new Error("AI service error");
        }

        const aiData = await aiResponse.json();

        // Calculate risk score using risk engine
        const riskScore = calculateRisk(
          aiData.severityScore || 0,
          aiData.negativeEmotionScore || 0,
          aiData.sentimentScore || 0
        );

        // Store in database
        await addSymptomRecord(
          ctx.user.id,
          input.symptom,
          JSON.stringify(aiData.possibleConditions || []),
          aiData.severityScore || 0,
          riskScore.classification,
          JSON.stringify(aiData.sources || []),
          aiData.recommendedNextSteps
        );

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
        throw new Error("Failed to analyze symptoms");
      }
    }),

  // Triage: Map symptoms to doctor specialty
  triage: protectedProcedure
    .input(z.object({
      symptom: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Check database for existing mapping
        let mapping = await getDoctorSpecialty(input.symptom);
        let specialty = "";

        if (!mapping) {
          // Call AI service to determine specialty
          const aiResponse = await fetch(process.env.AI_SERVICE_URL + "/api/triage", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ symptom: input.symptom }),
          });

          if (!aiResponse.ok) {
            throw new Error("AI service error");
          }

          const aiData = await aiResponse.json();
          specialty = aiData.specialty;
        } else {
          specialty = mapping.specialty;
        }

        return {
          symptom: input.symptom,
          recommendedSpecialty: mapping?.specialty || "General Practitioner",
        };
      } catch (error) {
        console.error("Triage error:", error);
        throw new Error("Failed to determine doctor specialty");
      }
    }),

  // Emotion detection from image
  analyzeEmotion: protectedProcedure
    .input(z.object({
      imageBase64: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Call FastAPI AI service for emotion detection
        const aiResponse = await fetch(process.env.AI_SERVICE_URL + "/api/analyze-emotion", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: input.imageBase64 }),
        });

        if (!aiResponse.ok) {
          throw new Error("AI service error");
        }

        const aiData = await aiResponse.json();

        // Store in database
        await addEmotionLog(
          ctx.user.id,
          aiData.dominantEmotion,
          JSON.stringify(aiData.emotionProbs || {}),
          aiData.negativeEmotionScore || 0
        );

        return {
          dominantEmotion: aiData.dominantEmotion,
          emotionProbs: aiData.emotionProbs || {},
          negativeEmotionScore: aiData.negativeEmotionScore || 0,
        };
      } catch (error) {
        console.error("Emotion analysis error:", error);
        throw new Error("Failed to analyze emotion");
      }
    }),

  // Find nearby doctors and hospitals
  nearbyDoctors: protectedProcedure
    .input(z.object({
      lat: z.number(),
      lng: z.number(),
      specialty: z.string().optional(),
      radius: z.number().optional(),
    }))
    .query(async ({ ctx, input }) => {
      try {
        // Call Google Maps API through Node backend
        const mapsResponse = await fetch(
          `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${input.lat},${input.lng}&radius=${input.radius || 5000}&keyword=${input.specialty || 'hospital'}&key=${process.env.GOOGLE_MAPS_API_KEY}`
        );

        if (!mapsResponse.ok) {
          throw new Error("Google Maps API error");
        }

        const mapsData = await mapsResponse.json();

        return {
          results: mapsData.results.map((place: any) => ({
            name: place.name,
            address: place.vicinity,
            rating: place.rating,
            location: place.geometry?.location,
            placeId: place.place_id,
          })),
        };
      } catch (error) {
        console.error("Nearby doctors error:", error);
        throw new Error("Failed to find nearby doctors");
      }
    }),
});

/**
 * Risk Engine: Calculate final risk score
 * Risk = α(symptom_norm) + β(negative_emotion_prob) + γ(sentiment_norm)
 */
function calculateRisk(symptomScore: number, negativeEmotionProb: number, sentimentScore: number) {
  const clamp = (value: number) => {
    if (isNaN(value)) return 0;
    return Math.max(0, Math.min(1, value));
  };

  const alpha = parseFloat(process.env.RISK_ALPHA || "0.4");
  const beta = parseFloat(process.env.RISK_BETA || "0.4");
  const gamma = parseFloat(process.env.RISK_GAMMA || "0.2");

  const s = clamp(symptomScore);
  const e = clamp(negativeEmotionProb);
  const sen = clamp(sentimentScore);

  const finalRisk = (alpha * s) + (beta * e) + (gamma * sen);

  let classification = "low";
  if (finalRisk > 0.7) {
    classification = "high";
  } else if (finalRisk > 0.4) {
    classification = "medium";
  }

  return {
    score: parseFloat(finalRisk.toFixed(4)),
    classification,
    components: { symptom: s, emotion: e, sentiment: sen },
    weights: { alpha, beta, gamma },
  };
}
