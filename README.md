# ATS SmartReader

A modern, high-performance Applicant Tracking System (ATS) that uses a multi-stage AI pipeline to transform unstructured PDF resumes into validated candidate profiles.

## 🧠 AI Pipeline Architecture

- **Visual Layout Layer (Surya-OCR)**: Detects document geometry (Titles, Headers, Lists).
- **Text Extraction Layer (Tesseract)**: Performs OCR on identified zones.
- **Semantic Intelligence Layer (Mistral-7B)**: Cleans OCR noise and maps raw text into a strict JSON schema using Hugging Face Inference.

---

## 🚀 Quick Start (Docker)

The easiest way to run the project. No need to install Python, Node.js, or Tesseract manually.

### 1. Prerequisites

- **Docker Desktop** installed and running.
- A **Hugging Face Access Token** (Read permissions).

### 2. Configuration

Create a `.env` file at the root of the project:

```bash
# .env file
HF_TOKEN=hf_your_token_here
DATABASE_URL=postgresql://postgres:password@db:5432/ats_db
```

> **Note:** Ensure your Hugging Face token has **"Make calls to Inference Providers"** checked in your account settings.

### 3. Run the App (Docker)

Open your terminal and run:

```bash
docker-compose up --build
```

Wait for the containers to build. Once the logs stabilize:

- **Frontend (Interface)**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:8000](http://localhost:8000)
- **API Swagger Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 🛠️ Tech Stack

- **Intelligence Engine**: Mistral-7B (LLM), Surya-OCR (Vision), Tesseract (OCR).
- **Infrastructure**: Docker & Docker Compose.
- **Backend**: FastAPI, Python 3.12+, PostgreSQL (SQLAlchemy).
- **Frontend**: React, TypeScript, Vite, Tailwind CSS.

---

## ⚠️ Troubleshooting

- **Image/PDF not loading?**:
  The backend saves analyzed images in the `ai-pipeline/uploads` folder. Ensure your FastAPI app mounts this directory as static files (see `api.py`).

- **Database Connection Error**:
  If the logs show `Connection refused` (error 111), wait 10 seconds. Postgres takes longer to start than the Python API on the first run.

- **403 Forbidden (Hugging Face)**:
  Your token is invalid or lacks the "Inference" permission. Generate a new "Fine-grained" token or a classic "Read" token with inference enabled.
