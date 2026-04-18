/**
 * Integration Tests for WithU247+ Backend
 * Tests complete workflows: Register → Login → Chat → Emotion → Symptom → Risk → Maps
 */

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../models/User');
const ChatHistory = require('../models/ChatHistory');
const EmotionLog = require('../models/EmotionLog');
const SymptomRecord = require('../models/SymptomRecord');
const RiskLog = require('../models/RiskLog');

// Test data
const testUser = {
  email: 'test@withu247.com',
  password: 'TestPassword123',
  name: 'Test User'
};

const testMessage = 'I have a headache and fever';
const testSymptoms = ['headache', 'fever', 'cough'];
const testImage = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8VAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA8A/9k=';

let authToken = '';
let userId = '';

describe('WithU247+ Backend Integration Tests', () => {
  
  // Setup
  beforeAll(async () => {
    // Ensure MongoDB connection
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI);
    }
    
    // Clear test data
    await User.deleteMany({ email: testUser.email });
    await ChatHistory.deleteMany({});
    await EmotionLog.deleteMany({});
    await SymptomRecord.deleteMany({});
    await RiskLog.deleteMany({});
  });

  // Cleanup
  afterAll(async () => {
    await User.deleteMany({ email: testUser.email });
    await ChatHistory.deleteMany({});
    await EmotionLog.deleteMany({});
    await SymptomRecord.deleteMany({});
    await RiskLog.deleteMany({});
  });

  describe('Authentication Flow', () => {
    
    test('POST /api/auth/register - Should register new user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(testUser.email);
      expect(response.body.data.user.name).toBe(testUser.name);
      expect(response.body.data.token).toBeDefined();
      
      userId = response.body.data.user._id;
      authToken = response.body.data.token;
    });

    test('POST /api/auth/register - Should reject duplicate email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already exists');
    });

    test('POST /api/auth/login - Should login user', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(testUser.email);
      expect(response.body.data.token).toBeDefined();
      
      authToken = response.body.data.token;
    });

    test('POST /api/auth/login - Should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'WrongPassword123'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    test('POST /api/auth/login - Should reject non-existent user', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@withu247.com',
          password: 'Password123'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Chat API', () => {
    
    test('POST /api/chat/send - Should send message and get response', async () => {
      const response = await request(app)
        .post('/api/chat/send')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ message: testMessage })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.userMessage).toBe(testMessage);
      expect(response.body.data.aiResponse).toBeDefined();
      expect(response.body.data.sentiment).toBeDefined();
      expect(response.body.data.sources).toBeDefined();
    });

    test('POST /api/chat/send - Should reject unauthorized request', async () => {
      const response = await request(app)
        .post('/api/chat/send')
        .send({ message: testMessage })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    test('POST /api/chat/send - Should reject empty message', async () => {
      const response = await request(app)
        .post('/api/chat/send')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ message: '' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('GET /api/chat/history - Should retrieve chat history', async () => {
      const response = await request(app)
        .get('/api/chat/history')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    test('DELETE /api/chat/clear - Should clear chat history', async () => {
      const response = await request(app)
        .delete('/api/chat/clear')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('cleared');
    });
  });

  describe('Emotion Detection API', () => {
    
    test('POST /api/emotion/analyze - Should analyze emotion from image', async () => {
      const response = await request(app)
        .post('/api/emotion/analyze')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ image: testImage })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.dominantEmotion).toBeDefined();
      expect(response.body.data.emotionProbs).toBeDefined();
      expect(response.body.data.negativeEmotionScore).toBeDefined();
      expect(typeof response.body.data.negativeEmotionScore).toBe('number');
    });

    test('POST /api/emotion/analyze - Should reject invalid image', async () => {
      const response = await request(app)
        .post('/api/emotion/analyze')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ image: 'invalid-image' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('GET /api/emotion/history - Should retrieve emotion history', async () => {
      const response = await request(app)
        .get('/api/emotion/history')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('GET /api/emotion/stats - Should retrieve emotion statistics', async () => {
      const response = await request(app)
        .get('/api/emotion/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.totalAnalyses).toBeDefined();
      expect(response.body.data.dominantEmotions).toBeDefined();
    });
  });

  describe('MediSync API', () => {
    
    test('POST /api/medisync/analyze-symptoms - Should analyze symptoms', async () => {
      const response = await request(app)
        .post('/api/medisync/analyze-symptoms')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ symptoms: testSymptoms })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.conditions).toBeDefined();
      expect(response.body.data.severity).toBeDefined();
      expect(response.body.data.urgency).toBeDefined();
    });

    test('POST /api/medisync/analyze-symptoms - Should reject empty symptoms', async () => {
      const response = await request(app)
        .post('/api/medisync/analyze-symptoms')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ symptoms: [] })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('POST /api/medisync/triage - Should perform triage', async () => {
      const response = await request(app)
        .post('/api/medisync/triage')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ symptoms: testSymptoms })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.triageLevel).toBeDefined();
      expect(response.body.data.recommendation).toBeDefined();
    });

    test('POST /api/medisync/research - Should retrieve research', async () => {
      const response = await request(app)
        .post('/api/medisync/research')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ condition: 'fever' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.papers).toBeDefined();
    });
  });

  describe('Risk Engine API', () => {
    
    test('POST /api/risk/calculate - Should calculate risk score', async () => {
      const response = await request(app)
        .post('/api/risk/calculate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          signals: {
            symptomSeverity: 0.7,
            negativeEmotionScore: 0.3,
            sentimentScore: 0.4
          }
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.riskScore).toBeDefined();
      expect(response.body.data.riskLevel).toBeDefined();
      expect(response.body.data.escalation).toBeDefined();
      expect(typeof response.body.data.riskScore).toBe('number');
      expect(response.body.data.riskScore).toBeGreaterThanOrEqual(0);
      expect(response.body.data.riskScore).toBeLessThanOrEqual(1);
    });

    test('POST /api/risk/calculate - Should validate input ranges', async () => {
      const response = await request(app)
        .post('/api/risk/calculate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          signals: {
            symptomSeverity: 1.5, // Invalid: > 1
            negativeEmotionScore: 0.3,
            sentimentScore: 0.4
          }
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('GET /api/risk/report - Should retrieve risk report', async () => {
      const response = await request(app)
        .get('/api/risk/report')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.latestRisk).toBeDefined();
      expect(response.body.data.trend).toBeDefined();
    });
  });

  describe('Maps API', () => {
    
    test('GET /api/maps/nearby-hospitals - Should find nearby hospitals', async () => {
      const response = await request(app)
        .get('/api/maps/nearby-hospitals?latitude=28.6139&longitude=77.2090')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    test('GET /api/maps/doctors-by-specialty - Should find doctors by specialty', async () => {
      const response = await request(app)
        .get('/api/maps/doctors-by-specialty?specialty=cardiologist&latitude=28.6139&longitude=77.2090')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('GET /api/maps/nearby-hospitals - Should reject invalid coordinates', async () => {
      const response = await request(app)
        .get('/api/maps/nearby-hospitals?latitude=91&longitude=77.2090')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Complete Workflow', () => {
    
    test('Should complete end-to-end workflow', async () => {
      // 1. Send chat message
      let response = await request(app)
        .post('/api/chat/send')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ message: 'I have severe chest pain' })
        .expect(200);
      expect(response.body.success).toBe(true);

      // 2. Analyze emotion
      response = await request(app)
        .post('/api/emotion/analyze')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ image: testImage })
        .expect(200);
      expect(response.body.success).toBe(true);
      const negativeEmotionScore = response.body.data.negativeEmotionScore;

      // 3. Analyze symptoms
      response = await request(app)
        .post('/api/medisync/analyze-symptoms')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ symptoms: ['chest pain', 'shortness of breath'] })
        .expect(200);
      expect(response.body.success).toBe(true);
      const symptomSeverity = response.body.data.severity;

      // 4. Calculate risk
      response = await request(app)
        .post('/api/risk/calculate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          signals: {
            symptomSeverity,
            negativeEmotionScore,
            sentimentScore: 0.3
          }
        })
        .expect(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.riskLevel).toBeDefined();

      // 5. Find nearby doctors
      response = await request(app)
        .get('/api/maps/nearby-hospitals?latitude=28.6139&longitude=77.2090')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    
    test('Should return 404 for non-existent endpoint', async () => {
      const response = await request(app)
        .get('/api/nonexistent')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    test('Should return 401 for missing token', async () => {
      const response = await request(app)
        .get('/api/chat/history')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    test('Should return 401 for invalid token', async () => {
      const response = await request(app)
        .get('/api/chat/history')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});
