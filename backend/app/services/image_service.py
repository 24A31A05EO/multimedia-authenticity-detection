import numpy as np
import cv2
import tensorflow as tf
from typing import Dict
import os

class ImageDetectionService:
    def __init__(self):
        self.model = None
        self.model_path = "models/image_model.h5"
        self.input_size = (224, 224)
        self._load_model()
    
    def _load_model(self):
        if os.path.exists(self.model_path):
            try:
                self.model = tf.keras.models.load_model(self.model_path)
                print(f"✓ Image model loaded from {self.model_path}")
            except Exception as e:
                print(f"✗ Failed to load image model: {e}")
                self.model = None
        else:
            print(f"⚠ Image model not found at {self.model_path}")
    
    def _preprocess_image(self, image_bytes: bytes) -> np.ndarray:
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is None:
            raise ValueError("Failed to decode image")
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        img = cv2.resize(img, self.input_size)
        img = img.astype(np.float32) / 255.0
        return np.expand_dims(img, axis=0)
    
    def _analyze_image_features(self, image_bytes: bytes) -> Dict:
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is None:
            return {"error": "Failed to decode image"}
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
        hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
        edges = cv2.Canny(gray, 100, 200)
        return {
            "sharpness": float(laplacian_var),
            "saturation_mean": float(np.mean(hsv[:, :, 1])),
            "value_mean": float(np.mean(hsv[:, :, 2])),
            "edge_density": float(np.sum(edges > 0) / edges.size)
        }

    # Synchronous detection
    def detect(self, image_bytes: bytes, filename: str = None) -> Dict:
        try:
            features = self._analyze_image_features(image_bytes)
            if self.model:
                preprocessed = self._preprocess_image(image_bytes)
                prediction = self.model.predict(preprocessed, verbose=0)
                fake_prob = float(prediction[0][1]) if len(prediction[0]) > 1 else float(prediction[0][0])
                confidence = fake_prob * 100 if fake_prob > 0.5 else (1 - fake_prob) * 100
                if fake_prob > 0.7:
                    return {"result": "fake", "confidence": confidence, "details": "High probability of AI-generated content detected"}
                elif fake_prob > 0.4:
                    return {"result": "suspicious", "confidence": confidence, "details": "Some indicators of potential manipulation detected"}
                else:
                    return {"result": "authentic", "confidence": confidence, "details": "No significant signs of manipulation detected"}
            else:
                sharpness = features.get("sharpness", 0)
                edge_density = features.get("edge_density", 0)
                score = 0.5
                if sharpness < 100: score += 0.2
                elif sharpness > 1000: score -= 0.1
                if edge_density < 0.05 or edge_density > 0.4: score += 0.15
                confidence = abs(score - 0.5) * 200
                if score > 0.6:
                    return {"result": "suspicious", "confidence": confidence, "details": f"Heuristic analysis detected unusual patterns. Sharpness: {sharpness:.1f}, Edge density: {edge_density:.3f}"}
                else:
                    return {"result": "authentic", "confidence": confidence, "details": "Heuristic analysis found no significant anomalies"}
        except Exception as e:
            return {"result": "suspicious", "confidence": 0.0, "details": f"Error during analysis: {str(e)}"}


