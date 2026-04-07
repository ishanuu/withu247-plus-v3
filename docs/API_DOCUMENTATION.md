# WithU247+ API Documentation

## Base URL
```
http://localhost:5000
```

## Authentication
All endpoints (except `/api/auth/*`) require JWT token in Authorization header:
```
Authorization: Bearer <jwt_token>
```

---

## 1. AUTHENTICATION ENDPOINTS

### Register User
**POST** `/api/auth/register`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

---

### Login User
**POST** `/api/auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

---

## 2. CHAT ENDPOINTS

### Send Chat Message
**POST** `/api/chat/send`

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "message": "I have chest pain and fatigue"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "userMessage": "I have chest pain and fatigue",
    "aiResponse": "Chest pain combined with fatigue can indicate several conditions...",
    "sources": [
      "PubMed: Chest Pain - A Comprehensive Review",
      "Medical Guideline: Cardiology Assessment"
    ],
    "sentimentScore": 0.35,
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

---

### Get Chat History
**GET** `/api/chat/history`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Messages per page (default: 20)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": "msg_id",
        "userMessage": "I have chest pain",
        "aiResponse": "...",
        "sentimentScore": 0.35,
        "timestamp": "2024-01-15T10:30:00Z"
      }
    ],
    "total": 5,
    "page": 1,
    "pages": 1
  }
}
```

---

### Clear Chat History
**DELETE** `/api/chat/clear`

**Response (200):**
```json
{
  "success": true,
  "message": "Chat history cleared successfully"
}
```

---

## 3. EMOTION DETECTION ENDPOINTS

### Analyze Emotion
**POST** `/api/emotion/analyze`

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD..."
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "dominantEmotion": "sad",
    "emotionProbs": {
      "happy": 0.12,
      "sad": 0.51,
      "neutral": 0.25,
      "angry": 0.07,
      "fear": 0.03,
      "disgust": 0.01,
      "surprise": 0.01
    },
    "negativeEmotionScore": 0.61,
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

---

### Get Emotion History
**GET** `/api/emotion/history`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Records per page (default: 20)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "emotions": [
      {
        "id": "emotion_id",
        "dominantEmotion": "sad",
        "emotionProbs": {...},
        "negativeEmotionScore": 0.61,
        "timestamp": "2024-01-15T10:30:00Z"
      }
    ],
    "total": 15,
    "page": 1,
    "pages": 1
  }
}
```

---

### Get Emotion Statistics
**GET** `/api/emotion/stats`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalRecordings": 15,
    "averageNegativeScore": 0.45,
    "dominantEmotionTrend": "sad",
    "emotionDistribution": {
      "happy": 0.15,
      "sad": 0.40,
      "neutral": 0.30,
      "angry": 0.10,
      "fear": 0.03,
      "disgust": 0.01,
      "surprise": 0.01
    },
    "lastUpdated": "2024-01-15T10:30:00Z"
  }
}
```

---

### Clear Emotion Logs
**DELETE** `/api/emotion/clear`

**Response (200):**
```json
{
  "success": true,
  "message": "Emotion logs cleared successfully"
}
```

---

## 4. MEDISYNC ENDPOINTS

### Analyze Symptoms
**POST** `/api/medisync/analyze-symptoms`

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "symptoms": ["chest pain", "shortness of breath", "fatigue"]
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "possibleConditions": [
      {
        "condition": "Myocardial Infarction",
        "likelihood": 0.85,
        "severity": 0.95,
        "urgency": "CRITICAL"
      },
      {
        "condition": "Angina",
        "likelihood": 0.70,
        "severity": 0.75,
        "urgency": "HIGH"
      }
    ],
    "recommendedSpecialist": "Cardiologist",
    "treatmentSummary": "Immediate medical attention required. Contact emergency services.",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

---

