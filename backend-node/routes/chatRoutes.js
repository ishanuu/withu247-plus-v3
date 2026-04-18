import express from 'express';
import { sendMessage, getChatHistory, clearChatHistory } from '../controllers/chatController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Protected routes - require authentication
router.post('/send', authenticateToken, sendMessage);
router.get('/history', authenticateToken, getChatHistory);
router.delete('/clear', authenticateToken, clearChatHistory);

export default router;
