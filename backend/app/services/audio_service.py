"""
Audio detection service using spectrogram-based CNN model
"""
import numpy as np
import librosa
import tensorflow as tf
from typing import Dict
import tempfile
import os

class AudioDetectionService:
    def __init__(self):
        self.model = None
        self.model_path = "models/audio_model.h5"
        self.sample_rate = 22050
        self.duration = 10  # seconds to analyze
        self._load_model()
    
    def _load_model(self):
        """Load the spectrogram-based CNN model for audio detection"""
        if os.path.exists(self.model_path):
            try:
                self.model = tf.keras.models.load_model(self.model_path)
                print(f"✓ Audio model loaded from {self.model_path}")
            except Exception as e:
                print(f"✗ Failed to load audio model: {e}")
                self.model = None
        else:
            print(f"⚠ Audio model not found at {self.model_path}")
    
    def _extract_features(self, audio_bytes: bytes) -> Dict:
        """Extract audio features for analysis"""
        # Save to temporary file
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
            tmp.write(audio_bytes)
            tmp_path = tmp.name
        
        try:
            # Load audio
            y, sr = librosa.load(tmp_path, sr=self.sample_rate, duration=self.duration)
            
            # Extract features
            features = {}
            
            # Mel spectrogram
            mel_spec = librosa.feature.melspectrogram(y=y, sr=sr, n_mels=128)
            mel_spec_db = librosa.power_to_db(mel_spec, ref=np.max)
            features["mel_spectrogram"] = mel_spec_db
            
            # MFCCs
            mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=20)
            features["mfccs"] = mfccs
            features["mfcc_mean"] = np.mean(mfccs, axis=1)
            features["mfcc_std"] = np.std(mfccs, axis=1)
            
            # Spectral features
            spectral_centroid = librosa.feature.spectral_centroid(y=y, sr=sr)
            features["spectral_centroid_mean"] = float(np.mean(spectral_centroid))
            features["spectral_centroid_std"] = float(np.std(spectral_centroid))
            
            # Zero crossing rate
            zcr = librosa.feature.zero_crossing_rate(y)
            features["zcr_mean"] = float(np.mean(zcr))
            features["zcr_std"] = float(np.std(zcr))
            
            # RMS energy
            rms = librosa.feature.rms(y=y)
            features["rms_mean"] = float(np.mean(rms))
            features["rms_std"] = float(np.std(rms))
            
            # Spectral rolloff
            rolloff = librosa.feature.spectral_rolloff(y=y, sr=sr)
            features["rolloff_mean"] = float(np.mean(rolloff))
            
            return features
            
        finally:
            os.unlink(tmp_path)
    
    def _preprocess_for_model(self, mel_spectrogram: np.ndarray) -> np.ndarray:
        """Preprocess mel spectrogram for model inference"""
        # Resize to expected input shape (e.g., 128x128)
        target_length = 128
        if mel_spectrogram.shape[1] > target_length:
            mel_spectrogram = mel_spectrogram[:, :target_length]
        elif mel_spectrogram.shape[1] < target_length:
            pad_width = target_length - mel_spectrogram.shape[1]
            mel_spectrogram = np.pad(mel_spectrogram, ((0, 0), (0, pad_width)), mode='constant')
        
        # Normalize
        mel_spectrogram = (mel_spectrogram - np.min(mel_spectrogram)) / (np.max(mel_spectrogram) - np.min(mel_spectrogram) + 1e-8)
        
        # Add channel dimension and batch dimension
        mel_spectrogram = np.expand_dims(mel_spectrogram, axis=-1)
        mel_spectrogram = np.expand_dims(mel_spectrogram, axis=0)
        
        return mel_spectrogram
    
    async def detect(self, audio_bytes: bytes, filename: str = None) -> Dict:
        """
        Detect if an audio file is AI-generated or manipulated
        
        Returns:
            Dict with result, confidence, and details
        """
        try:
            # Extract features
            features = self._extract_features(audio_bytes)
            
            if self.model is not None:
                # Use trained model
                mel_spec = features["mel_spectrogram"]
                preprocessed = self._preprocess_for_model(mel_spec)
                prediction = self.model.predict(preprocessed, verbose=0)
                
                fake_prob = float(prediction[0][0]) if len(prediction[0]) == 1 else float(prediction[0][1])
                
                if fake_prob > 0.7:
                    result = "fake"
                    confidence = fake_prob * 100
                    details = "High probability of AI-generated or synthetic audio detected"
                elif fake_prob > 0.4:
                    result = "suspicious"
                    confidence = 50 + (fake_prob - 0.4) * 100
                    details = "Some indicators of potential audio manipulation detected"
                else:
                    result = "authentic"
                    confidence = (1 - fake_prob) * 100
                    details = "No significant signs of audio manipulation detected"
            else:
                # Fallback: Heuristic analysis based on audio features
                score = 0.3
                details_parts = []
                
                # Check spectral characteristics
                spectral_centroid = features.get("spectral_centroid_mean", 0)
                spectral_std = features.get("spectral_centroid_std", 0)
                
                # AI-generated audio often has unusual spectral patterns
                if spectral_std < 500:  # Too consistent
                    score += 0.15
                    details_parts.append("unusually consistent spectral pattern")
                
                # Check zero crossing rate variability
                zcr_std = features.get("zcr_std", 0)
                if zcr_std < 0.01:
                    score += 0.1
                    details_parts.append("low zero-crossing variability")
                
                # Check RMS energy patterns
                rms_std = features.get("rms_std", 0)
                if rms_std < 0.02:
                    score += 0.1
                    details_parts.append("unnaturally stable energy levels")
                
                confidence = abs(score - 0.5) * 200
                
                if score > 0.55:
                    result = "suspicious"
                    details = f"Heuristic analysis detected: {', '.join(details_parts) if details_parts else 'unusual audio patterns'}"
                else:
                    result = "authentic"
                    details = "Audio characteristics appear natural based on heuristic analysis"
            
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
