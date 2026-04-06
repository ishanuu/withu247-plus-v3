import express from 'express';
import {
  calculateRisk,
  generateReport,
  getRiskTrend,
  getLatestRisk,
  getRiskHistory,
} from '../controllers/riskController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Protected routes - require authentication
router.post('/calculate', authenticateToken, calculateRisk);
router.post('/report', authenticateToken, generateReport);
router.get('/trend', authenticateToken, getRiskTrend);
router.get('/latest', authenticateToken, getLatestRisk);
router.get('/history', authenticateToken, getRiskHistory);

export default router;
