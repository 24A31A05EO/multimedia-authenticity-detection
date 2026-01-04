from fastapi import APIRouter, UploadFile, File, HTTPException
from app.models.response import DetectionResponse
from app.services.video_service import VideoDetectionService
from app.database.supabase import save_detection_result

# ✅ THIS LINE IS REQUIRED!
router = APIRouter()

video_service = VideoDetectionService()

@router.post("/video", response_model=DetectionResponse)
async def detect_deepfake_video(file: UploadFile = File(...)):

    allowed_types = [
        "video/mp4",
        "video/avi",
        "video/quicktime",
        "video/webm",
        "video/x-msvideo"
    ]

    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail="Invalid file type. Allowed: MP4, AVI, MOV, WebM"
        )

    try:
        content = await file.read()

        # ✅ Await the async detect
        result = await video_service.detect(content, file.filename)

        # Save result (can stay sync)
        save_detection_result(
            detection_type="video",
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


