from fastapi import APIRouter, HTTPException
from app.models.response import DetectionResponse, EmailRequest
from app.services.email_service import EmailDetectionService
from app.database.supabase import save_detection_result

# ✅ REQUIRED
router = APIRouter()

email_service = EmailDetectionService()

@router.post("/email", response_model=DetectionResponse)
async def detect_ai_email(request: EmailRequest):

    if not request.subject and not request.body:
        raise HTTPException(
            status_code=400,
            detail="Subject or body is required"
        )

    try:
        # ✅ Await async detect
        result = await email_service.detect(
            subject=request.subject,
            body=request.body,
            sender=request.sender
        )

        # Save detection result
        save_detection_result(
            detection_type="email",
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



