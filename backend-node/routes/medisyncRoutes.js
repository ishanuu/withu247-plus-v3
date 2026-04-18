import express from 'express';
import {
  analyzeSymptomEndpoint,
  getTriageRecommendations,
  getTreatmentEndpoint,
  getResearchEndpoint,
  getSymptomHistory,
  getDoctorQueryHistory,
} from '../controllers/medisyncController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Protected routes - require authentication
router.post('/analyze-symptoms', authenticateToken, analyzeSymptomEndpoint);
router.post('/triage', authenticateToken, getTriageRecommendations);
router.post('/treatment', authenticateToken, getTreatmentEndpoint);
router.get('/research', authenticateToken, getResearchEndpoint);
router.get('/symptom-history', authenticateToken, getSymptomHistory);
router.get('/doctor-history', authenticateToken, getDoctorQueryHistory);

export default router;
