import { verifyToken } from '../config/jwt.js';
import logger from '../utils/logger.js';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    logger.warn('No token provided');
    return res.status(401).json({ success: false, error: 'Access token required' });
  }

  try {
    const decoded = verifyToken(token);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    logger.error('Token verification failed:', error.message);
    return res.status(403).json({ success: false, error: 'Invalid or expired token' });
  }
};

export const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const decoded = verifyToken(token);
      req.userId = decoded.userId;
    } catch (error) {
      logger.warn('Optional token verification failed:', error.message);
    }
  }

  next();
};