### Get Doctor Recommendations (Triage)
**POST** `/api/medisync/triage`

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "symptoms": ["chest pain", "shortness of breath"]
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "recommendedSpecialty": "Cardiology",
    "recommendedDoctor": "Cardiologist",
    "urgencyLevel": "HIGH",
    "description": "Cardiology specializes in heart and cardiovascular diseases",
    "commonTreatments": ["ECG", "Stress Test", "Angiography"]
  }
}
```

---

### Get Treatment Guidelines
**POST** `/api/medisync/treatment`

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "condition": "Myocardial Infarction"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "condition": "Myocardial Infarction",
    "description": "Heart attack - emergency condition",
    "immediateActions": [
      "Call emergency services (911/100)",
      "Chew aspirin if available",
      "Rest and stay calm"
    ],
    "treatments": ["Thrombolytic therapy", "Angioplasty", "Stent placement"],
    "medications": ["Aspirin", "Clopidogrel", "Beta-blockers"],
    "recovery": "6-8 weeks typical recovery with cardiac rehabilitation"
  }
}
```

---

### Get Medical Research
**GET** `/api/medisync/research`

**Query Parameters:**
- `condition` (required): Medical condition to research
- `limit` (optional): Number of results (default: 5)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "condition": "Myocardial Infarction",
    "articles": [
      {
        "title": "Acute Myocardial Infarction: Current Management Strategies",
        "source": "PubMed",
        "year": 2023,
        "url": "https://pubmed.ncbi.nlm.nih.gov/...",
        "summary": "Latest evidence-based management approaches for MI"
      }
    ]
  }
}
```

---

## 5. RISK ENGINE ENDPOINTS

### Calculate Risk Score
**POST** `/api/risk/calculate`

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "symptomSeverity": 0.85,
  "negativeEmotionScore": 0.61,
  "sentimentScore": 0.35
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "riskScore": 0.68,
    "riskLevel": "HIGH",
    "signals": {
      "symptomSeverity": 0.85,
      "negativeEmotionScore": 0.61,
      "sentimentScore": 0.35
    },
    "weights": {
      "alpha": 0.4,
      "beta": 0.4,
      "gamma": 0.2
    },
    "recommendation": "Consult with a healthcare professional",
    "escalation": false
  }
}
```

---

### Generate Risk Report
**POST** `/api/risk/report`

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "symptomSeverity": 0.85,
  "negativeEmotionScore": 0.61,
  "sentimentScore": 0.35,
  "symptoms": ["chest pain", "fatigue"]
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "riskScore": 0.68,
    "riskLevel": "HIGH",
    "healthRecommendations": [
      "Schedule appointment with cardiologist",
      "Monitor vital signs",
      "Avoid strenuous activities"
    ],
    "escalationRecommendation": "Consider urgent medical consultation",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

---

### Get Risk Trend
**GET** `/api/risk/trend`

**Query Parameters:**
- `days` (optional): Number of days to analyze (default: 7)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "trend": [
      {
        "date": "2024-01-15",
        "riskScore": 0.68,
        "riskLevel": "HIGH"
      },
      {
        "date": "2024-01-14",
        "riskScore": 0.55,
        "riskLevel": "MODERATE"
      }
    ],
    "averageRisk": 0.62,
    "trend": "increasing"
  }
}
```

---

### Get Latest Risk Assessment
**GET** `/api/risk/latest`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "riskScore": 0.68,
    "riskLevel": "HIGH",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

---

### Get Risk History
**GET** `/api/risk/history`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Records per page (default: 20)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "records": [
      {
        "id": "risk_id",
        "riskScore": 0.68,
        "riskLevel": "HIGH",
        "signals": {...},
        "timestamp": "2024-01-15T10:30:00Z"
      }
    ],
    "total": 25,
    "page": 1,
    "pages": 2
  }
}
```

---

## 6. GOOGLE MAPS ENDPOINTS

### Find Nearby Hospitals
**GET** `/api/maps/nearby-hospitals`

