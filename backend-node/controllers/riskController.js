import {
  calculateRiskScore,
  monitorRiskTrend,
  validateRiskInputs,
  generateRiskReport,
} from '../risk-engine/riskFusionEngine.js';
import RiskLog from '../models/RiskLog.js';
import logger from '../utils/logger.js';

/**
 * Calculate risk score from health signals
 */
export const calculateRisk = async (req, res) => {
  const { symptom_severity, negative_emotion, sentiment_score, weights } = req.body;
  const userId = req.userId;

  try {
    // Validate inputs
    const signals = {
      symptom_severity: parseFloat(symptom_severity) || 0,
      negative_emotion: parseFloat(negative_emotion) || 0,
      sentiment_score: parseFloat(sentiment_score) || 0.5,
    };

    const validation = validateRiskInputs(signals);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: 'Invalid risk inputs',
        details: validation.errors,
      });
    }

    // Calculate risk
    const riskCalculation = calculateRiskScore(signals, weights);

    if (!riskCalculation.success) {
      return res.status(500).json(riskCalculation);
    }

    // Save risk log to database
    try {
      const riskLog = new RiskLog({
        userId,
        signals,
        risk_score: riskCalculation.risk_score,
        risk_level: riskCalculation.risk_level,
        escalation: riskCalculation.escalation,
      });

      await riskLog.save();
      logger.info(`Risk log saved for user ${userId}: ${riskCalculation.risk_level}`);
    } catch (dbError) {
      logger.error(`Failed to save risk log: ${dbError.message}`);
    }

    return res.status(200).json({
      success: true,
      data: riskCalculation,
    });
  } catch (error) {
    logger.error('Risk calculation endpoint error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Risk calculation failed',
      details: error.message,
    });
  }
};

/**
 * Generate comprehensive risk report
 */
export const generateReport = async (req, res) => {
  const { symptom_severity, negative_emotion, sentiment_score, weights } = req.body;
  const userId = req.userId;

  try {
    const signals = {
      symptom_severity: parseFloat(symptom_severity) || 0,
      negative_emotion: parseFloat(negative_emotion) || 0,
      sentiment_score: parseFloat(sentiment_score) || 0.5,
    };

    const report = generateRiskReport(signals, weights);

    if (!report.success) {
      return res.status(400).json(report);
    }

    return res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error) {
    logger.error('Risk report generation error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Report generation failed',
      details: error.message,
    });
  }
};

/**
 * Get risk trend for user
 */
export const getRiskTrend = async (req, res) => {
  const userId = req.userId;
  const { limit = 30 } = req.query;

  try {
    const riskHistory = await RiskLog.find({ userId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    if (riskHistory.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          message: 'No risk history available',
          history: [],
        },
      });
    }

    // Reverse to get chronological order
    const chronological = riskHistory.reverse();

    const trend = monitorRiskTrend(chronological);

    return res.status(200).json({
      success: true,
      data: {
        trend,
        history: chronological.map((r) => ({
          risk_score: r.risk_score,
          risk_level: r.risk_level,
          timestamp: r.createdAt,
        })),
      },
    });
  } catch (error) {
    logger.error('Get risk trend error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve risk trend',
      details: error.message,
    });
  }
};

/**
 * Get latest risk assessment
 */
export const getLatestRisk = async (req, res) => {
  const userId = req.userId;

  try {
    const latestRisk = await RiskLog.findOne({ userId }).sort({ createdAt: -1 });

    if (!latestRisk) {
      return res.status(200).json({
        success: true,
        data: {
          message: 'No risk assessment available',
        },
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        risk_score: latestRisk.risk_score,
        risk_level: latestRisk.risk_level,
        escalation: latestRisk.escalation,
        signals: latestRisk.signals,
        timestamp: latestRisk.createdAt,
      },
    });
  } catch (error) {
    logger.error('Get latest risk error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve latest risk',
      details: error.message,
    });
  }
};

/**
 * Get risk history for user
 */
export const getRiskHistory = async (req, res) => {
  const userId = req.userId;
  const { limit = 50, skip = 0 } = req.query;

  try {
    const riskHistory = await RiskLog.find({ userId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    return res.status(200).json({
      success: true,
      data: riskHistory,
    });
  } catch (error) {
    logger.error('Get risk history error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve risk history',
      details: error.message,
    });
  }
};

export default {
  calculateRisk,
  generateReport,
  getRiskTrend,
  getLatestRisk,
  getRiskHistory,
};
