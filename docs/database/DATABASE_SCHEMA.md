# Database Schema  
Multimedia Authenticity Detection System

## Database Used
Supabase (PostgreSQL)

---

## Table: users
- id (UUID)
- email
- created_at

---

## Table: detections
- id (UUID)
- user_id
- detection_type (email, url, image, audio, video)
- input_data
- result (fake/authentic)
- confidence
- created_at

---

## Table: dashboard_stats
- total_scans
- fake_detected
- accuracy_rate
- last_updated

---

## Relationships
- One user can have many detections
- Dashboard stats update after each detection