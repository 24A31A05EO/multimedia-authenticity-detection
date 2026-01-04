📌 Multimedia Authenticity Detection System

An AI-based system designed to detect fake and manipulated multimedia content, including Emails, URLs, Images, Audio, and Videos.
The project strengthens digital trust and online safety by identifying phishing attempts, AI-generated content, and deepfakes.

🎯 Project Objectives

Detect fake emails and phishing URLs

Identify AI-generated or manipulated images

Analyze synthetic audio

Detect deepfake videos

Provide a centralized dashboard with real-time statistics

🛠️ Tech Stack

Frontend

React 18 + TypeScript – Single-page application

Vite – Frontend build tool

Tailwind CSS – Utility-first CSS framework

ShadCN/UI – Prebuilt UI components

Lucide React – Icons

React Router DOM – Page routing

Sonner – Toast notifications

Backend & AI

Python 3.11 + FastAPI – REST API server

TensorFlow / Keras – AI models for detection

OpenCV / Pillow / NumPy – Image & video processing

Librosa / PyDub – Audio analysis

Database & Realtime

Supabase (PostgreSQL) – Storing detection results

Supabase Realtime – Live updates to dashboard

Version Control & Collaboration

Git + GitHub – Repository & version control

VS Code – IDE for development

👥 Team Collaboration & Roles
👩‍💻 P. Bhavya Sri Jyothi – Backend & Frontend Developer

Developed FastAPI backend APIs for Email, URL, Image, Audio, and Video detection

Integrated Supabase database for storage and real-time updates

Implemented React frontend dashboard and detection pages

Managed GitHub repository and project structure

👩‍💻 M. Kavya – Frontend Developer

Assisted in React frontend development

Styled pages with Tailwind CSS & ShadCN components

Worked on dashboard live stats and user interface enhancements

👩‍💻 D. Dhanushya – AI & Pretrained Models

Provided and integrated pretrained AI models for detection

Assisted in model testing and optimization

Supported backend AI endpoints

👩‍💻 P. Renuka – Documentation & Presentation

Prepared project PPT and visual materials

Created all documentation in docs/

Assisted in explaining workflow, system design, and test cases

🤝 Collaboration Workflow

GitHub used for version control and collaboration

Clear separation of modules allowed parallel development

Regular integration and testing ensured system stability

Supabase Realtime provides live updates on the dashboard

📂 Project Structure
hackthon/
├── backend/         # FastAPI backend with AI models
├── frontend/        # React + TypeScript + Tailwind UI
├── docs/
│   ├── api/         # API documentation
│   ├── frontend/    # Frontend overview
│   ├── database/    # Supabase schema & database info
│   └── testing/     # Fake test data and testing docs
└── README.md

🚀 Features

Multi-module detection (Email, URL, Image, Audio, Video)

Real-time dashboard updates via Supabase Realtime

AI-powered detection models using TensorFlow/Keras

User-friendly UI with Tailwind & ShadCN components

Scalable backend architecture with FastAPI
