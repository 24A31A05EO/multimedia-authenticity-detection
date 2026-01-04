"""
URL Phishing Detection Router
"""
from fastapi import APIRouter, HTTPException
from app.models.response import DetectionResponse, URLRequest
from app.services.url_service import URLDetectionService
from app.database.supabase import save_detection_result

router = APIRouter()
url_service = URLDetectionService()

@router.post("/url", response_model=DetectionResponse)
async def detect_phishing_url(request: URLRequest):
    """Detect if a URL is a phishing attempt"""

    if not request.url:
        raise HTTPException(status_code=400, detail="URL is required")

    try:
        # ❌ NOT async
        result = url_service.detect(request.url)

        # ❌ NOT async
        save_detection_result(
            detection_type="url",
            result=result["result"],
            confidence=result["confidence"],
            details=result["details"]
        )

        return DetectionResponse(**result)

    except Exception as e:
        return DetectionResponse(
            result="suspicious",
            confidence=0.0,
            details=f"Analysis failed: {str(e)}"
        )

