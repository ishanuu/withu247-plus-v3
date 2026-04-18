import axios from 'axios';
import ChatHistory from '../models/ChatHistory.js';
import logger from '../utils/logger.js';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

export const sendMessage = async (req, res) => {
  const { message } = req.body;
  const userId = req.userId;

  try {
    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required',
      });
    }

    logger.info(`Processing chat message from user ${userId}: ${message.substring(0, 50)}...`);

    // Call AI service RAG endpoint
    let aiResponse = {
      response: 'Unable to connect to AI service',
      sources: [],
      sentiment_score: 0.5,
      emotion_data: {
        dominant_emotion: 'neutral',
        negative_emotion_score: 0,
      },
    };

    try {
      const aiServiceResponse = await axios.post(
        `${AI_SERVICE_URL}/rag-chat`,
        { query: message },
        { timeout: 30000 } // 30 second timeout
      );

      aiResponse = aiServiceResponse.data;
      logger.info(`AI service response received: ${aiResponse.response.substring(0, 50)}...`);
    } catch (aiError) {
      logger.error(`AI service call failed: ${aiError.message}`);
      // Return error response but don't crash
      return res.status(503).json({
        success: false,
        error: 'AI service temporarily unavailable',
        details: aiError.message,
      });
    }

    // Save chat history to database
    try {
      const chatRecord = new ChatHistory({
        userId,
        message,
        response: aiResponse.response,
        sentiment_score: aiResponse.sentiment_score,
        sources: aiResponse.sources,
        emotion_data: aiResponse.emotion_data,
      });

      await chatRecord.save();
      logger.info(`Chat history saved for user ${userId}`);
    } catch (dbError) {
      logger.error(`Failed to save chat history: ${dbError.message}`);
      // Don't fail the request if database save fails
    }

    return res.status(200).json({
      success: true,
      data: {
        message,
        response: aiResponse.response,
        sources: aiResponse.sources,
        sentiment_score: aiResponse.sentiment_score,
        emotion_data: aiResponse.emotion_data,
      },
    });
  } catch (error) {
    logger.error('Chat endpoint error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Chat request failed',
      details: error.message,
    });
  }
};

export const getChatHistory = async (req, res) => {
  const userId = req.userId;
  const { limit = 50, skip = 0 } = req.query;

  try {
    const chatHistory = await ChatHistory.find({ userId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    return res.status(200).json({
      success: true,
      data: chatHistory,
    });
  } catch (error) {
    logger.error('Get chat history error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve chat history',
      details: error.message,
    });
  }
};

export const clearChatHistory = async (req, res) => {
  const userId = req.userId;

  try {
    const result = await ChatHistory.deleteMany({ userId });

    logger.info(`Cleared ${result.deletedCount} chat records for user ${userId}`);

    return res.status(200).json({
      success: true,
      message: `Deleted ${result.deletedCount} chat records`,
    });
  } catch (error) {
    logger.error('Clear chat history error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to clear chat history',
      details: error.message,
    });
  }
};
