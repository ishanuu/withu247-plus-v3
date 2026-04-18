import {
  analyzeSymptoms,
  getSpecialtyRecommendations,
  getTreatmentRecommendations,
} from '../medisync/symptomAnalyzer.js';
import {
  searchPubMed,
  getMedicalGuidelines,
  getEvidenceBasedTreatments,
} from '../medisync/pubmedRetriever.js';
import SymptomRecord from '../models/SymptomRecord.js';
import DoctorQuery from '../models/DoctorQuery.js';
import logger from '../utils/logger.js';

/**
 * Analyze user symptoms and provide medical insights
 */
export const analyzeSymptomEndpoint = async (req, res) => {
  const { symptoms } = req.body;
  const userId = req.userId;

  try {
    if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Symptoms array is required',
      });
    }

    logger.info(`Analyzing symptoms for user ${userId}: ${symptoms.join(', ')}`);

    // Analyze symptoms
    const analysis = analyzeSymptoms(symptoms);

    if (!analysis.success) {
      return res.status(400).json(analysis);
    }

    // Get specialty recommendations
    const specialtyRecs = getSpecialtyRecommendations(analysis.possible_conditions);

    // Fetch PubMed research for top condition
    let researchArticles = [];
    if (analysis.possible_conditions.length > 0) {
      const topCondition = analysis.possible_conditions[0];
      const pubmedResults = await searchPubMed(topCondition, 3);
      if (pubmedResults.success) {
        researchArticles = pubmedResults.articles;
      }
    }

    // Get medical guidelines
    const guidelines = analysis.possible_conditions.length > 0
      ? getMedicalGuidelines(analysis.possible_conditions[0])
      : null;

    // Save symptom record to database
    try {
      const symptomRecord = new SymptomRecord({
        userId,
        symptoms,
        analysis_results: {
          possible_conditions: analysis.possible_conditions,
          severity_score: analysis.severity_score,
          urgency_level: analysis.urgency_level,
          recommended_specialists: analysis.recommended_specialists,
        },
      });

      await symptomRecord.save();
      logger.info(`Symptom record saved for user ${userId}`);
    } catch (dbError) {
      logger.error(`Failed to save symptom record: ${dbError.message}`);
    }

    return res.status(200).json({
      success: true,
      data: {
        symptoms,
        analysis: {
          possible_conditions: analysis.possible_conditions,
          severity_score: analysis.severity_score,
          urgency_level: analysis.urgency_level,
          confidence: analysis.confidence,
        },
        specialists: {
          recommended: analysis.recommended_specialists,
          descriptions: analysis.specialist_descriptions,
        },
        guidelines: guidelines,
        research: {
          articles: researchArticles,
          source: 'PubMed',
        },
      },
    });
  } catch (error) {
    logger.error('Symptom analysis endpoint error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Symptom analysis failed',
      details: error.message,
    });
  }
};

/**
 * Get doctor specialty recommendations based on conditions
 */
export const getTriageRecommendations = async (req, res) => {
  const { conditions } = req.body;
  const userId = req.userId;

  try {
    if (!conditions || !Array.isArray(conditions) || conditions.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Conditions array is required',
      });
    }

    logger.info(`Getting triage recommendations for user ${userId}: ${conditions.join(', ')}`);

    // Get specialty recommendations
    const recommendations = getSpecialtyRecommendations(conditions);

    if (!recommendations.success) {
      return res.status(400).json(recommendations);
    }

    // Save doctor query to database
    try {
      const doctorQuery = new DoctorQuery({
        userId,
        conditions,
        recommended_specialists: recommendations.recommended_specialists,
      });

      await doctorQuery.save();
      logger.info(`Doctor query saved for user ${userId}`);
    } catch (dbError) {
      logger.error(`Failed to save doctor query: ${dbError.message}`);
    }

    return res.status(200).json({
      success: true,
      data: {
        conditions,
        recommended_specialists: recommendations.recommended_specialists,
        specialist_descriptions: recommendations.specialist_descriptions,
        condition_specialist_mapping: recommendations.condition_specialist_mapping,
      },
    });
  } catch (error) {
    logger.error('Triage recommendations endpoint error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Triage recommendations failed',
      details: error.message,
    });
  }
};

/**
 * Get treatment recommendations for a condition
 */
export const getTreatmentEndpoint = async (req, res) => {
  const { condition } = req.body;

  try {
    if (!condition) {
      return res.status(400).json({
        success: false,
        error: 'Condition is required',
      });
    }

    logger.info(`Getting treatment recommendations for: ${condition}`);

    // Get treatment recommendations
    const treatment = getTreatmentRecommendations(condition);

    // Get medical guidelines
    const guidelines = getMedicalGuidelines(condition);

    // Get evidence-based treatments
    const evidenceBasedTreatments = getEvidenceBasedTreatments(condition);

    return res.status(200).json({
      success: true,
      data: {
        condition,
        treatment: treatment,
        guidelines: guidelines,
        evidence_based_treatments: evidenceBasedTreatments,
      },
    });
  } catch (error) {
    logger.error('Treatment recommendations endpoint error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Treatment recommendations failed',
      details: error.message,
    });
  }
};

/**
 * Get medical research for a condition
 */
export const getResearchEndpoint = async (req, res) => {
  const { condition, maxResults = 5 } = req.query;

  try {
    if (!condition) {
      return res.status(400).json({
        success: false,
        error: 'Condition is required',
      });
    }

    logger.info(`Fetching research for: ${condition}`);

    // Search PubMed
    const pubmedResults = await searchPubMed(condition, parseInt(maxResults));

    if (!pubmedResults.success) {
      return res.status(500).json(pubmedResults);
    }

    return res.status(200).json({
      success: true,
      data: {
        condition,
        research_articles: pubmedResults.articles,
        source: pubmedResults.source,
      },
    });
  } catch (error) {
    logger.error('Research endpoint error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch research',
      details: error.message,
    });
  }
};

/**
 * Get symptom history for user
 */
export const getSymptomHistory = async (req, res) => {
  const userId = req.userId;
  const { limit = 50, skip = 0 } = req.query;

  try {
    const symptomHistory = await SymptomRecord.find({ userId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    return res.status(200).json({
      success: true,
      data: symptomHistory,
    });
  } catch (error) {
    logger.error('Get symptom history error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve symptom history',
      details: error.message,
    });
  }
};

/**
 * Get doctor query history for user
 */
export const getDoctorQueryHistory = async (req, res) => {
  const userId = req.userId;
  const { limit = 50, skip = 0 } = req.query;

  try {
    const doctorHistory = await DoctorQuery.find({ userId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    return res.status(200).json({
      success: true,
      data: doctorHistory,
    });
  } catch (error) {
    logger.error('Get doctor query history error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve doctor query history',
      details: error.message,
    });
  }
};

export default {
  analyzeSymptomEndpoint,
  getTriageRecommendations,
  getTreatmentEndpoint,
  getResearchEndpoint,
  getSymptomHistory,
  getDoctorQueryHistory,
};
