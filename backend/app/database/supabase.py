"""
Supabase database client and operations
"""
from supabase import create_client
from datetime import datetime
from app.config import settings

supabase = None

try:
    supabase = create_client(
        settings.SUPABASE_URL,
        settings.SUPABASE_KEY
    )
    print("✓ Supabase client initialized")
except Exception as e:
    print(f"✗ Failed to initialize Supabase: {e}")


def save_detection_result(
    detection_type: str,
    result: str,
    confidence: float,
    details: str | None = None
):
    if not supabase:
        return None

    data = {
        "type": detection_type,
        "result": result,
        "confidence": confidence,
        "details": details,
        "created_at": datetime.utcnow().isoformat()
    }

    try:
        response = supabase.table("detections").insert(data).execute()
        return response.data
    except Exception as e:
        print("Supabase insert error:", e)
        return None


def get_detection_history(limit: int = 50):
    if not supabase:
        return []

    try:
        response = (
            supabase
            .table("detections")
            .select("*")
            .order("created_at", desc=True)
            .limit(limit)
            .execute()
        )
        return response.data
    except Exception as e:
        print("Supabase fetch error:", e)
        return []


