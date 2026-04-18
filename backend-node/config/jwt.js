import jwt from 'jsonwebtoken';
import logger from '../utils/logger.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';

export const generateToken = (userId) => {
  try {
    const token = jwt.sign({ userId }, JWT_SECRET, {
      expiresIn: JWT_EXPIRY,
    });
    return token;
  } catch (error) {
    logger.error('Token generation failed:', error.message);
    throw error;
  }
};

export const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    logger.error('Token verification failed:', error.message);
    throw error;
  }
};

export const decodeToken = (token) => {
  try {
    const decoded = jwt.decode(token);
    return decoded;
  } catch (error) {
    logger.error('Token decode failed:', error.message);
    throw error;
  }
};
