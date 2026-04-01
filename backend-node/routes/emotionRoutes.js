import express from 'express';
import {
  analyzeEmotion,
  getEmotionHistory,
  getEmotionStats,
  clearEmotionHistory,
} from '../controllers/emotionController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Protected routes - require authentication
router.post('/analyze', authenticateToken, analyzeEmotion);
router.get('/history', authenticateToken, getEmotionHistory);
router.get('/stats', authenticateToken, getEmotionStats);
router.delete('/clear', authenticateToken, clearEmotionHistory);

export default router;