**Query Parameters:**
- `latitude` (required): User latitude
- `longitude` (required): User longitude
- `radius` (optional): Search radius in meters (default: 5000)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "hospitals": [
      {
        "name": "AIIMS Delhi",
        "address": "Ansari Nagar, New Delhi",
        "lat": 28.5684,
        "lng": 77.2093,
        "rating": 4.7,
        "distance": 2.5,
        "type": "Government Hospital"
      }
    ],
    "total": 8
  }
}
```

---

### Find Doctors by Specialty
**GET** `/api/maps/doctors-by-specialty`

**Query Parameters:**
- `specialty` (required): Doctor specialty (cardiologist, dermatologist, neurologist, psychiatrist, orthopedist, pediatrician, gynecologist)
- `latitude` (required): User latitude
- `longitude` (required): User longitude
- `radius` (optional): Search radius in meters (default: 5000)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "doctors": [
      {
        "name": "Dr. Rajesh Kumar",
        "specialty": "Cardiologist",
        "address": "Ansari Nagar, New Delhi",
        "lat": 28.5684,
        "lng": 77.2093,
        "rating": 4.8,
        "distance": 2.5,
        "experience": "15+ years"
      }
    ],
    "total": 5,
    "specialty": "Cardiologist"
  }
}
```

---

### Get Place Details
**GET** `/api/maps/place-details`

**Query Parameters:**
- `placeId` (required): Google Maps place ID

**Response (200):**
```json
{
  "success": true,
  "data": {
    "details": {
      "name": "AIIMS Delhi",
      "rating": 4.7,
      "address": "Ansari Nagar, New Delhi",
      "phone": "+91-11-26589123",
      "website": "https://www.aiims.edu",
      "hours": [
        "Monday: 24 hours",
        "Tuesday: 24 hours"
      ],
      "reviews": [
        {
          "author": "User Name",
          "rating": 5,
          "text": "Excellent service"
        }
      ]
    }
  }
}
```

---

### Geocode Address
**GET** `/api/maps/geocode`

**Query Parameters:**
- `address` (required): Address to geocode

**Response (200):**
```json
{
  "success": true,
  "data": {
    "lat": 28.5684,
    "lng": 77.2093,
    "address": "Ansari Nagar, New Delhi, Delhi 110029, India"
  }
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "Invalid request parameters"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": "Invalid or missing authentication token"
}
```

### 500 Server Error
```json
{
  "success": false,
  "error": "Internal server error",
  "details": "Error message"
}
```

---

## Data Flow Summary

1. **User Registration/Login** → Get JWT token
2. **Chat** → Send message → RAG processes → Returns response + sources + sentiment
3. **Emotion Detection** → Send image → DeepFace analyzes → Returns emotion probabilities
4. **Symptom Analysis** → Send symptoms → MediSync maps → Returns conditions + specialist
5. **Risk Calculation** → Combine signals → Risk engine calculates → Returns risk score
6. **Maps** → Get location → Find hospitals/doctors → Returns nearby facilities

---

## Environment Variables Required

```
MONGODB_URI=mongodb://localhost:27017/withu247-plus
JWT_SECRET=your_jwt_secret_key_here
AI_SERVICE_URL=http://localhost:8000
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
```

---

## Testing with cURL Examples

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com","password":"pass123"}'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"pass123"}'
```

### Send Chat Message
```bash
curl -X POST http://localhost:5000/api/chat/send \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message":"I have chest pain"}'
```

### Find Nearby Hospitals
```bash
curl -X GET "http://localhost:5000/api/maps/nearby-hospitals?latitude=28.7041&longitude=77.1025&radius=5000" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Notes

- All timestamps are in ISO 8601 format (UTC)
- All coordinates use WGS84 (latitude, longitude)
- Distances are returned in kilometers
- Risk scores are normalized to 0-1 range
- Emotion probabilities sum to 1.0
