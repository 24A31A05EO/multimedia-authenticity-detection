# API Documentation  
Multimedia Authenticity Detection System

## Base URL
http://localhost:8000/api

## Authentication
Currently, APIs are public. Future versions will include Supabase authentication.

---

## Email Detection API
### Endpoint
POST /detect/email

### Request Body
{
  "email_text": "Congratulations! You won a prize. Click the link now."
}

### Response
{
  "result": "fake",
  "confidence": 0.92
}

---

## URL Detection API
### Endpoint
POST /detect/url

### Request Body
{
  "url": "http://secure-login-free.xyz"
}

### Response
{
  "result": "fake",
  "confidence": 0.88
}

---

## Image Detection API
### Endpoint
POST /detect/image

### Request
Multipart form-data with image file

### Response
{
  "result": "authentic",
  "confidence": 0.95
}

---

## Audio Detection API
### Endpoint
POST /detect/audio

### Request
Multipart form-data with audio file

### Response
{
  "result": "fake",
  "confidence": 0.90
}

---

## Video Detection API
### Endpoint
POST /detect/video

### Request
Multipart form-data with video file

### Response
{
  "result": "fake",
  "confidence": 0.93
}
