# WithU247+ v3 - 14 Phase Implementation Checklist

## PHASE 1 — Repository Cleanup & Architecture
- [ ] Remove duplicate servers from original projects
- [ ] Ensure only one Node backend exists
- [ ] Ensure only one FastAPI AI service exists
- [ ] Move MediSync logic into backend-node/medisync
- [ ] Move RAG code from private-gpt into ai-service/rag
- [ ] Move CNN emotion code into ai-service/emotion
- [ ] Remove standalone scripts and unused demo files
- [ ] Verify directory structure matches specification

## PHASE 2 — Authentication System
- [x] User registration endpoint (POST /api/auth/register)
- [x] Login endpoint (POST /api/auth/login)
- [x] Password hashing with bcrypt
- [x] JWT token generation and validation
- [x] Protected API routes middleware
- [x] User session middleware
- [x] Database schema: users table
- [x] Database schema: chat_history table
- [x] Database schema: emotion_logs table
- [x] Database schema: symptom_records table
- [x] Database schema: doctor_queries table
- [ ] Verify user login works
- [ ] Verify auth token required for APIs

## PHASE 3 — RAG Medical Chat Integration
- [ ] Document chunking pipeline
- [ ] Embedding generation (OpenAI/Hugging Face)
- [ ] Vector database setup (FAISS or Chroma)
- [ ] Similarity search implementation
- [ ] LLM prompt construction
- [ ] Grounded response generation with sources
- [ ] Limit retrieval top_k ≤ 5
- [ ] Implement embedding caching
- [ ] Avoid re-embedding identical queries
- [ ] Chat response format: {response, sources, sentiment_score}
- [ ] Verify chat returns grounded medical responses
- [ ] Verify sources are included
- [ ] Verify no placeholder responses

## PHASE 4 — CNN Emotion Detection
- [ ] Load pretrained CNN model at service startup
- [ ] Implement face detection preprocessing
- [ ] Normalize image input
- [ ] Generate emotion probability vector
- [ ] Emotion output: {happy, sad, neutral, angry, etc.}
- [ ] Snapshot capture every 3–5 seconds
- [ ] No continuous webcam loop
- [ ] Async inference
- [ ] Verify emotion probabilities change based on face image

## PHASE 5 — MediSync Integration
- [ ] Symptom analysis engine
- [ ] Disease likelihood mapping
- [ ] Doctor specialty recommendation
- [ ] Medicine information lookup
- [ ] Treatment summary generation
- [ ] PubMed research retrieval
- [ ] Output: possible_conditions
- [ ] Output: recommended_specialist
- [ ] Output: treatment_summary
- [ ] Output: medical_sources
- [ ] Verify symptom analysis returns real data
- [ ] Verify doctor specialties generated correctly

## PHASE 6 — Risk Fusion Engine
- [ ] Normalize inputs (0–1 scale)
- [ ] Configurable weights α β γ
- [ ] Risk classification logic (low/medium/high)
- [ ] Escalation recommendation
- [ ] Risk formula: α(symptom) + β(emotion) + γ(sentiment)
- [ ] Low risk → self care
- [ ] Medium risk → consult doctor
- [ ] High risk → urgent attention
- [ ] Verify risk score changes with emotion and symptoms

## PHASE 7 — Backend API Implementation
- [x] POST /api/auth/register
- [x] POST /api/auth/login
- [x] POST /api/chat (skeleton with mock response)
- [x] POST /api/analyze-symptoms (skeleton with mock response)
- [x] POST /api/triage (skeleton with mock response)
- [x] POST /api/emotion (skeleton with mock response)
- [x] GET /api/nearby-doctors (skeleton with mock response)
- [x] GET /api/chat-history (skeleton with mock response)
- [ ] APIs call real backend logic (no static JSON)
- [x] Proper error handling on all endpoints

## PHASE 8 — Google Maps Doctor Finder
- [ ] Integrate Google Maps Places API
- [ ] Find nearby hospitals
- [ ] Find nearby specialists
- [ ] Return hospital ratings and distance
- [ ] Verify nearby doctors API returns real map data

## PHASE 9 — Frontend UI
- [ ] Dashboard section
- [ ] Chat assistant section
- [ ] Emotion scanner section
- [ ] Symptom analyzer section
- [ ] Doctor recommendations section
- [ ] Nearby hospitals section
- [ ] Dark theme implementation
- [ ] Horizontal card scrolling
- [ ] Loading states
- [ ] Error handling
- [ ] Verify frontend uses backend APIs (no mock data)

## PHASE 10 — Multimodal Integration
- [ ] User chats about symptoms
- [ ] RAG generates medical response
- [ ] CNN detects emotional distress
- [ ] MediSync analyzes symptoms
- [ ] Risk engine computes severity
- [ ] Doctor recommendation generated
- [ ] Nearby hospitals displayed
- [ ] Verify all modules interact correctly

## PHASE 11 — Performance Optimization
- [ ] Async communication between Node and FastAPI
- [ ] Embedding cache implementation
- [ ] CNN model preloaded at startup
- [ ] Retrieval top_k limited to 5
- [ ] Chat response < 3 seconds target
- [ ] Emotion inference < 1 second target

## PHASE 12 — End-to-End Testing
- [ ] Register user
- [ ] Login
- [ ] Chat with assistant
- [ ] Emotion scan
- [ ] Symptom analysis
- [ ] Risk score generation
- [ ] Doctor recommendation
- [ ] Nearby hospital map
- [ ] All must work without manual fixes

## PHASE 13 — Documentation
- [ ] README.md: Project overview
- [ ] README.md: Architecture diagram
- [ ] README.md: Setup instructions
- [ ] README.md: Environment variables
- [ ] README.md: Running the system
- [ ] docs/architecture.md
- [ ] docs/evaluation.md
- [ ] docs/latency-analysis.md

## PHASE 14 — Final Delivery
- [ ] withu247-plus-v3/ directory structure complete
- [ ] backend-node fully functional
- [ ] ai-service fully functional
- [ ] frontend-react fully functional
- [ ] docs complete
- [ ] docker-compose.yml working
- [ ] README.md complete
- [ ] Project runs with: docker-compose up
