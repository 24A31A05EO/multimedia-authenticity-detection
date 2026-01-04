"""
Multimedia Authenticity Detection System - FastAPI Backend
"""

import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Body
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import tensorflow as tf

from app.routers import image, video, audio, url, email
from app.models.use_layer import USELayer  # Custom USE layer for URL and Email models
from app.services.email_service import EmailDetectionService  # Your email detection class

# Load environment variables from .env
load_dotenv()

# Global model storage
models = {}
email_detector = EmailDetectionService()  # Initialize email detector

# Lifespan to load models at startup and clear at shutdown
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 Loading ML models...")

    BASE_DIR = os.path.dirname(__file__)  # backend/app
    MODEL_DIR = os.path.join(BASE_DIR, "models")

    model_paths = {
        "image": os.path.join(MODEL_DIR, "image_model.h5"),
        "video": os.path.join(MODEL_DIR, "video_model.h5"),
        "audio": os.path.join(MODEL_DIR, "audio_model.h5"),
        "url":   os.path.join(MODEL_DIR, "url_model.h5"),
        "email": os.path.join(MODEL_DIR, "email_model.h5"),
    }

    for name, path in model_paths.items():
        if os.path.exists(path):
            try:
                if name in ["url", "email"]:
                    models[name] = tf.keras.models.load_model(
                        path, custom_objects={"USELayer": USELayer}
                    )
                else:
                    models[name] = tf.keras.models.load_model(path)
                print(f"✓ Loaded {name} model from {path}")
            except Exception as e:
                print(f"✗ Failed to load {name} model: {e}")
                models[name] = None
        else:
            print(f"✗ Model not found: {path}")
            models[name] = None

    yield  # App runs here

    models.clear()
    print("🛑 Models unloaded")


# Initialize FastAPI with lifespan
app = FastAPI(
    title="Multimedia Authenticity Detection System",
    description="AI-powered detection of fake images, videos, audio, URLs, and emails",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration: allow any localhost port for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:8080",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:8080"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(image.router, prefix="/api/detect", tags=["Image Detection"])
app.include_router(video.router, prefix="/api/detect", tags=["Video Detection"])
app.include_router(audio.router, prefix="/api/detect", tags=["Audio Detection"])
app.include_router(url.router, prefix="/api/detect", tags=["URL Detection"])
app.include_router(email.router, prefix="/api/detect", tags=["Email Detection"])

# -------------------
# Email Plain Text Endpoint (Automatic Parsing)
# -------------------
@app.post("/api/detect/email-plain")
async def detect_email_plain(email_text: str = Body(..., media_type="text/plain")):
    """
    Detect AI-generated or phishing emails from plain text input.
    Works even if Subject: or From: lines are missing.
    """
    lines = [line.strip() for line in email_text.strip().split("\n") if line.strip()]
    
    subject = ""
    sender = ""
    body_lines = []

    # Heuristic parsing
    for i, line in enumerate(lines):
        line_lower = line.lower()

        # Detect Subject
        if line_lower.startswith("subject:"):
            subject = line[8:].strip()
            continue

        # Detect From
        if line_lower.startswith("from:"):
            sender = line[5:].strip()
            continue

        # Detect a line with an email address
        if "@" in line and not sender:
            sender = line.strip()
            continue

        # If first line is short, treat as subject (fallback)
        if i == 0 and not subject and len(line) <= 100:
            subject = line
            continue

        # Otherwise, treat as body
        body_lines.append(line)

    body = "\n".join(body_lines)

    # Call your existing email detector
    result = await email_detector.detect(subject=subject, body=body, sender=sender)
    return result


# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "Multimedia Authenticity Detection System API",
        "version": "1.0.0",
        "endpoints": [
            "/api/detect/image",
            "/api/detect/video",
            "/api/detect/audio",
            "/api/detect/url",
            "/api/detect/email",
            "/api/detect/email-plain"
        ]
    }

# Health check endpoint
@app.get("/health")
async def health_check():
    loaded = [k for k, v in models.items() if v is not None]
    return {"status": "healthy", "models_loaded": loaded}

# Ping endpoint for frontend connectivity check
@app.get("/ping")
async def ping():
    return {"message": "Backend is alive!"}

# Helper function to get a model
def get_model(name: str):
    """Get a loaded model by name"""
    return models.get(name)



