import requests
import base64
import numpy as np
import cv2
import time

def test_emotion_detection():
    print("Testing Emotion Detection...")
    # Create a dummy image (black frame)
    dummy_img = np.zeros((224, 224, 3), dtype=np.uint8)
    _, buffer = cv2.imencode('.jpg', dummy_img)
    img_base64 = base64.b64encode(buffer).decode('utf-8')
    
    try:
        response = requests.post("http://localhost:8000/analyze-emotion", json={"image": img_base64})
        print(f"Response: {response.json()}")
        assert response.status_code == 200
        assert "dominant_emotion" in response.json()
        print("Emotion Detection Test Passed!")
    except Exception as e:
        print(f"Emotion Detection Test Failed: {e}")

def test_chat_endpoint():
    print("\nTesting Chat Endpoint...")
    try:
        response = requests.post("http://localhost:8000/chat", json={
            "message": "I feel very anxious today.",
            "session_id": "test-session"
        })
        print(f"Response: {response.json()}")
        assert response.status_code == 200
        assert "rag_response" in response.json()
        print("Chat Endpoint Test Passed!")
    except Exception as e:
        print(f"Chat Endpoint Test Failed: {e}")

if __name__ == "__main__":
    # Note: This script assumes the AI service is running on localhost:8000
    # In a real test environment, we would start the service first.
    print("AI Service Test Script")
    test_emotion_detection()
    test_chat_endpoint()
