import os
import base64
import time
import logging
import numpy as np
import cv2
from fastapi import FastAPI, HTTPException, Body
from pydantic import BaseModel
from typing import Dict, List, Optional
from deepface import DeepFace
import uvicorn

# Import RAG, Sentiment, and LLM components
from rag_pipeline import get_rag_pipeline, initialize_rag_pipeline
from sentiment_analyzer import get_sentiment_analyzer, initialize_sentiment_analyzer
from llm_generator import get_llm_generator, initialize_llm_generator

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ai-service")

app = FastAPI(title="WithU247+ AI Microservice")

# Global variables for caching and model preloading
emotion_cache = {
    "dominant_emotion": "neutral",
    "emotion_probabilities": {
        "angry": 0.0, "disgust": 0.0, "fear": 0.0, 
        "happy": 0.0, "sad": 0.0, "surprise": 0.0, "neutral": 1.0
    },
    "negative_emotion_score": 0.0,
    "timestamp": 0
}

# ============================================
# Startup Event - Initialize all models
# ============================================
@app.on_event("startup")
async def startup_event():
    """Initialize all AI models on startup"""
    try:
        logger.info("Initializing AI Service models...")
        
        # Initialize RAG pipeline
        logger.info("Initializing RAG pipeline...")
        initialize_rag_pipeline()
        
        # Initialize Sentiment Analyzer
        logger.info("Initializing Sentiment Analyzer...")
        initialize_sentiment_analyzer()
        
        # Initialize LLM Generator
        logger.info("Initializing LLM Generator...")
        initialize_llm_generator()
        
        # Preload DeepFace model
        logger.info("Preloading DeepFace emotion model...")
        try:
            dummy_img = np.zeros((224, 224, 3), dtype=np.uint8)
            DeepFace.analyze(dummy_img, actions=['emotion'], enforce_detection=False)
            logger.info("DeepFace model preloaded successfully.")
        except Exception as e:
            logger.warning(f"DeepFace preload warning: {e}")
        
        logger.info("All AI models initialized successfully!")
        
    except Exception as e:
        logger.error(f"Failed to initialize AI models: {e}")
        raise

# ============================================
# Request/Response Models
# ============================================

class EmotionRequest(BaseModel):
    image: str  # Base64 encoded image

class RAGChatRequest(BaseModel):
    query: str
    session_id: Optional[str] = None

class RAGChatResponse(BaseModel):
    response: str
    sources: List[Dict]
    sentiment_score: float
    emotion_data: Optional[Dict] = None

# ============================================
# Endpoints
# ============================================

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "WithU247+ AI Microservice",
        "version": "1.0.0"
    }

@app.post("/analyze-emotion")
async def analyze_emotion(request: EmotionRequest):
    """
    Analyze emotion from image using DeepFace
    
    Returns:
        - dominant_emotion: Primary detected emotion
        - emotion_probabilities: All emotion probabilities (0-1)
        - negative_emotion_score: Sum of sad + fear + angry (0-1)
    """
    global emotion_cache
    start_time = time.time()
    
    try:
        # Decode base64 image
        img_data = base64.b64decode(request.image)
        nparr = np.frombuffer(img_data, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if frame is None:
            raise ValueError("Invalid image data")

        # Run DeepFace analysis
        results = DeepFace.analyze(
            img_path=frame,
            actions=['emotion'],
            enforce_detection=False
        )
        
        # DeepFace returns a list if multiple faces are detected
        if isinstance(results, list):
            result = results[0]
        else:
            result = results

        emotion_probs = {k: float(v) / 100.0 for k, v in result['emotion'].items()}
        dominant_emotion = result['dominant_emotion']
        
        # Calculate negative emotion score: sad + fear + angry
        negative_score = float(emotion_probs.get('sad', 0) + emotion_probs.get('fear', 0) + emotion_probs.get('angry', 0))
        negative_score = min(max(negative_score, 0.0), 1.0)

        response_data = {
            "dominant_emotion": str(dominant_emotion),
            "emotion_probabilities": emotion_probs,
            "negative_emotion_score": round(float(negative_score), 4)
        }
        
        # Update cache
        emotion_cache = response_data.copy()
        emotion_cache["timestamp"] = time.time()
        
        inference_time = (time.time() - start_time) * 1000
        logger.info(f"Emotion inference time: {inference_time:.2f}ms")
        
        return response_data

    except Exception as e:
        logger.error(f"Emotion analysis failed: {e}")
        return {
            "dominant_emotion": "unknown",
            "emotion_probabilities": emotion_cache["emotion_probabilities"],
            "negative_emotion_score": 0.0,
            "error": str(e)
        }

@app.post("/rag-chat", response_model=RAGChatResponse)
async def rag_chat(request: RAGChatRequest):
    """
    RAG-powered medical chat endpoint
    
    Flow:
    1. Retrieve relevant medical documents
    2. Generate grounded prompt
    3. Generate LLM response
    4. Analyze sentiment
    5. Return response with sources and sentiment
    """
    try:
        logger.info(f"Processing RAG chat query: {request.query}")
        start_time = time.time()
        
        # Step 1: Retrieve relevant documents
        rag_pipeline = get_rag_pipeline()
        retrieved_docs = rag_pipeline.retrieve_documents(request.query, top_k=3)
        
        if not retrieved_docs:
            logger.warning("No relevant documents retrieved")
        
        # Step 2: Generate grounded prompt
        prompt = rag_pipeline.generate_prompt(request.query, retrieved_docs)
        
        # Step 3: Generate LLM response
        llm_generator = get_llm_generator()
        llm_result = llm_generator.generate_response(prompt, max_tokens=500)
        response_text = llm_result["response"]
        
        # Step 4: Analyze sentiment
        sentiment_analyzer = get_sentiment_analyzer()
        sentiment_result = sentiment_analyzer.analyze(request.query)
        sentiment_score = sentiment_result["sentiment_score"]
        
        # Step 5: Extract sources
        sources = rag_pipeline.get_sources(retrieved_docs)
        
        # Calculate total inference time
        total_time = (time.time() - start_time) * 1000
        logger.info(f"RAG chat inference time: {total_time:.2f}ms")
        
        return RAGChatResponse(
            response=response_text,
            sources=sources,
            sentiment_score=sentiment_score,
            emotion_data={
                "dominant_emotion": emotion_cache["dominant_emotion"],
                "negative_emotion_score": emotion_cache["negative_emotion_score"]
            }
        )
        
    except Exception as e:
        logger.error(f"RAG chat failed: {e}")
        raise HTTPException(status_code=500, detail=f"RAG chat processing failed: {str(e)}")

@app.post("/chat")
async def chat_endpoint(request: Dict):
    """
    Legacy chat endpoint - redirects to RAG chat
    """
    try:
        message = request.get("message", "")
        if not message:
            raise HTTPException(status_code=400, detail="Message is required")
        
        rag_request = RAGChatRequest(query=message)
        return await rag_chat(rag_request)
        
    except Exception as e:
        logger.error(f"Chat endpoint error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ============================================
# Main
# ============================================

if __name__ == "__main__":
    port = int(os.environ.get("AI_SERVICE_PORT", 8000))
    logger.info(f"Starting AI Service on port {port}")
    uvicorn.run(app, host="0.0.0.0", port=port)
