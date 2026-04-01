"""
LLM Response Generator for Medical Assistant
Generates medical responses using OpenAI API or local LLMs
"""

import os
import logging
from typing import Dict, Optional
import openai

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("llm-generator")

class LLMGenerator:
    """
    LLM response generator for medical queries
    """
    
    def __init__(self, api_key: Optional[str] = None, model: str = "gpt-3.5-turbo"):
        """
        Initialize LLM generator
        
        Args:
            api_key: OpenAI API key (uses env var if not provided)
            model: Model to use (gpt-3.5-turbo, gpt-4, etc.)
        """
        self.api_key = api_key or os.environ.get("OPENAI_API_KEY")
        self.model = model
        self.response_cache = {}
        
        if self.api_key:
            openai.api_key = self.api_key
            logger.info(f"LLM Generator initialized with model: {model}")
        else:
            logger.warning("No OpenAI API key provided. Using mock responses.")
    
    def generate_response(self, prompt: str, max_tokens: int = 500) -> Dict:
        """
        Generate a response using the LLM
        
        Args:
            prompt: Input prompt for the LLM
            max_tokens: Maximum tokens in the response
            
        Returns:
            Dictionary with generated response and metadata
        """
        try:
            # Check cache first
            cache_key = hash(prompt)
            if cache_key in self.response_cache:
                logger.info("Using cached LLM response")
                return self.response_cache[cache_key]
            
            if not self.api_key:
                # Return mock response if no API key
                return self._generate_mock_response(prompt)
            
            # Call OpenAI API
            response = openai.ChatCompletion.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are a knowledgeable medical assistant. Provide accurate, helpful medical information based on the context provided. Always recommend consulting a healthcare professional for serious concerns."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                max_tokens=max_tokens,
                temperature=0.7,
                top_p=0.9
            )
            
            generated_text = response.choices[0].message.content
            
            result = {
                "response": generated_text,
                "model": self.model,
                "tokens_used": response.usage.total_tokens,
                "cached": False
            }
            
            # Cache the response
            self.response_cache[cache_key] = result
            
            logger.info(f"Generated response using {self.model} ({response.usage.total_tokens} tokens)")
            return result
            
        except Exception as e:
            logger.error(f"LLM generation failed: {e}")
            return {
                "response": "I apologize, but I encountered an error generating a response. Please try again or consult a healthcare professional.",
                "model": self.model,
                "error": str(e),
                "cached": False
            }
    
    def _generate_mock_response(self, prompt: str) -> Dict:
        """
        Generate a mock response when API key is not available
        
        Args:
            prompt: Input prompt
            
        Returns:
            Mock response dictionary
        """
        mock_response = """Based on the medical information provided, here are some general insights:

1. **Understanding Your Condition**: The symptoms you describe are commonly associated with several conditions. However, a proper diagnosis requires a healthcare professional's evaluation.

2. **Recommended Actions**:
   - Monitor your symptoms closely
   - Keep a record of when symptoms occur and their severity
   - Maintain a healthy lifestyle with proper rest and nutrition
   - Consult a healthcare provider if symptoms persist or worsen

3. **When to Seek Immediate Care**:
   - If you experience severe symptoms
   - If symptoms significantly impact your daily activities
   - If symptoms persist for more than a few days
   - If you develop new or concerning symptoms

4. **General Health Tips**:
   - Stay hydrated
   - Get adequate sleep
   - Exercise regularly
   - Manage stress through relaxation techniques
   - Maintain a balanced diet

Please consult with a qualified healthcare professional for personalized medical advice and treatment options."""
        
        return {
            "response": mock_response,
            "model": "mock",
            "cached": False,
            "note": "This is a mock response. Please provide an OpenAI API key for real responses."
        }
    
    def generate_medical_summary(self, context: str, query: str) -> str:
        """
        Generate a concise medical summary
        
        Args:
            context: Medical context
            query: User query
            
        Returns:
            Summary text
        """
        summary_prompt = f"""Based on the following medical context, provide a concise summary addressing the user's query.

Context: {context}

Query: {query}

Provide a brief, clear summary (2-3 sentences) that directly addresses the query."""
        
        result = self.generate_response(summary_prompt, max_tokens=150)
        return result["response"]
    
    def clear_cache(self):
        """Clear the response cache"""
        self.response_cache.clear()
        logger.info("LLM response cache cleared")


# Global LLM generator instance
llm_generator = None

def initialize_llm_generator():
    """Initialize the global LLM generator"""
    global llm_generator
    try:
        api_key = os.environ.get("OPENAI_API_KEY")
        model = os.environ.get("LLM_MODEL", "gpt-3.5-turbo")
        llm_generator = LLMGenerator(api_key=api_key, model=model)
        logger.info("LLM generator initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize LLM generator: {e}")
        # Don't raise, allow mock responses to work

def get_llm_generator() -> LLMGenerator:
    """Get the global LLM generator instance"""
    global llm_generator
    if llm_generator is None:
        initialize_llm_generator()
    return llm_generator
