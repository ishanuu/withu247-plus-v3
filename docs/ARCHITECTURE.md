# WithU247+ System Architecture

## System Overview

WithU247+ is a multimodal AI health assistant that combines:
- **RAG (Retrieval-Augmented Generation)** for medical knowledge
- **CNN Emotion Detection** for emotional state assessment
- **MediSync** for symptom analysis and doctor mapping
- **Risk Fusion Engine** for comprehensive health risk assessment

---

## Microservice Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                         Frontend (React)                          │
│  • Netflix-style dark theme                                      │
│  • Horizontal scrolling cards                                    │
│  • Real-time updates                                             │
└────────────────────────────┬─────────────────────────────────────┘
                             │
                             ▼
        ┌────────────────────────────────────────┐
        │    Node.js Backend (Express)            │
        │    Port: 5000                           │
        │                                         │
        │  ├─ Authentication Layer                │
        │  │  └─ JWT token validation             │
        │  │                                      │
        │  ├─ API Orchestration                   │
        │  │  ├─ /api/auth/*                      │
        │  │  ├─ /api/chat/*                      │
        │  │  ├─ /api/emotion/*                   │
        │  │  ├─ /api/medisync/*                  │
        │  │  ├─ /api/risk/*                      │
        │  │  └─ /api/maps/*                      │
        │  │                                      │
        │  ├─ Risk Fusion Engine                  │
        │  │  └─ Weighted scoring (α, β, γ)      │
        │  │                                      │
        │  ├─ MediSync Integration                │
        │  │  ├─ Symptom analysis                 │
        │  │  ├─ Doctor mapping                   │
        │  │  └─ PubMed retrieval                 │
        │  │                                      │
        │  └─ Google Maps Integration             │
        │     ├─ Hospital finder                  │
        │     └─ Specialist locator               │
        │                                         │
        └────────────┬──────────────────┬─────────┘
                     │                  │
        ┌────────────▼──┐      ┌────────▼──────────┐
        │    MongoDB    │      │  FastAPI          │
        │    Port:      │      │  AI Service       │
        │    27017      │      │  Port: 8000       │
        │               │      │                   │
        │ Collections:  │      │ ├─ RAG Pipeline   │
        │ • users       │      │ │  ├─ Document   │
        │ • chat_       │      │ │  │  chunking   │
        │   history     │      │ │  ├─ Embedding  │
        │ • emotion_    │      │ │  ├─ FAISS DB   │
        │   logs        │      │ │  └─ LLM gen    │
        │ • symptom_    │      │ │                │
        │   records     │      │ ├─ Sentiment     │
        │ • risk_logs   │      │ │  Analysis      │
        │ • doctor_     │      │ │                │
        │   queries     │      │ └─ Emotion       │
        │               │      │    Detection     │
        └───────────────┘      │    (DeepFace)    │
                               │                   │
                               └───────────────────┘
```

---

## Component Details

### 1. Frontend Layer (React)
**Responsibility:** User interface and interaction

**Components:**
- Health Dashboard
- Chat Panel
- Emotion Scanner
- Symptom Analyzer
- Doctor Recommendations
- Nearby Hospitals Map

**Technology:**
- React 19
- Tailwind CSS
- Dark theme with Netflix-style UI

---

### 2. Backend Layer (Node.js + Express)

#### 2.1 Authentication Module
**File:** `backend-node/controllers/authController.js`

**Responsibilities:**
- User registration with email validation
- Login with password verification
- JWT token generation
- Token expiration and refresh

**Database:** Users collection

---

#### 2.2 Chat Module
**File:** `backend-node/controllers/chatController.js`

**Responsibilities:**
- Receive user messages
- Call FastAPI RAG endpoint
- Store chat history
- Return responses with sources

**Flow:**
```
User Message
    ↓
POST /api/chat/send
    ↓
Node Backend
    ↓
FastAPI /rag-chat
    ↓
RAG Pipeline (retrieve docs + generate response)
    ↓
Sentiment Analysis
    ↓
Return: response + sources + sentiment_score
    ↓
Save to MongoDB
    ↓
Return to Frontend
```

**Database:** ChatHistory collection

---

#### 2.3 Emotion Module
**File:** `backend-node/controllers/emotionController.js`

**Responsibilities:**
- Receive image snapshots
- Call FastAPI emotion endpoint
- Extract emotion probabilities
- Calculate negative emotion score
- Store emotion logs

**Emotion Calculation:**
```
negative_emotion = sad + angry + fear
```

**Database:** EmotionLog collection

---

#### 2.4 MediSync Module
**File:** `backend-node/controllers/medisyncController.js`

**Responsibilities:**
- Analyze symptoms
- Map to medical conditions
- Recommend doctor specialties
- Retrieve PubMed research
- Generate treatment guidelines

**Symptom Database:** 50+ symptoms mapped to conditions

**Database:** SymptomRecord, DoctorQuery collections

---

#### 2.5 Risk Fusion Engine
**File:** `backend-node/risk-engine/riskFusionEngine.js`

**Responsibilities:**
- Normalize inputs (0-1 scale)
- Apply weighted scoring
- Classify risk levels
- Generate recommendations
- Track risk trends

**Risk Formula:**
```
Risk = α(symptom_severity) + β(negative_emotion) + γ(sentiment_score)

Default weights:
α = 0.4 (symptom severity)
β = 0.4 (negative emotion)
γ = 0.2 (sentiment score)
```

**Risk Levels:**
- MINIMAL: 0.0 - 0.2 (Self-care)
- LOW: 0.2 - 0.4 (Monitor)
- MODERATE: 0.4 - 0.6 (Consult doctor)
- HIGH: 0.6 - 0.8 (Urgent consultation)
- CRITICAL: 0.8 - 1.0 (Emergency)

**Database:** RiskLog collection

---

#### 2.6 Google Maps Module
**File:** `backend-node/maps/googleMapsService.js`

**Responsibilities:**
- Find nearby hospitals
- Find doctors by specialty
- Calculate distances
- Get place details
- Geocode addresses

**Delhi-Specific Data:**
- 6 major hospitals
- 5 specialist doctors
- Fallback database for offline mode

**Database:** None (API-based)

---

### 3. AI Service Layer (FastAPI)

#### 3.1 RAG Pipeline
**File:** `ai-service/rag_pipeline.py`

**Components:**
1. **Document Loader**
   - Loads medical documents
   - Splits into chunks (500 tokens)

2. **Embedding Generator**
   - Uses sentence-transformers (all-MiniLM-L6-v2)
   - Caches embeddings to avoid recomputation

3. **Vector Database**
   - FAISS for similarity search
   - Loaded once at startup

4. **Retrieval**
   - Top-k retrieval (k=3-5)
   - Similarity-based ranking

5. **LLM Response**
   - Uses OpenAI or fallback
   - Grounded in retrieved documents

**Endpoint:** `POST /rag-chat`

---

#### 3.2 Sentiment Analysis
**File:** `ai-service/sentiment_analyzer.py`

**Model:** DistilBERT (distilbert-base-uncased-finetuned-sst-2)

**Output:**
- Sentiment score (0-1)
- 0 = negative
- 1 = positive

**Endpoint:** Part of `/rag-chat` response

---

#### 3.3 Emotion Detection
**File:** `ai-service/main.py` (emotion endpoint)

**Model:** DeepFace with FER2013 CNN

**Emotions Detected:**
- happy
- sad
- neutral
- angry
- fear
- disgust
- surprise

**Output:**
```json
{
  "emotion_probs": {
    "happy": 0.12,
    "sad": 0.51,
    "neutral": 0.25,
    "angry": 0.07,
    "fear": 0.03,
    "disgust": 0.01,
    "surprise": 0.01
  }
}
```

**Endpoint:** `POST /analyze-emotion`

---

### 4. Database Layer (MongoDB)

#### Collections

**users**
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  password: String (hashed),
  createdAt: Date,
  updatedAt: Date
}
```

**chat_history**
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  userMessage: String,
  aiResponse: String,
  sources: [String],
  sentimentScore: Number,
  timestamp: Date
}
```

**emotion_logs**
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  dominantEmotion: String,
  emotionProbs: Object,
  negativeEmotionScore: Number,
  timestamp: Date
}
```

**symptom_records**
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  symptoms: [String],
  possibleConditions: [Object],
  recommendedSpecialist: String,
  timestamp: Date
}
```

**risk_logs**
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  riskScore: Number,
  riskLevel: String,
  signals: Object,
  timestamp: Date
}
```

---

## Data Flow Diagrams

### Chat Workflow
```
Frontend
  ↓ POST /api/chat/send
Node Backend
  ↓ Call AI Service
FastAPI /rag-chat
  ├─ Retrieve documents from FAISS
  ├─ Generate prompt with context
  ├─ Call LLM (OpenAI)
  ├─ Analyze sentiment
  └─ Return response + sources + sentiment
Node Backend
  ├─ Save to MongoDB
  └─ Return to Frontend
Frontend
  └─ Display response + sources + sentiment indicator
```

### Risk Calculation Workflow
```
Collect Signals:
  ├─ Symptom severity (from MediSync)
  ├─ Negative emotion (from emotion detection)
  └─ Sentiment score (from chat analysis)
    ↓
POST /api/risk/calculate
    ↓
Risk Engine:
  ├─ Normalize inputs (0-1)
  ├─ Apply weights (α=0.4, β=0.4, γ=0.2)
  ├─ Calculate: Risk = α×s + β×e + γ×sen
  ├─ Classify risk level
  └─ Generate recommendations
    ↓
Save to MongoDB
    ↓
Return risk score + level + recommendations
```

### Emotion Detection Workflow
```
Frontend (Camera)
  ↓ Capture snapshot (3-5 sec interval)
  ↓ Convert to base64
POST /api/emotion/analyze
  ↓
Node Backend
  ↓ Forward to FastAPI
POST /analyze-emotion
  ↓
FastAPI:
  ├─ Decode base64 image
  ├─ Load DeepFace model
  ├─ Detect face
  ├─ Extract emotion probabilities
  └─ Calculate negative_emotion
    ↓
Return emotion_probs + negative_emotion
  ↓
Node Backend
  ├─ Save to MongoDB
  └─ Return to Frontend
Frontend
  └─ Display emotion bars + dominant emotion
```

---

## Performance Considerations

### Caching Strategy
1. **Embedding Cache** - Store computed embeddings to avoid recomputation
2. **Response Cache** - Cache LLM responses for identical queries
3. **Model Cache** - Load models once at startup

### Optimization
1. **FAISS Index** - O(log n) similarity search
2. **Async Endpoints** - Non-blocking API calls
3. **Batch Processing** - Process multiple requests efficiently
4. **Connection Pooling** - Reuse database connections

### Target Metrics
- Chat response time: < 3 seconds
- Emotion detection: < 1 second
- Risk calculation: < 500ms
- Database query: < 100ms

---

## Security Architecture

### Authentication
- JWT tokens with 24-hour expiration
- Refresh token mechanism
- Secure password hashing (bcrypt, 10 rounds)

### Authorization
- Token validation on all protected endpoints
- User-scoped data access
- Role-based access control (future)

### Data Protection
- MongoDB connection with authentication
- Environment variables for secrets
- Input validation on all endpoints
- SQL injection prevention

---

## Deployment Architecture

### Development
```
localhost:3000 (Frontend)
localhost:5000 (Backend)
localhost:8000 (AI Service)
localhost:27017 (MongoDB)
```

### Production (Docker)
```
Docker Compose:
  - frontend (React, Nginx)
  - backend (Node.js)
  - ai-service (FastAPI)
  - mongodb (MongoDB)
```

---

## Scalability Considerations

### Horizontal Scaling
- Load balancer for multiple backend instances
- MongoDB replica set for high availability
- FastAPI async for concurrent requests

### Vertical Scaling
- Increase server resources
- Optimize database queries
- Cache frequently accessed data

### Future Enhancements
- Message queue (RabbitMQ) for async tasks
- Redis for distributed caching
- Elasticsearch for chat history search
- Kubernetes for container orchestration

---

## Error Handling

### Backend Error Codes
- 400: Bad Request (invalid parameters)
- 401: Unauthorized (missing/invalid token)
- 404: Not Found (resource doesn't exist)
- 500: Server Error (internal error)

### Fallback Mechanisms
- Google Maps: Use fallback Delhi hospitals database
- OpenAI: Use mock responses if API fails
- Emotion Detection: Return neutral if face not detected

---

## Monitoring & Logging

### Logs
- Server logs: `backend-node/logs/`
- AI service logs: `ai-service/logs/`
- Database logs: MongoDB logs

### Metrics
- API response time
- Error rates
- Database query performance
- Model inference time

---

## Future Enhancements

1. **Real-time Updates** - WebSocket for live emotion tracking
2. **Advanced Analytics** - Health trend analysis
3. **Multi-language Support** - Support for Hindi, regional languages
4. **Telemedicine Integration** - Direct doctor consultation
5. **Wearable Integration** - Heart rate, sleep data
6. **Predictive Analytics** - Health risk prediction
7. **Mobile App** - Native iOS/Android apps

---

**Last Updated:** January 2024
**Version:** 1.0.0
