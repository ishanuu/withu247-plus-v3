"""
Sentiment Analysis Module for Medical Assistant
Analyzes emotional tone in user messages and responses
"""

import logging
from typing import Dict, Tuple
from transformers import pipeline

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("sentiment-analyzer")

class SentimentAnalyzer:
    """
    Sentiment analyzer using transformer-based models
    """
    
    def __init__(self, model_name: str = "distilbert-base-uncased-finetuned-sst-2"):
        """
        Initialize sentiment analyzer with a pretrained model
        
        Args:
            model_name: HuggingFace model identifier for sentiment analysis
        """
        self.model_name = model_name
        self.pipeline = None
        self.cache = {}
        
        logger.info(f"Initializing Sentiment Analyzer with model: {model_name}")
        self._initialize_model()
    
    def _initialize_model(self):
        """Load the sentiment analysis model"""
        try:
            self.pipeline = pipeline(
                "sentiment-analysis",
                model=self.model_name,
                device=-1  # Use CPU, set to 0 for GPU
            )
            logger.info("Sentiment analysis model loaded successfully")
        except Exception as e:
            logger.error(f"Failed to load sentiment model: {e}")
            raise
    
    def analyze(self, text: str) -> Dict:
        """
        Analyze sentiment of the given text
        
        Args:
            text: Text to analyze
            
        Returns:
            Dictionary with sentiment label and score
        """
        try:
            # Check cache first
            if text in self.cache:
                return self.cache[text]
            
            # Truncate text if too long (max 512 tokens for BERT)
            if len(text) > 512:
                text = text[:512]
            
            # Get sentiment prediction
            result = self.pipeline(text)[0]
            
            # Normalize score to 0-1 range
            # NEGATIVE (0-0.5), POSITIVE (0.5-1)
            label = result["label"]
            score = result["score"]
            
            # Convert to 0-1 scale where 1 is positive, 0 is negative
            if label == "POSITIVE":
                sentiment_score = score
            else:  # NEGATIVE
                sentiment_score = 1 - score
            
            response = {
                "label": label,
                "score": round(score, 4),
                "sentiment_score": round(sentiment_score, 4)
            }
            
            # Cache the result
            self.cache[text] = response
            
            logger.info(f"Sentiment analysis: {label} ({score:.4f}) for text: {text[:50]}...")
            return response
            
        except Exception as e:
            logger.error(f"Sentiment analysis failed: {e}")
            # Return neutral sentiment on error
            return {
                "label": "NEUTRAL",
                "score": 0.5,
                "sentiment_score": 0.5,
                "error": str(e)
            }
    
    def analyze_batch(self, texts: list) -> list:
        """
        Analyze sentiment for multiple texts
        
        Args:
            texts: List of texts to analyze
            
        Returns:
            List of sentiment analysis results
        """
        results = []
        for text in texts:
            results.append(self.analyze(text))
        return results
    
    def get_emotional_tone(self, text: str) -> str:
        """
        Get human-readable emotional tone
        
        Args:
            text: Text to analyze
            
        Returns:
            Emotional tone description
        """
        result = self.analyze(text)
        score = result["sentiment_score"]
        
        if score >= 0.7:
            return "very_positive"
        elif score >= 0.55:
            return "positive"
        elif score >= 0.45:
            return "neutral"
        elif score >= 0.3:
            return "negative"
        else:
            return "very_negative"
    
    def clear_cache(self):
        """Clear the sentiment analysis cache"""
        self.cache.clear()
        logger.info("Sentiment analysis cache cleared")


# Global sentiment analyzer instance
sentiment_analyzer = None

def initialize_sentiment_analyzer():
    """Initialize the global sentiment analyzer"""
    global sentiment_analyzer
    try:
        sentiment_analyzer = SentimentAnalyzer()
        logger.info("Sentiment analyzer initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize sentiment analyzer: {e}")
        raise

def get_sentiment_analyzer() -> SentimentAnalyzer:
    """Get the global sentiment analyzer instance"""
    global sentiment_analyzer
    if sentiment_analyzer is None:
        initialize_sentiment_analyzer()
    return sentiment_analyzer
