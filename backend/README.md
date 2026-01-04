# Multimedia Authenticity Detection System - Backend

A FastAPI backend for detecting fake/AI-generated images, videos, audio, phishing URLs, and AI-generated emails.

## 🚀 Quick Start

### 1. Prerequisites

- Python 3.11+
- pip or conda

### 2. Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Configure Environment

```bash
# Copy example env file
cp .env.example .env

# Edit .env with your Supabase credentials
# SUPABASE_URL=https://your-project.supabase.co
# SUPABASE_KEY=your-service-role-key
```

### 4. Add ML Models (Optional)

Place your trained `.h5` models in the `models/` directory:

```
models/
├── image_model.h5    # CNN for fake image detection
├── video_model.h5    # CNN for deepfake detection
├── audio_model.h5    # Spectrogram CNN for fake audio
├── url_model.h5      # ML model for phishing URLs
└── email_model.h5    # NLP model for AI-generated emails
```

> **Note:** The backend will work without models using heuristic fallback analysis.

### 5. Run the Server

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/detect/image` | Detect fake/AI-generated images |
| POST | `/api/detect/video` | Detect deepfake videos |
| POST | `/api/detect/audio` | Detect AI-generated audio |
| POST | `/api/detect/url` | Detect phishing URLs |
| POST | `/api/detect/email` | Detect AI-generated emails |
| GET | `/` | API information |
| GET | `/health` | Health check |

## 📤 Request/Response Format

### File Upload (Image, Video, Audio)

```bash
curl -X POST "http://localhost:8000/api/detect/image" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@test_image.jpg"
```

### URL Detection

```bash
curl -X POST "http://localhost:8000/api/detect/url" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://suspicious-site.com/login"}'
```

### Email Detection

```bash
curl -X POST "http://localhost:8000/api/detect/email" \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "Urgent: Verify your account",
    "body": "Click here to verify your account immediately...",
    "sender": "support@suspicious-domain.tk"
  }'
```

### Response Format

```json
{
  "result": "authentic | fake | suspicious",
  "confidence": 85.6,
  "details": "Explanation of the detection result"
}
```

## 🗄️ Supabase Setup

Create the `detections` table in Supabase:

```sql
CREATE TABLE detections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL,
  result TEXT NOT NULL,
  confidence FLOAT NOT NULL,
  details TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE detections ENABLE ROW LEVEL SECURITY;

-- Allow inserts (adjust as needed)
CREATE POLICY "Allow inserts" ON detections
  FOR INSERT WITH CHECK (true);
```

## 🧠 Model Training (Optional)

The backend expects TensorFlow/Keras `.h5` models. Example model architectures:

### Image Model (CNN)
- Input: 224x224x3 RGB image
- Output: Binary classification (authentic/fake)

### Video Model (Frame-based CNN)
- Input: 224x224x3 RGB frames
- Output: Binary classification per frame

### Audio Model (Spectrogram CNN)
- Input: 128x128 Mel spectrogram
- Output: Binary classification

### URL/Email Models
- Input: Feature vectors (see services for feature extraction)
- Output: Binary classification

## 📁 Project Structure

```
backend/
├── app/
│   ├── main.py              # FastAPI application
│   ├── config.py            # Configuration settings
│   ├── database/
│   │   └── supabase.py      # Supabase client
│   ├── routers/
│   │   ├── image.py         # Image detection endpoint
│   │   ├── video.py         # Video detection endpoint
│   │   ├── audio.py         # Audio detection endpoint
│   │   ├── url.py           # URL detection endpoint
│   │   └── email.py         # Email detection endpoint
│   ├── services/
│   │   ├── image_service.py # Image analysis logic
│   │   ├── video_service.py # Video analysis logic
│   │   ├── audio_service.py # Audio analysis logic
│   │   ├── url_service.py   # URL analysis logic
│   │   └── email_service.py # Email analysis logic
│   └── models/
│       └── response.py      # Response models
├── models/                   # ML model files (.h5)
├── .env                      # Environment variables
├── requirements.txt          # Python dependencies
└── README.md                 # This file
```

## 🔧 Frontend Integration

Update your frontend API configuration to point to:

```javascript
const API_BASE_URL = 'http://localhost:8000';
```

Example API call:

```typescript
const detectImage = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(`${API_BASE_URL}/api/detect/image`, {
    method: 'POST',
    body: formData,
  });
  
  return response.json();
};
```

## 📝 License

MIT License
