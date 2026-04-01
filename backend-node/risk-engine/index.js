import logger from '../utils/logger.js';

const clamp = (value) => {
    if (isNaN(value)) return 0;
    return Math.max(0, Math.min(1, value));
};

/**
 * Calculate the final risk score based on multimodal inputs.
 * Risk = α(symptom_norm) + β(negative_emotion_prob) + γ(sentiment_norm)
 * 
 * @param {number} symptomScore - Normalized symptom severity (0-1)
 * @param {number} negativeEmotionProb - Probability of negative emotions (0-1)
 * @param {number} sentimentScore - Normalized negative sentiment (0-1)
 * @returns {Object} - Risk score and classification
 */
export const calculateRisk = (symptomScore, negativeEmotionProb, sentimentScore) => {
    const alpha = parseFloat(process.env.RISK_ALPHA) || 0.4;
    const beta = parseFloat(process.env.RISK_BETA) || 0.4;
    const gamma = parseFloat(process.env.RISK_GAMMA) || 0.2;

    const s = clamp(symptomScore);
    const e = clamp(negativeEmotionProb);
    const sen = clamp(sentimentScore);

    const finalRisk = (alpha * s) + (beta * e) + (gamma * sen);
    
    let classification = 'low';
    if (finalRisk > 0.7) {
        classification = 'high';
    } else if (finalRisk > 0.4) {
        classification = 'medium';
    }

    const result = {
        score: parseFloat(finalRisk.toFixed(4)),
        classification,
        components: {
            symptom: s,
            emotion: e,
            sentiment: sen
        },
        weights: { alpha, beta, gamma }
    };

    logger.info('Risk calculation performed', result);
    return result;
};
