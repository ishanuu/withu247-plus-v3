import axios from 'axios';
import EmotionLog from '../models/EmotionLog.js';
import logger from '../utils/logger.js';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

export const analyzeEmotion = async (req, res) => {
  const { image } = req.body;
  const userId = req.userId;

  try {
    if (!image) {
      return res.status(400).json({
        success: false,
        error: 'Image is required',
      });
    }

    logger.info(`Processing emotion analysis for user ${userId}`);

    // Call AI service emotion endpoint
    let emotionData = {
      dominant_emotion: 'unknown',
      emotion_probabilities: {
        angry: 0,
        disgust: 0,
        fear: 0,
        happy: 0,
        sad: 0,
        surprise: 0,
        neutral: 1,
      },
      negative_emotion_score: 0,
    };

    try {
      const aiServiceResponse = await axios.post(
        `${AI_SERVICE_URL}/analyze-emotion`,
        { image },
        { timeout: 10000 } // 10 second timeout
      );

      emotionData = aiServiceResponse.data;
      logger.info(`Emotion analysis completed: ${emotionData.dominant_emotion}`);
    } catch (aiError) {
      logger.error(`AI service emotion call failed: ${aiError.message}`);
      return res.status(503).json({
        success: false,
        error: 'Emotion analysis service temporarily unavailable',
        details: aiError.message,
      });
    }

    // Save emotion log to database
    try {
      const emotionLog = new EmotionLog({
        userId,
        dominant_emotion: emotionData.dominant_emotion,
        emotion_probabilities: emotionData.emotion_probabilities,
        negative_emotion_score: emotionData.negative_emotion_score,
        inference_time_ms: emotionData.inference_time_ms || 0,
      });

      await emotionLog.save();
      logger.info(`Emotion log saved for user ${userId}`);
    } catch (dbError) {
      logger.error(`Failed to save emotion log: ${dbError.message}`);
      // Don't fail the request if database save fails
    }

    return res.status(200).json({
      success: true,
      data: {
        dominant_emotion: emotionData.dominant_emotion,
        emotion_probabilities: emotionData.emotion_probabilities,
        negative_emotion_score: emotionData.negative_emotion_score,
      },
    });
  } catch (error) {
    logger.error('Emotion analysis endpoint error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Emotion analysis failed',
      details: error.message,
    });
  }
};

export const getEmotionHistory = async (req, res) => {
  const userId = req.userId;
  const { limit = 100, skip = 0 } = req.query;

  try {
    const emotionHistory = await EmotionLog.find({ userId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    return res.status(200).json({
      success: true,
      data: emotionHistory,
    });
  } catch (error) {
    logger.error('Get emotion history error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve emotion history',
      details: error.message,
    });
  }
};

export const getEmotionStats = async (req, res) => {
  const userId = req.userId;
  const { days = 7 } = req.query;

  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const emotionLogs = await EmotionLog.find({
      userId,
      createdAt: { $gte: startDate },
    });

    if (emotionLogs.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          total_records: 0,
          dominant_emotions: {},
          average_negative_emotion: 0,
          emotion_trend: [],
        },
      });
    }

    // Calculate statistics
    const emotionCounts = {};
    let totalNegativeEmotion = 0;

    emotionLogs.forEach((log) => {
      emotionCounts[log.dominant_emotion] = (emotionCounts[log.dominant_emotion] || 0) + 1;
      totalNegativeEmotion += log.negative_emotion_score;
    });

    const averageNegativeEmotion = totalNegativeEmotion / emotionLogs.length;

    return res.status(200).json({
      success: true,
      data: {
        total_records: emotionLogs.length,
        dominant_emotions: emotionCounts,
        average_negative_emotion: parseFloat(averageNegativeEmotion.toFixed(4)),
        emotion_trend: emotionLogs.map((log) => ({
          timestamp: log.createdAt,
          dominant_emotion: log.dominant_emotion,
          negative_emotion_score: log.negative_emotion_score,
        })),
      },
    });
  } catch (error) {
    logger.error('Get emotion stats error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve emotion statistics',
      details: error.message,
    });
  }
};

export const clearEmotionHistory = async (req, res) => {
  const userId = req.userId;

  try {
    const result = await EmotionLog.deleteMany({ userId });

    logger.info(`Cleared ${result.deletedCount} emotion records for user ${userId}`);

    return res.status(200).json({
      success: true,
      message: `Deleted ${result.deletedCount} emotion records`,
    });
  } catch (error) {
    logger.error('Clear emotion history error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to clear emotion history',
      details: error.message,
    });
  }
};
