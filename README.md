# WithU247+ - Unified Multimodal AI Health Assistant

A comprehensive AI-powered health assistant platform that combines medical knowledge retrieval (RAG), emotion detection (CNN), symptom analysis, and risk assessment into a unified system.

## 🎯 System Overview

WithU247+ integrates three core AI capabilities:

1. **RAG Medical Chat** - Retrieves medical knowledge and provides evidence-based responses
2. **Emotion Detection** - Analyzes facial emotions using DeepFace CNN
3. **MediSync Integration** - Maps symptoms to conditions and recommends specialists

The system uses a **microservice architecture**:
- **Node.js Backend** - API orchestration, risk fusion, authentication
- **FastAPI AI Service** - RAG, sentiment analysis, emotion detection
- **MongoDB** - User data, chat history, emotion logs, risk assessments

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    React Frontend (Your UI)                  │
│  (Netflix-style dark theme, horizontal scrolling cards)     │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
        ┌────────────────────────────┐
        │   Node.js Backend (Port 5000)│
        │  ├─ Authentication (JWT)    │
        │  ├─ API Orchestration       │
        │  ├─ Risk Fusion Engine      │
        │  ├─ MediSync Integration    │
        │  └─ Google Maps Integration │
        └────────────┬────────────────┘
                     │
        ┌────────────┴────────────┐
        ▼                         ▼
    ┌─────────────┐        ┌──────────────┐
    │  MongoDB    │        │ FastAPI      │
    │  (Port      │        │ AI Service   │
    │  27017)     │        │ (Port 8000)  │
    │             │        │              │
    │ • Users     │        │ • RAG        │
    │ • Chat      │        │ • Sentiment  │
    │ • Emotions  │        │ • Emotion    │
    │ • Symptoms  │        │   Detection  │
    │ • Risk Logs │        │              │
    └─────────────┘        └──────────────┘
```

---

## 📋 Features

### 1. **Authentication System**
- User registration and login
- JWT token-based authentication
- Password hashing with bcrypt

### 2. **RAG Medical Chat**
- Document retrieval using sentence-transformers embeddings
- FAISS vector database for similarity search
- LLM response generation with medical context
- Source attribution for retrieved documents
- Sentiment analysis of user messages

### 3. **Emotion Detection**
- DeepFace CNN for facial emotion recognition
- 7-emotion classification (happy, sad, neutral, angry, fear, disgust, surprise)
- Normalized emotion probabilities (0-1 scale)
- Negative emotion scoring for risk calculation

### 4. **Symptom Analysis**
- 50+ symptoms mapped to medical conditions
- Disease likelihood scoring
- Severity classification
- Doctor specialty recommendations
- PubMed research retrieval

### 5. **Risk Fusion Engine**
- Weighted risk calculation: Risk = α(symptom) + β(emotion) + γ(sentiment)
- Input normalization and validation
- Risk level classification (MINIMAL, LOW, MODERATE, HIGH, CRITICAL)
- Escalation recommendations
- Risk trend monitoring

### 6. **Google Maps Integration**
- Find nearby hospitals in Delhi
- Find specialists by medical specialty
- Distance calculation and rating display
- Fallback database for offline mode

---

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- Python 3.10+
- MongoDB 4.4+
- Google Maps API Key (optional, fallback available)
- OpenAI API Key (optional, fallback available)

### 1. Clone Repository
```bash
git clone https://github.com/ishanuu/withu247-plus-v3.git
cd withu247-plus-v3
```

### 2. Setup Backend (Node.js)

```bash
cd backend-node
npm install
```

Create `.env` file:
```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/withu247-plus
JWT_SECRET=your_jwt_secret_key_here
AI_SERVICE_URL=http://localhost:8000
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
```

Start backend:
```bash
npm start
```

Backend will run on `http://localhost:5000`

### 3. Setup AI Service (FastAPI)

```bash
cd ai-service
pip install -r requirements.txt
```

Start AI service:
```bash
python main.py
```

AI service will run on `http://localhost:8000`

### 4. Setup Frontend (React)

```bash
cd frontend-react
npm install
npm start
```

Frontend will run on `http://localhost:3000`

---

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Chat
- `POST /api/chat/send` - Send message to RAG assistant
- `GET /api/chat/history` - Get chat history
- `DELETE /api/chat/clear` - Clear chat history

### Emotion
- `POST /api/emotion/analyze` - Analyze emotion from image
- `GET /api/emotion/history` - Get emotion history
- `GET /api/emotion/stats` - Get emotion statistics
- `DELETE /api/emotion/clear` - Clear emotion logs

### MediSync
- `POST /api/medisync/analyze-symptoms` - Analyze symptoms
- `POST /api/medisync/triage` - Get doctor recommendations
- `POST /api/medisync/treatment` - Get treatment guidelines
- `GET /api/medisync/research` - Get medical research

