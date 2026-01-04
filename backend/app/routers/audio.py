from fastapi import APIRouter, UploadFile, File, HTTPException
from app.models.response import DetectionResponse
from app.services.audio_service import AudioDetectionService
from app.database.supabase import save_detection_result

# ✅ THIS IS REQUIRED
router = APIRouter()

audio_service = AudioDetectionService()

@router.post("/audio", response_model=DetectionResponse)
async def detect_fake_audio(file: UploadFile = File(...)):

    allowed_types = [
        "audio/mpeg",
        "audio/wav",
        "audio/ogg",
        "audio/mp3",
        "audio/x-wav"
    ]

    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail="Invalid file type. Allowed: MP3, WAV, OGG"
        )

    try:
        # ✅ Async file read
        content = await file.read()

        # ✅ Await async detect
        result = await audio_service.detect(content, file.filename)

        # Save result (can stay sync)
        save_detection_result(
            detection_type="audio",
            result=result["result"],
            confidence=result["confidence"],
            details=result["details"]
        )

        return DetectionResponse(**result)

    except Exception as e:
        return DetectionResponse(
            result="Fake Detected",
            confidence=0.0,
            details=f"Analysis failed: {str(e)}"
        )



