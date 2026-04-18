/**
 * Risk Fusion Engine
 * Combines multiple health signals into a unified risk score
 * Signals: Symptom Severity + Negative Emotion + Sentiment Score
 * Output: Risk Score + Escalation Recommendation
 */

import logger from '../utils/logger.js';

/**
 * Clamp value to 0-1 range
 */
const clamp = (value) => {
  if (typeof value !== 'number' || isNaN(value)) {
    return 0;
  }
  return Math.max(0, Math.min(1, value));
};

/**
 * Calculate unified risk score from multiple signals
 * Risk = α(symptom_severity) + β(negative_emotion) + γ(sentiment_score)
 * 
 * @param {object} signals - Health signals
 * @param {number} signals.symptom_severity - Symptom severity (0-1)
 * @param {number} signals.negative_emotion - Negative emotion probability (0-1)
 * @param {number} signals.sentiment_score - Chat sentiment score (0-1, where 0=negative, 1=positive)
 * @param {object} weights - Risk weights (default: 0.4, 0.4, 0.2)
 * @returns {object} Risk calculation results
 */
export const calculateRiskScore = (signals, weights = {}) => {
  try {
    // Validate and normalize weights
    const alpha = clamp(parseFloat(weights.alpha) || 0.4);
    const beta = clamp(parseFloat(weights.beta) || 0.4);
    const gamma = clamp(parseFloat(weights.gamma) || 0.2);

    // Validate and normalize signals
    const symptomSeverity = clamp(signals.symptom_severity);
    const negativeEmotion = clamp(signals.negative_emotion);
    
    // Convert sentiment score: 0=negative, 1=positive
    // For risk calculation, we want negative sentiment to increase risk
    // So we invert it: risk_sentiment = 1 - sentiment_score
    const sentimentScore = clamp(signals.sentiment_score);
    const riskSentiment = 1 - sentimentScore;

    // Calculate weighted risk
    const riskScore = (alpha * symptomSeverity) + (beta * negativeEmotion) + (gamma * riskSentiment);
    const normalizedRisk = clamp(riskScore);

    // Determine risk level
    const riskLevel = getRiskLevel(normalizedRisk);

    // Calculate escalation recommendation
    const escalation = getEscalationRecommendation(normalizedRisk, {
      symptomSeverity,
      negativeEmotion,
      riskSentiment,
    });

    logger.info(`Risk calculated: ${normalizedRisk.toFixed(3)} (${riskLevel})`);

    return {
      success: true,
      risk_score: parseFloat(normalizedRisk.toFixed(4)),
      risk_level: riskLevel,
      weights: {
        alpha,
        beta,
        gamma,
      },
      signals: {
        symptom_severity: parseFloat(symptomSeverity.toFixed(4)),
        negative_emotion: parseFloat(negativeEmotion.toFixed(4)),
        sentiment_risk: parseFloat(riskSentiment.toFixed(4)),
      },
      escalation: escalation,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    logger.error(`Risk calculation error: ${error.message}`);
    return {
      success: false,
      error: 'Risk calculation failed',
      details: error.message,
      risk_score: 0,
      risk_level: 'UNKNOWN',
    };
  }
};

/**
 * Determine risk level based on score
 */
const getRiskLevel = (riskScore) => {
  if (riskScore >= 0.8) return 'CRITICAL';
  if (riskScore >= 0.6) return 'HIGH';
  if (riskScore >= 0.4) return 'MODERATE';
  if (riskScore >= 0.2) return 'LOW';
  return 'MINIMAL';
};

/**
 * Get escalation recommendation based on risk score and signals
 */
const getEscalationRecommendation = (riskScore, signals) => {
  const recommendation = {
    should_escalate: riskScore >= 0.6,
    escalation_level: 'NONE',
    actions: [],
    reason: [],
  };

  // Analyze individual signals
  if (signals.symptomSeverity >= 0.7) {
    recommendation.reason.push('High symptom severity detected');
    recommendation.actions.push('Schedule urgent doctor appointment');
  }

  if (signals.negativeEmotion >= 0.6) {
    recommendation.reason.push('Significant negative emotion detected');
    recommendation.actions.push('Consider mental health support');
  }

  if (signals.sentiment_risk >= 0.7) {
    recommendation.reason.push('Negative sentiment in chat detected');
    recommendation.actions.push('Encourage user to seek professional help');
  }

  // Determine escalation level
  if (riskScore >= 0.8) {
    recommendation.escalation_level = 'CRITICAL';
    recommendation.actions.unshift('IMMEDIATE: Contact emergency services or go to ER');
    recommendation.should_escalate = true;
  } else if (riskScore >= 0.6) {
    recommendation.escalation_level = 'HIGH';
    recommendation.actions.unshift('Schedule urgent doctor appointment today');
    recommendation.should_escalate = true;
  } else if (riskScore >= 0.4) {
    recommendation.escalation_level = 'MODERATE';
    recommendation.actions.unshift('Schedule doctor appointment within 2-3 days');
    recommendation.should_escalate = false;
  } else {
    recommendation.escalation_level = 'LOW';
    recommendation.actions.push('Monitor symptoms, seek care if worsens');
    recommendation.should_escalate = false;
  }

  return recommendation;
};

/**
 * Continuous risk monitoring for a user
 * Tracks risk trends over time
 */
export const monitorRiskTrend = (riskHistory) => {
  if (!riskHistory || riskHistory.length === 0) {
    return {
      success: false,
      error: 'No risk history provided',
    };
  }

  const scores = riskHistory.map((r) => r.risk_score);
  const average = scores.reduce((a, b) => a + b, 0) / scores.length;
  const latest = scores[scores.length - 1];
  const trend = latest > average ? 'INCREASING' : 'DECREASING';

  return {
    success: true,
    average_risk: parseFloat(average.toFixed(4)),
    latest_risk: latest,
    trend: trend,
    history_count: scores.length,
    max_risk: Math.max(...scores),
    min_risk: Math.min(...scores),
  };
};

/**
 * Validate risk calculation inputs
 */
export const validateRiskInputs = (signals) => {
  const errors = [];

  if (typeof signals.symptom_severity !== 'number') {
    errors.push('symptom_severity must be a number');
  } else if (signals.symptom_severity < 0 || signals.symptom_severity > 1) {
    errors.push('symptom_severity must be between 0 and 1');
  }

  if (typeof signals.negative_emotion !== 'number') {
    errors.push('negative_emotion must be a number');
  } else if (signals.negative_emotion < 0 || signals.negative_emotion > 1) {
    errors.push('negative_emotion must be between 0 and 1');
  }

  if (typeof signals.sentiment_score !== 'number') {
    errors.push('sentiment_score must be a number');
  } else if (signals.sentiment_score < 0 || signals.sentiment_score > 1) {
    errors.push('sentiment_score must be between 0 and 1');
  }

  return {
    valid: errors.length === 0,
    errors: errors,
  };
};

/**
 * Generate risk report with all details
 */
export const generateRiskReport = (signals, weights = {}) => {
  // Validate inputs
  const validation = validateRiskInputs(signals);
  if (!validation.valid) {
    return {
      success: false,
      error: 'Invalid risk inputs',
      details: validation.errors,
    };
  }

  // Calculate risk
  const riskCalculation = calculateRiskScore(signals, weights);

  if (!riskCalculation.success) {
    return riskCalculation;
  }

  // Generate recommendations
  const recommendations = generateHealthRecommendations(riskCalculation);

  return {
    success: true,
    risk_calculation: riskCalculation,
    recommendations: recommendations,
    generated_at: new Date().toISOString(),
  };
};

/**
 * Generate health recommendations based on risk
 */
const generateHealthRecommendations = (riskCalculation) => {
  const recommendations = [];

  const { risk_level, signals, escalation } = riskCalculation;

  if (risk_level === 'CRITICAL') {
    recommendations.push({
      priority: 'URGENT',
      action: 'Seek immediate medical attention',
      details: 'Contact emergency services or go to nearest emergency room',
    });
  } else if (risk_level === 'HIGH') {
    recommendations.push({
      priority: 'HIGH',
      action: 'Schedule urgent doctor appointment',
      details: 'Contact your doctor today for evaluation',
    });
  } else if (risk_level === 'MODERATE') {
    recommendations.push({
      priority: 'MEDIUM',
      action: 'Schedule doctor appointment',
      details: 'Schedule appointment within 2-3 days',
    });
  }

  // Emotion-based recommendations
  if (signals.negative_emotion >= 0.6) {
    recommendations.push({
      priority: 'MEDIUM',
      action: 'Mental health support',
      details: 'Consider speaking with a mental health professional',
    });
  }

  // Sentiment-based recommendations
  if (signals.sentiment_risk >= 0.7) {
    recommendations.push({
      priority: 'MEDIUM',
      action: 'Emotional support',
      details: 'Reach out to trusted friends, family, or counselor',
    });
  }

  // General wellness recommendations
  recommendations.push({
    priority: 'LOW',
    action: 'General wellness',
    details: 'Maintain healthy lifestyle: adequate sleep, nutrition, exercise, stress management',
  });

  return recommendations;
};

export default {
  calculateRiskScore,
  monitorRiskTrend,
  validateRiskInputs,
  generateRiskReport,
};
