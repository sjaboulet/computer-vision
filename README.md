# 🚀 AI Resume Parser Pipeline (Computer Vision & LLM)

This project is a Full-Stack application designed to extract and structure data from resumes (PDFs/Images). It relies on a modular pipeline architecture combining **Computer Vision**, **Deep Learning (OCR)**, and a **Large Language Model (LLM)**.

## 🧠 Pipeline Architecture

Our approach breaks down the complex task of document extraction into three specialized sub-tasks:

1. **Vision (Layout Analysis) using YOLOv8**: Object Detection applied to documents. The model (`hantian/yolo-doclaynet.pt`) segments the resume into semantic blocks (Headers, Paragraphs, Lists).
   _Note: This approach replaced our initial Surya-OCR implementation because it offers better block-level granularity rather than line-level, preserving the semantic context for the LLM._
2. **OCR with DocTR**: Neural network-based Character Recognition (ResNet/Transformer architecture). This is applied exclusively to the bounding boxes cropped by YOLO, which entirely eliminates traditional multi-column reading issues.
3. **Semantic Parsing (LLM)**: A language model processes the raw text extracted from the OCR and structures it into a strict JSON format (Skills, Experience, Contact info).

---

## 📦 Trained Models (.pt)

The core vision model used is **YOLOv8m-DocLayNet**.
To avoid bloating the Git repository with large weight files, the backend is configured to **automatically download the model weights (`.pt`) from the Hugging Face Hub** upon the first execution. The file will be saved locally as `yolov8m-doclaynet.pt`.

---

## 🛠️ Installation and Setup

### 1. Configure Environment Variables

Before running anything, create a `.env` file in the `ai-pipeline` directory. See the README file in the `ai-pipeline` folder for details on configuring the LLM backend (Hugging Face vs GitHub Copilot Models).

---

### 2. Run with Docker Compose (Recommended)

Docker Compose starts the full stack (backend API, frontend, and PostgreSQL database) with a single command.

```bash
# From the project root
docker-compose up --build
```

| Service  | URL                       |
|----------|---------------------------|
| Frontend | http://localhost:5173     |
| Backend  | http://localhost:8000     |
| Postgres | localhost:5432            |

> **Note:** On the very first run the backend downloads YOLOv8 weights (~50 MB) and DocTR weights (~300 MB), so the first document scan will take a bit longer.

---

### 3. Manual Setup (without Docker)

**Backend**

```bash
cd ai-pipeline
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python3 api.py
```

**Frontend**

```bash
cd doc-reader
npm install
npm run dev
```

> The interface will be accessible at `http://localhost:5173`.

---

## 📊 Benchmark Script (Vision Comparison)

To justify our architectural choices, we provided a benchmark script comparing the "Line-level" approach (Surya) versus our final "Block-level" approach (YOLOv8).

**To reproduce the benchmark:**

1. Create a `test_cvs` folder at the root and place a few PDF resumes inside.
2. Run the script:
   ```bash
   python3 benchmark.py
   ```
3. The visual results (drawn Bounding Boxes) will be generated in the `benchmark_results` folder. You will observe that YOLO natively groups semantic elements (e.g., entire bulleted lists) in a way that provides much better context for the LLM compared to Surya.

---

## 📂 Project Structure

```text
.
├── ai-pipeline/                 # Backend (FastAPI & AI Models)
│   ├── api.py                   # FastAPI entry point
│   ├── main.py                  # Pipeline orchestrator (PDF -> Vision -> OCR)
│   ├── vision_engine.py         # YOLOv8 module (Layout Detection)
│   ├── extraction_engine.py     # DocTR module (OCR on cropped areas)
│   ├── llm_engine.py            # JSON Structuring module via LLM
│   ├── benchmark.py             # Comparative script (Surya vs YOLO)
│   ├── database.py              # SQLite Database configuration
│   ├── Dockerfile               # Backend containerization
│   ├── requirements.txt         # Python dependencies
│   ├── test_cvs/                # Folder containing PDFs for the benchmark
│   ├── benchmark_results/       # Output folder for Surya vs YOLO comparisons
│   └── yolov8m-doclaynet.pt     # Downloaded YOLOv8 weights
│
├── doc-reader/                  # Frontend (React + Vite + TypeScript)
│   ├── src/                     # UI Source code (Pages, Components, Context)
│   ├── package.json             # Node.js dependencies
│   ├── tailwind.config.js       # Styling configuration
│   └── Dockerfile               # Frontend containerization
│
├── docker-compose.yml           # Orchestration for running both services
└── README.md                    # Project documentation
```
