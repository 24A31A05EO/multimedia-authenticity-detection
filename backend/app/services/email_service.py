"""
Email detection service using NLP feature vectors
"""
import numpy as np
import re
from typing import Dict, List
import os

class EmailDetectionService:
    def __init__(self):
        self.model = None
        self.model_path = "models/email_model.h5"
        self._load_model()
        
        # Phishing indicators
        self.urgency_words = {
            'urgent', 'immediately', 'asap', 'now', 'hurry', 'quick', 'fast',
            'limited', 'expire', 'deadline', 'final', 'last chance', 'act now'
        }
        
        self.threat_words = {
            'suspend', 'suspended', 'terminate', 'terminated', 'block', 'blocked',
            'disable', 'disabled', 'lock', 'locked', 'restrict', 'restricted',
            'unauthorized', 'unusual', 'suspicious', 'fraud', 'illegal'
        }
        
        self.request_words = {
            'verify', 'confirm', 'update', 'validate', 'click', 'login',
            'sign in', 'password', 'credential', 'account', 'information',
            'personal', 'bank', 'credit card', 'ssn', 'social security'
        }
        
        self.reward_words = {
            'winner', 'won', 'prize', 'lottery', 'million', 'free', 'gift',
            'bonus', 'reward', 'congratulations', 'selected', 'lucky'
        }
        
        # AI-generated text indicators
        self.ai_patterns = {
            'as an ai', 'i cannot', 'i\'m an ai', 'language model',
            'i don\'t have personal', 'i\'m here to help', 'how can i assist'
        }
    
    def _load_model(self):
        """Load the NLP model for email detection"""
        if os.path.exists(self.model_path):
            try:
                import tensorflow as tf
                self.model = tf.keras.models.load_model(self.model_path)
                print(f"✓ Email model loaded from {self.model_path}")
            except Exception as e:
                print(f"✗ Failed to load email model: {e}")
                self.model = None
        else:
            print(f"⚠ Email model not found at {self.model_path}")
    
    def _extract_features(self, subject: str, body: str, sender: str = None) -> Dict:
        """Extract NLP features from email content"""
        features = {}
        
        full_text = f"{subject} {body}".lower()
        subject_lower = subject.lower() if subject else ""
        body_lower = body.lower() if body else ""
        
        # Basic text statistics
        features["subject_length"] = len(subject) if subject else 0
        features["body_length"] = len(body) if body else 0
        features["total_length"] = len(full_text)
        
        # Word counts
        words = full_text.split()
        features["word_count"] = len(words)
        features["avg_word_length"] = np.mean([len(w) for w in words]) if words else 0
        
        # Sentence analysis
        sentences = re.split(r'[.!?]+', full_text)
        features["sentence_count"] = len([s for s in sentences if s.strip()])
        
        # Urgency indicators
        urgency_count = sum(1 for word in self.urgency_words if word in full_text)
        features["urgency_score"] = urgency_count / max(len(words), 1)
        features["urgency_count"] = urgency_count
        
        # Threat indicators
        threat_count = sum(1 for word in self.threat_words if word in full_text)
        features["threat_score"] = threat_count / max(len(words), 1)
        features["threat_count"] = threat_count
        
        # Request indicators
        request_count = sum(1 for word in self.request_words if word in full_text)
        features["request_score"] = request_count / max(len(words), 1)
        features["request_count"] = request_count
        
        # Reward/lottery indicators
        reward_count = sum(1 for word in self.reward_words if word in full_text)
        features["reward_score"] = reward_count / max(len(words), 1)
        features["reward_count"] = reward_count
        
        # AI-generated text indicators
        ai_count = sum(1 for pattern in self.ai_patterns if pattern in full_text)
        features["ai_indicator_count"] = ai_count
        
        # Link analysis
        url_pattern = r'https?://[^\s]+'
        urls = re.findall(url_pattern, body) if body else []
        features["url_count"] = len(urls)
        features["has_urls"] = 1 if urls else 0
        
        # Suspicious URL patterns
        suspicious_urls = [url for url in urls if any(
            pattern in url.lower() for pattern in ['click', 'verify', 'login', 'secure']
        )]
        features["suspicious_url_count"] = len(suspicious_urls)
        
        # Punctuation analysis
        features["exclamation_count"] = full_text.count('!')
        features["question_count"] = full_text.count('?')
        features["caps_ratio"] = sum(1 for c in full_text if c.isupper()) / max(len(full_text), 1)
        
        # Subject line analysis
        features["subject_has_urgency"] = 1 if any(w in subject_lower for w in self.urgency_words) else 0
        features["subject_has_threat"] = 1 if any(w in subject_lower for w in self.threat_words) else 0
        features["subject_all_caps"] = 1 if subject and subject.isupper() else 0
        
        # Sender analysis
        if sender:
            sender_lower = sender.lower()
            features["sender_has_numbers"] = 1 if any(c.isdigit() for c in sender) else 0
            features["sender_suspicious_domain"] = 1 if any(
                tld in sender_lower for tld in ['.tk', '.ml', '.ga', '.xyz']
            ) else 0
        else:
            features["sender_has_numbers"] = 0
            features["sender_suspicious_domain"] = 0
        
        # Grammar/spelling indicators (simplified)
        # Check for common mistakes in phishing emails
        grammar_issues = 0
        if 'dear customer' in full_text or 'dear user' in full_text:
            grammar_issues += 1
        if 'kindly' in full_text:  # Common in phishing
            grammar_issues += 1
        if re.search(r'\b(u|ur|pls|plz)\b', full_text):  # Informal abbreviations
            grammar_issues += 1
        features["grammar_issues"] = grammar_issues
        
        return features
    
    def _calculate_phishing_score(self, features: Dict) -> float:
        """Calculate phishing probability based on features"""
        score = 0.0
        
        # Urgency and threat indicators
        if features.get("urgency_count", 0) > 0:
            score += min(0.15, features["urgency_count"] * 0.05)
        if features.get("threat_count", 0) > 0:
            score += min(0.2, features["threat_count"] * 0.07)
        
        # Request for sensitive information
        if features.get("request_count", 0) > 0:
            score += min(0.2, features["request_count"] * 0.05)
        
        # Lottery/reward scams
        if features.get("reward_count", 0) > 0:
            score += min(0.25, features["reward_count"] * 0.1)
        
        # Suspicious URLs
        if features.get("suspicious_url_count", 0) > 0:
            score += 0.15
        
        # Subject line red flags
        if features.get("subject_has_urgency", 0) or features.get("subject_has_threat", 0):
            score += 0.1
        if features.get("subject_all_caps", 0):
            score += 0.1
        
        # Excessive punctuation
        if features.get("exclamation_count", 0) > 3:
            score += 0.05
        
        # High caps ratio
        if features.get("caps_ratio", 0) > 0.3:
            score += 0.1
        
        # Grammar issues
        if features.get("grammar_issues", 0) > 0:
            score += min(0.1, features["grammar_issues"] * 0.03)
        
        return min(1.0, score)
    
    def _calculate_ai_score(self, features: Dict) -> float:
        """Calculate AI-generated probability"""
        score = 0.0
        
        # Direct AI indicators
        if features.get("ai_indicator_count", 0) > 0:
            score += 0.4
        
        # Perfectly balanced sentence lengths (AI tends to be consistent)
        # This is a simplified heuristic
        word_count = features.get("word_count", 0)
        sentence_count = features.get("sentence_count", 1)
        avg_sentence_length = word_count / max(sentence_count, 1)
        
        # AI often produces sentences of similar length
        if 15 <= avg_sentence_length <= 25:
            score += 0.1
        
        # Very low grammar issues might indicate AI
        if features.get("grammar_issues", 0) == 0 and word_count > 50:
            score += 0.05
        
        return min(1.0, score)
    
    async def detect(self, subject: str, body: str, sender: str = None) -> Dict:
        """
        Detect if an email is AI-generated or a phishing attempt
        
        Returns:
            Dict with result, confidence, and details
        """
        try:
            # Extract features
            features = self._extract_features(subject, body, sender)
            
            if self.model is not None:
                # Use trained model
                feature_vector = self._features_to_vector(features)
                prediction = self.model.predict(np.array([feature_vector]), verbose=0)
                
                # Assuming multi-class or multi-output
                fake_prob = float(prediction[0][0]) if len(prediction[0]) >= 1 else 0.5
                
                if fake_prob > 0.7:
                    result = "fake"
                    confidence = fake_prob * 100
                elif fake_prob > 0.4:
                    result = "suspicious"
                    confidence = 50 + (fake_prob - 0.4) * 100
                else:
                    result = "authentic"
                    confidence = (1 - fake_prob) * 100
            else:
                # Use heuristic scoring
                phishing_score = self._calculate_phishing_score(features)
                ai_score = self._calculate_ai_score(features)
                
                combined_score = max(phishing_score, ai_score)
                
                if combined_score > 0.5:
                    result = "fake"
                    confidence = combined_score * 100
                elif combined_score > 0.25:
                    result = "suspicious"
                    confidence = 50 + combined_score * 100
                else:
                    result = "authentic"
                    confidence = (1 - combined_score) * 100
            
            # Build details message
            details_parts = []
            
            if features.get("urgency_count", 0) > 0:
                details_parts.append(f"urgency language detected ({features['urgency_count']} instances)")
            if features.get("threat_count", 0) > 0:
                details_parts.append(f"threatening language detected ({features['threat_count']} instances)")
            if features.get("request_count", 0) > 0:
                details_parts.append(f"requests for sensitive information detected")
            if features.get("reward_count", 0) > 0:
                details_parts.append(f"lottery/reward claims detected")
            if features.get("suspicious_url_count", 0) > 0:
                details_parts.append(f"suspicious URLs detected")
            if features.get("ai_indicator_count", 0) > 0:
                details_parts.append(f"AI-generated text patterns detected")
            if features.get("subject_all_caps", 0):
                details_parts.append("subject line in all caps")
            
            if details_parts:
                details = "Warning signs: " + "; ".join(details_parts)
            else:
                details = "No significant phishing or AI-generated indicators detected"
            
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
    
    def _features_to_vector(self, features: Dict) -> List[float]:
        """Convert feature dictionary to numeric vector for model"""
        return [
            features.get("subject_length", 0) / 100,
            features.get("body_length", 0) / 1000,
            features.get("word_count", 0) / 200,
            features.get("urgency_score", 0),
            features.get("threat_score", 0),
            features.get("request_score", 0),
            features.get("reward_score", 0),
            features.get("url_count", 0) / 5,
            features.get("suspicious_url_count", 0) / 3,
            features.get("exclamation_count", 0) / 10,
            features.get("caps_ratio", 0),
            features.get("ai_indicator_count", 0) / 3,
            features.get("subject_has_urgency", 0),
            features.get("subject_has_threat", 0),
            features.get("grammar_issues", 0) / 5,
        ]
