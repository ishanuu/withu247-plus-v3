import 'dotenv/config.js';
import express from 'express';
import cors from 'cors';
import axios from 'axios';
import connectDB from './config/database.js';
import authRoutes from './routes/authRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import emotionRoutes from './routes/emotionRoutes.js';
import medisyncRoutes from './routes/medisyncRoutes.js';
import riskRoutes from './routes/riskRoutes.js';
import { authenticateToken } from './middleware/auth.js';
import { calculateRisk } from './risk-engine/index.js';
import { handleEscalation } from './escalation/index.js';
import logger from './utils/logger.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Database connection
await connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/emotion', emotionRoutes);
app.use('/api/medisync', medisyncRoutes);
app.use('/api/risk', riskRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Backend server is running' });
});

// ============================================
// PRIORITY 1: Backend API Skeleton
// These endpoints will be implemented with real logic in subsequent phases
// ============================================

// Chat endpoints are now handled by chatRoutes

// Emotion endpoints are now handled by emotionRoutes

// Symptom analysis endpoint (will integrate MediSync in Phase 4)
app.post('/api/analyze-symptoms', authenticateToken, async (req, res) => {
  const { symptoms } = req.body;

  try {
    if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Symptoms array is required',
      });
    }

    // TODO: Integrate with MediSync in Phase 4
    const mockResponse = {
      possible_conditions: [
        {
          condition: 'Common Cold',
          likelihood: 0.7,
          description: 'Mock condition',
        },
      ],
      severity_score: 0.3,
      recommended_specialist: 'General Practitioner',
      treatment_summary: 'Mock treatment summary',
      medical_sources: [],
    };

    return res.status(200).json({
      success: true,
      data: mockResponse,
    });
  } catch (error) {
    logger.error('Symptom analysis endpoint error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Symptom analysis failed',
      details: error.message,
    });
  }
});

// Triage endpoint (will integrate MediSync in Phase 4)
app.post('/api/triage', authenticateToken, async (req, res) => {
  const { symptoms } = req.body;

  try {
    if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Symptoms array is required',
      });
    }

    // TODO: Integrate with MediSync triage logic in Phase 4
    const mockResponse = {
      recommended_specialty: 'General Practice',
      urgency_level: 'routine',
      next_steps: ['Schedule an appointment', 'Monitor symptoms'],
    };

    return res.status(200).json({
      success: true,
      data: mockResponse,
    });
  } catch (error) {
    logger.error('Triage endpoint error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Triage failed',
      details: error.message,
    });
  }
});

// Nearby doctors endpoint (will integrate Google Maps in Phase 7)
app.get('/api/nearby-doctors', authenticateToken, async (req, res) => {
  const { latitude, longitude, specialty } = req.query;

  try {
    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        error: 'Latitude and longitude are required',
      });
    }

    // TODO: Integrate with Google Maps in Phase 7
    const mockResponse = {
      nearby_doctors: [],
      nearby_hospitals: [],
    };

    return res.status(200).json({
      success: true,
      data: mockResponse,
    });
  } catch (error) {
    logger.error('Nearby doctors endpoint error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to find nearby doctors',
      details: error.message,
    });
  }
});

// Chat history endpoint
app.get('/api/chat-history', authenticateToken, async (req, res) => {
  try {
    // TODO: Implement chat history retrieval from database
    const mockResponse = [];

    return res.status(200).json({
      success: true,
      data: mockResponse,
    });
  } catch (error) {
    logger.error('Chat history endpoint error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve chat history',
      details: error.message,
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err.message);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    details: err.message,
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`Backend Node.js server running on port ${PORT}`);
});
