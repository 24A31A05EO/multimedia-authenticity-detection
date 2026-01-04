"""
Video deepfake detection service using CNN model
"""
import numpy as np
import cv2
import tensorflow as tf
from typing import Dict, List
import tempfile
import os

class VideoDetectionService:
    def __init__(self):
        self.model = None
        self.model_path = "models/video_model.h5"
        self.input_size = (224, 224)
        self.frames_to_analyze = 30  # Number of frames to sample
        self._load_model()
    
    def _load_model(self):
        """Load the CNN model for video/deepfake detection"""
        if os.path.exists(self.model_path):
            try:
                self.model = tf.keras.models.load_model(self.model_path)
                print(f"✓ Video model loaded from {self.model_path}")
            except Exception as e:
                print(f"✗ Failed to load video model: {e}")
                self.model = None
        else:
            print(f"⚠ Video model not found at {self.model_path}")
    
    def _extract_frames(self, video_bytes: bytes) -> List[np.ndarray]:
        """Extract frames from video for analysis"""
        # Save to temporary file
        with tempfile.NamedTemporaryFile(suffix=".mp4", delete=False) as tmp:
            tmp.write(video_bytes)
            tmp_path = tmp.name
        
        frames = []
        try:
            cap = cv2.VideoCapture(tmp_path)
            total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
            
            if total_frames == 0:
                raise ValueError("Could not read video frames")
            
            # Sample frames evenly
            indices = np.linspace(0, total_frames - 1, self.frames_to_analyze, dtype=int)
            
            for idx in indices:
                cap.set(cv2.CAP_PROP_POS_FRAMES, idx)
                ret, frame = cap.read()
                if ret:
                    frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                    frame = cv2.resize(frame, self.input_size)
                    frames.append(frame)
            
            cap.release()
        finally:
            os.unlink(tmp_path)
        
        return frames
    
    def _preprocess_frames(self, frames: List[np.ndarray]) -> np.ndarray:
        """Preprocess frames for model inference"""
        processed = []
        for frame in frames:
            img = frame.astype(np.float32) / 255.0
            processed.append(img)
        return np.array(processed)
    
    def _detect_face_inconsistencies(self, frames: List[np.ndarray]) -> Dict:
        """Detect face inconsistencies across frames"""
        face_cascade = cv2.CascadeClassifier(
            cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
        )
        
        face_counts = []
        face_positions = []
        
        for frame in frames:
            gray = cv2.cvtColor(frame, cv2.COLOR_RGB2GRAY)
            faces = face_cascade.detectMultiScale(gray, 1.1, 4)
            face_counts.append(len(faces))
            if len(faces) > 0:
                face_positions.append(faces[0])
        
        # Analyze consistency
        inconsistencies = {
            "face_count_variance": float(np.var(face_counts)) if face_counts else 0,
            "faces_detected": sum(1 for c in face_counts if c > 0),
            "total_frames": len(frames)
        }
        
        # Check for position jumps (potential deepfake indicator)
        if len(face_positions) > 1:
            movements = []
            for i in range(1, len(face_positions)):
                dx = abs(face_positions[i][0] - face_positions[i-1][0])
                dy = abs(face_positions[i][1] - face_positions[i-1][1])
                movements.append(np.sqrt(dx**2 + dy**2))
            inconsistencies["avg_movement"] = float(np.mean(movements))
            inconsistencies["max_movement"] = float(np.max(movements))
        
        return inconsistencies
    
    async def detect(self, video_bytes: bytes, filename: str = None) -> Dict:
        """
        Detect if a video contains deepfake content
        
        Returns:
            Dict with result, confidence, and details
        """
        try:
            # Extract frames
            frames = self._extract_frames(video_bytes)
            
            if len(frames) == 0:
                return {
                    "result": "suspicious",
                    "confidence": 0.0,
                    "details": "Could not extract frames from video"
                }
            
            # Analyze face inconsistencies
            inconsistencies = self._detect_face_inconsistencies(frames)
            
            if self.model is not None:
                # Use trained model on each frame
                preprocessed = self._preprocess_frames(frames)
                predictions = self.model.predict(preprocessed, verbose=0)
                
                # Average predictions across frames
                avg_prediction = np.mean(predictions)
                
                if avg_prediction > 0.7:
                    result = "fake"
                    confidence = avg_prediction * 100
                    details = "High probability of deepfake content detected"
                elif avg_prediction > 0.4:
                    result = "suspicious"
                    confidence = 50 + (avg_prediction - 0.4) * 100
                    details = "Some indicators of potential manipulation detected"
                else:
                    result = "authentic"
                    confidence = (1 - avg_prediction) * 100
                    details = "No significant signs of deepfake manipulation"
            else:
                # Fallback: Heuristic analysis
                score = 0.3
                details_parts = []
                
                # Check face detection consistency
                face_variance = inconsistencies.get("face_count_variance", 0)
                if face_variance > 0.5:
                    score += 0.2
                    details_parts.append("inconsistent face detection")
                
                # Check for unusual movements
                max_movement = inconsistencies.get("max_movement", 0)
                if max_movement > 50:
                    score += 0.15
                    details_parts.append("unusual face movements")
                
                # Check face detection rate
                faces_detected = inconsistencies.get("faces_detected", 0)
                total_frames = inconsistencies.get("total_frames", 1)
                face_rate = faces_detected / total_frames
                
                if 0.3 < face_rate < 0.7:
                    score += 0.1
                    details_parts.append("intermittent face visibility")
                
                confidence = abs(score - 0.5) * 200
                
                if score > 0.6:
                    result = "suspicious"
                    details = f"Heuristic analysis detected: {', '.join(details_parts) if details_parts else 'unusual patterns'}"
                else:
                    result = "authentic"
                    details = f"Analyzed {len(frames)} frames. No significant deepfake indicators found."
            
            return {
                "result": result,
                "confidence": round(confidence, 2),
                "details": details
            }
            
        except Exception as e:
            return {
                "result": "suspicious",
                "confidence": 0.0,
                "details": f"Error during analysis: {str(e)}"
            }