### Risk Engine
- `POST /api/risk/calculate` - Calculate risk score
- `POST /api/risk/report` - Generate risk report
- `GET /api/risk/trend` - Get risk trend
- `GET /api/risk/latest` - Get latest risk assessment
- `GET /api/risk/history` - Get risk history

### Maps
- `GET /api/maps/nearby-hospitals` - Find nearby hospitals
- `GET /api/maps/doctors-by-specialty` - Find doctors by specialty
- `GET /api/maps/place-details` - Get place details
- `GET /api/maps/geocode` - Geocode address

**Full API documentation:** See [API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md)

---

## 🔄 Data Flow Example

### User Chat Workflow
1. User sends message: "I have chest pain and fatigue"
2. Frontend → `POST /api/chat/send`
3. Node backend receives message
4. Node calls FastAPI → `POST /rag-chat`
5. FastAPI RAG pipeline:
   - Retrieves relevant medical documents
   - Analyzes sentiment of user message
   - Generates grounded response using LLM
6. Returns: response + sources + sentiment_score
7. Node backend saves to MongoDB
8. Frontend displays response with sources

### Risk Calculation Workflow
1. Collect signals:
   - Symptom severity from MediSync analysis
   - Negative emotion from emotion detection
   - Sentiment score from chat analysis
2. Call `POST /api/risk/calculate`
3. Risk engine normalizes inputs (0-1 scale)
4. Calculates: Risk = 0.4×symptom + 0.4×emotion + 0.2×sentiment
5. Classifies risk level and provides recommendations
6. Saves to MongoDB for trend analysis

---

## 🧪 Testing

### Test User Registration
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "testpass123"
  }'
```

### Test Chat
```bash
curl -X POST http://localhost:5000/api/chat/send \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "I have chest pain"}'
```

### Test Nearby Hospitals
```bash
curl -X GET "http://localhost:5000/api/maps/nearby-hospitals?latitude=28.7041&longitude=77.1025" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 📊 Database Schema

### Users
- `id` - User ID
- `name` - User name
- `email` - User email
- `password` - Hashed password
- `createdAt` - Registration timestamp

### ChatHistory
- `id` - Message ID
- `userId` - User ID
- `userMessage` - User input
- `aiResponse` - AI response
- `sources` - Retrieved sources
- `sentimentScore` - Message sentiment
- `timestamp` - Message timestamp

### EmotionLog
- `id` - Emotion record ID
- `userId` - User ID
- `dominantEmotion` - Primary emotion
- `emotionProbs` - Emotion probabilities
- `negativeEmotionScore` - Negative emotion sum
- `timestamp` - Recording timestamp

### SymptomRecord
- `id` - Record ID
- `userId` - User ID
- `symptoms` - User symptoms
- `possibleConditions` - Mapped conditions
- `recommendedSpecialist` - Doctor specialty
- `timestamp` - Record timestamp

### RiskLog
- `id` - Risk record ID
- `userId` - User ID
- `riskScore` - Calculated risk (0-1)
- `riskLevel` - Classification
- `signals` - Symptom, emotion, sentiment
- `timestamp` - Assessment timestamp

---

## 🔐 Security

- JWT token-based authentication
- Password hashing with bcrypt (10 salt rounds)
- All endpoints require authentication (except `/api/auth/*`)
- Input validation on all endpoints
- Error messages don't expose sensitive information
- CORS configuration for frontend

---

## 📈 Performance

- Embedding cache to avoid re-computing
- FAISS index for O(log n) similarity search
- Response caching in LLM generator
- Async FastAPI endpoints
- Model preloading at startup
- Target response time: < 3 seconds

---

## 🌍 Delhi-Specific Features

### Hospitals Database
- AIIMS Delhi
- Max Healthcare - Saket
- Apollo Hospital - Delhi
- Fortis Hospital - Vasant Kunj
- Sir Ganga Ram Hospital
- Indraprastha Apollo Hospital

### Specialists Database
- Cardiologists
- Dermatologists
- Neurologists
- Psychiatrists
- Orthopedists
- Pediatricians
- Gynecologists

---

## 📝 Environment Variables

```
# Backend
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/withu247-plus

# Authentication
JWT_SECRET=your_jwt_secret_key_here

# AI Service
AI_SERVICE_URL=http://localhost:8000

# Google Maps
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# OpenAI
OPENAI_API_KEY=your_openai_api_key_here
```

---

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Push to GitHub
5. Create a pull request

---

## 📄 License

MIT License - See LICENSE file for details

---

## 📞 Support

For issues or questions:
1. Check [API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md)
2. Review [ARCHITECTURE.md](docs/architecture.md)
3. Check existing GitHub issues
4. Create a new issue with detailed description

---

## 🎯 Next Steps

1. **Frontend Development** - Build Netflix-style UI using React
2. **Testing** - End-to-end testing of all workflows
3. **Deployment** - Docker setup and cloud deployment
4. **Monitoring** - Add logging and performance monitoring
5. **Analytics** - Track user health trends

---

**Built with ❤️ for health and wellness**
