import axios from 'axios';
import logger from './logger.js';

/**
 * Emotion Snapshot Sampler
 * Captures emotion snapshots at regular intervals (3-5 seconds)
 * Prevents continuous emotion inference to reduce CPU load
 */

class EmotionSampler {
  constructor(intervalSeconds = 4) {
    this.intervalSeconds = intervalSeconds;
    this.samplingIntervals = new Map(); // userId -> intervalId
    this.lastEmotionData = new Map(); // userId -> emotion data
    this.backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
  }

  /**
   * Start emotion sampling for a user
   * Captures snapshots every N seconds
   *
   * @param {string} userId - User ID
   * @param {function} captureFrame - Function that returns base64 image
   * @param {function} onEmotionUpdate - Callback when emotion is updated
   */
  startSampling(userId, captureFrame, onEmotionUpdate) {
    // Don't start multiple samplers for same user
    if (this.samplingIntervals.has(userId)) {
      logger.warn(`Emotion sampling already running for user ${userId}`);
      return;
    }

    logger.info(`Starting emotion sampling for user ${userId} (interval: ${this.intervalSeconds}s)`);

    const intervalId = setInterval(async () => {
      try {
        const frame = captureFrame();
        if (!frame) {
          logger.warn(`Failed to capture frame for user ${userId}`);
          return;
        }

        // Send emotion analysis request
        // Note: This would be called from frontend to backend
        // The backend will handle the actual API call to AI service
        if (onEmotionUpdate) {
          onEmotionUpdate(frame);
        }
      } catch (error) {
        logger.error(`Emotion sampling error for user ${userId}: ${error.message}`);
      }
    }, this.intervalSeconds * 1000);

    this.samplingIntervals.set(userId, intervalId);
  }

  /**
   * Stop emotion sampling for a user
   *
   * @param {string} userId - User ID
   */
  stopSampling(userId) {
    const intervalId = this.samplingIntervals.get(userId);
    if (intervalId) {
      clearInterval(intervalId);
      this.samplingIntervals.delete(userId);
      logger.info(`Stopped emotion sampling for user ${userId}`);
    }
  }

  /**
   * Stop all emotion sampling
   */
  stopAllSampling() {
    for (const [userId, intervalId] of this.samplingIntervals.entries()) {
      clearInterval(intervalId);
      logger.info(`Stopped emotion sampling for user ${userId}`);
    }
    this.samplingIntervals.clear();
  }

  /**
   * Get last emotion data for user
   *
   * @param {string} userId - User ID
   * @returns {object} Last emotion data or null
   */
  getLastEmotion(userId) {
    return this.lastEmotionData.get(userId) || null;
  }

  /**
   * Update emotion data for user
   *
   * @param {string} userId - User ID
   * @param {object} emotionData - Emotion data from AI service
   */
  updateEmotion(userId, emotionData) {
    this.lastEmotionData.set(userId, {
      ...emotionData,
      timestamp: new Date(),
    });
  }

  /**
   * Clear emotion data for user
   *
   * @param {string} userId - User ID
   */
  clearEmotion(userId) {
    this.lastEmotionData.delete(userId);
  }

  /**
   * Get sampling status
   *
   * @returns {object} Status of all active samplers
   */
  getStatus() {
    return {
      active_samplers: this.samplingIntervals.size,
      interval_seconds: this.intervalSeconds,
      users_sampling: Array.from(this.samplingIntervals.keys()),
    };
  }
}

// Global emotion sampler instance
const emotionSampler = new EmotionSampler(4); // 4 second interval (3-5 second range)

export default emotionSampler;
