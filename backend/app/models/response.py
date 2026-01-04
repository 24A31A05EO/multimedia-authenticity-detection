"""
Response models for API endpoints
"""
from pydantic import BaseModel
from typing import Optional, Literal

class DetectionResponse(BaseModel):
    """Standard detection response format"""
    result: Literal["authentic", "fake", "suspicious"]
    confidence: float
    details: str
    
    class Config:
        json_schema_extra = {
            "example": {
                "result": "fake",
                "confidence": 85.6,
                "details": "High probability of AI-generated content detected"
            }
        }

class URLRequest(BaseModel):
    """Request model for URL detection"""
    url: str

class EmailRequest(BaseModel):
    """Request model for email detection"""
    subject: str
    body: str
    sender: Optional[str] = None

class HealthResponse(BaseModel):
    """Health check response"""
    status: str
    models_loaded: list
