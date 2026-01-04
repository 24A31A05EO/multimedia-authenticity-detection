"""
Image Detection Router
"""
from fastapi import APIRouter, UploadFile, File, HTTPException
from app.models.response import DetectionResponse
from app.services.image_service import ImageDetectionService
from app.database.supabase import save_detection_result

router = APIRouter()
image_service = ImageDetectionService()

@router.post("/image", response_model=DetectionResponse)
async def detect_fake_image(file: UploadFile = File(...)):
    """Detect if an uploaded image is authentic or fake/AI-generated"""

    allowed_types = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed: {', '.join(allowed_types)}"
        )

    try:
        # ✅ ONLY async operation here
        content = await file.read()

        # ❌ NO await (this is SYNC)
        result = image_service.detect(content, file.filename)

        # ❌ NO await (Supabase client is SYNC)
        save_detection_result(
            detection_type="image",
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

