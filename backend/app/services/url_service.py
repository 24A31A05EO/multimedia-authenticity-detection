import numpy as np
import re
from urllib.parse import urlparse
from typing import Dict, List
import os

class URLDetectionService:
    def __init__(self):
        self.model = None
        self.model_path = "models/url_model.h5"
        self._load_model()
        
        # Known suspicious TLDs
        self.suspicious_tlds = {
            'tk', 'ml', 'ga', 'cf', 'gq', 'xyz', 'top', 'pw', 'cc', 'club',
            'work', 'date', 'racing', 'win', 'bid', 'stream', 'download'
        }
        
        # Known brand names often used in phishing
        self.brand_keywords = {
            'paypal', 'apple', 'microsoft', 'google', 'amazon', 'facebook',
            'netflix', 'bank', 'secure', 'login', 'verify', 'update', 'account',
            'confirm', 'password', 'signin', 'credential', 'suspended'
        }
    
    def _load_model(self):
        """Load the ML model for URL detection"""
        if os.path.exists(self.model_path):
            try:
                import tensorflow as tf
                self.model = tf.keras.models.load_model(self.model_path)
                print(f"✓ URL model loaded from {self.model_path}")
            except Exception as e:
                print(f"✗ Failed to load URL model: {e}")
                self.model = None
        else:
            print(f"⚠ URL model not found at {self.model_path}")
    
    def _extract_features(self, url: str) -> Dict:
        features = {}
        try:
            if not url.startswith(('http://', 'https://')):
                url = 'http://' + url
            parsed = urlparse(url)
            hostname = parsed.netloc.lower()

            # Basic URL features
            features["url_length"] = len(url)
            features["hostname_length"] = len(hostname)
            features["path_length"] = len(parsed.path)
            features["has_https"] = 1 if parsed.scheme == 'https' else 0
            features["num_dots"] = hostname.count('.')
            features["num_hyphens"] = hostname.count('-')
            features["num_underscores"] = url.count('_')
            features["num_slashes"] = url.count('/')
            features["num_at_symbols"] = url.count('@')
            
            # IP address check
            ip_pattern = r'\d{1,3}(\.\d{1,3}){3}'
            features["has_ip"] = 1 if re.search(ip_pattern, hostname) else 0

            # TLD
            parts = hostname.split('.')
            tld = parts[-1] if parts else ''
            features["tld"] = tld
            features["suspicious_tld"] = 1 if tld in self.suspicious_tlds else 0

            # Brand keywords
            url_lower = url.lower()
            brand_matches = [kw for kw in self.brand_keywords if kw in url_lower]
            features["num_brand_keywords"] = len(brand_matches)
            features["brand_keywords"] = brand_matches

            # Port & query & encoding checks
            features["has_port"] = 1 if ':' in parsed.netloc and not parsed.netloc.startswith('[') else 0
            features["num_params"] = len(parsed.query.split('&')) if parsed.query else 0
            features["has_encoded_chars"] = 1 if '%' in url else 0

            # Subdomains
            if len(parts) > 2:
                subdomain = '.'.join(parts[:-2])
                features["subdomain_length"] = len(subdomain)
                features["num_subdomains"] = len(parts) - 2
            else:
                features["subdomain_length"] = 0
                features["num_subdomains"] = 0

            # Entropy
            char_counts = {}
            for char in url:
                char_counts[char] = char_counts.get(char, 0) + 1
            entropy = 0
            url_len = len(url)
            for count in char_counts.values():
                p = count / url_len
                entropy -= p * np.log2(p)
            features["entropy"] = float(entropy)

            # Suspicious keywords
            features["has_login_keyword"] = 1 if any(kw in url_lower for kw in ['login','signin','verify','secure']) else 0
            features["has_redirect"] = 1 if 'redirect' in url_lower or 'url=' in url_lower else 0

        except Exception as e:
            features["error"] = str(e)
        return features
    
    def _calculate_risk_score(self, features: Dict) -> float:
        """Heuristic phishing score"""
        score = 0.0
        if features.get("url_length",0) > 75: score += 0.1
        if features.get("url_length",0) > 100: score += 0.1
        if features.get("has_https",1) == 0: score += 0.15
        if features.get("has_ip",0) == 1: score += 0.25
        if features.get("suspicious_tld",0) == 1: score += 0.15
        num_brands = features.get("num_brand_keywords",0)
        if num_brands > 0: score += min(0.2, num_brands*0.1)
        if features.get("num_subdomains",0) > 2: score += 0.1
        if features.get("num_at_symbols",0) > 0: score += 0.2
        if features.get("entropy",0) > 4.5: score += 0.1
        if features.get("has_login_keyword",0) == 1: score += 0.1
        if features.get("has_redirect",0) == 1: score += 0.1
        return min(1.0, score)
    
    def _features_to_vector(self, features: Dict) -> List[float]:
        return [
            features.get("url_length",0)/100,
            features.get("hostname_length",0)/50,
            features.get("has_https",0),
            features.get("num_dots",0)/5,
            features.get("num_hyphens",0)/5,
            features.get("has_ip",0),
            features.get("suspicious_tld",0),
            features.get("num_brand_keywords",0)/3,
            features.get("num_subdomains",0)/3,
            features.get("entropy",0)/5,
            features.get("has_login_keyword",0),
            features.get("has_redirect",0)
        ]
    
    # ✅ Synchronous detection
    def detect(self, url: str) -> Dict:
        try:
            features = self._extract_features(url)
            if "error" in features:
                return {"result":"suspicious","confidence":0.0,"details":f"Could not parse URL: {features['error']}"}
            
            if self.model:
                import numpy as np
                vector = np.array([self._features_to_vector(features)])
                prediction = self.model.predict(vector, verbose=0)
                phishing_prob = float(prediction[0][0])
                if phishing_prob > 0.7:
                    result = "fake"
                    confidence = phishing_prob*100
                elif phishing_prob > 0.4:
                    result = "suspicious"
                    confidence = 50 + (phishing_prob-0.4)*100
                else:
                    result = "authentic"
                    confidence = (1-phishing_prob)*100
            else:
                score = self._calculate_risk_score(features)
                if score > 0.6:
                    result = "fake"
                    confidence = score*100
                elif score > 0.3:
                    result = "suspicious"
                    confidence = 50 + (score-0.3)*100
                else:
                    result = "authentic"
                    confidence = (1-score)*100

            details = []
            if features.get("has_ip"): details.append("URL contains IP address")
            if features.get("suspicious_tld"): details.append(f"uses suspicious TLD '.{features.get('tld')}'")
            if features.get("num_brand_keywords",0): details.append(f"contains brand keywords: {', '.join(features.get('brand_keywords',[]))}")
            if not features.get("has_https"): details.append("no HTTPS encryption")
            if features.get("num_at_symbols",0): details.append("contains @ symbol (potential obfuscation)")

            return {
                "result": result,
                "confidence": round(confidence,2),
                "details": "Warning signs: " + "; ".join(details) if details else "No significant phishing indicators detected"
            }

        except Exception as e:
            return {"result":"suspicious","confidence":0.0,"details":f"Error during analysis: {str(e)}"}

