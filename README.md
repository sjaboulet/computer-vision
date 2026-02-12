# ATS SmartReader

A modern, high-performance Applicant Tracking System (ATS) that uses a multi-stage AI pipeline to transform unstructured PDF resumes into validated candidate profiles.

## 🧠 AI Pipeline Architecture

Instead of a simple text dump, this project implements a sophisticated vision-to-semantics pipeline to preserve document context and improve data accuracy.

- **Visual Layout Layer (Surya-OCR)**: Acts as the "eyes" of the system. It detects document geometry to identify bounding boxes and classify elements (Titles, Headers, Lists). This ensures the reading order is preserved and semantic structure is recognized.
- **Text Extraction Layer (Tesseract)**: Performs OCR on the identified zones. It uses a hybrid approach to extract native text layers when available or process visual pixels for scanned/image-based documents.
- **Semantic Intelligence Layer (Mistral-7B)**: Powered by Hugging Face, this LLM acts as the "reasoning" engine. It cleans OCR noise, fixes spelling, and maps raw text into a strict JSON schema designed for recruitment forms.

---

## 🛠️ Prerequisites

- **Python 3.12+**
- **Node.js & npm**
- **Tesseract OCR**: Must be installed on your system path.
  - _macOS_: `brew install tesseract`
  - _Windows_: Install via [UB-Mannheim](https://github.com/UB-Mannheim/tesseract/wiki).
  - _Linux_: `sudo apt install tesseract-ocr`

---

## 📂 Installation & Setup

### 1. Backend Configuration

1.  Navigate to the `ai-pipeline/` folder.
2.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```

### 2. Frontend Configuration

1.  Navigate to the `doc-reader/` folder.
2.  Install dependencies:
    ```bash
    npm install
    ```

### 3. Hugging Face Token & Permissions

The AI pipeline requires a Hugging Face Access Token to communicate with the Mistral model.

1.  **Create a Token**:
    - Log in to [huggingface.co](https://huggingface.co/).
    - Go to **Settings** > **Access Tokens** > **New Token**.
    - Set a name (e.g., `ATS-SmartReader`) and choose the **Read** role.
2.  **CRITICAL - Enable Inference Permissions**:
    - In the token permission settings, scroll down to the **"Inference"** or **"Providers"** section.
    - **Check the box "Make calls to Inference Providers"**. Without this, the API will return a `403 Forbidden` error.
3.  **Configure Environment**:
    - Create a `.env` file in the `ai-pipeline/` folder.
    - Add your token: `HF_TOKEN=hf_your_token_here`

---

## 🚦 Running the Application

You need to run both the server and the client simultaneously in separate terminals.

### Terminal A: Python API (Backend)

```bash
cd ai-pipeline
uvicorn api:app --reload
```

The backend runs at http://127.0.0.1:8000.

### Terminal B: Vite Client (Frontend)

```bash
cd doc-reader
npm run dev
```

---

## 🎯 Usage

1.  Open your browser and navigate to `http://localhost:5173`.
2.  Click **"Upload Resume"** and select a PDF file.
3.  Wait for the analysis to complete.
4.  View the **Visual Layout** (annotated PDF) and the **Structured Profile** (JSON data) side-by-side.

The frontend runs at http://localhost:5173.

---

## 🛠️ Tech Stack

- **Intelligence Engine**:
  - **LLM**: Mistral-7B-Instruct (NLP) for semantic structuring and JSON formatting.
  - **Vision**: Surya-OCR for layout analysis and document geometry detection.
  - **OCR**: Tesseract for targeted character recognition.
- **Backend**: FastAPI, Python 3.12+, Uvicorn.
- **Frontend**: React, TypeScript, Tailwind CSS, Lucide Icons.

---

## 📋 Pipeline Workflow Summary

1.  **Input**: The user uploads a PDF file through the React interface.
2.  **Surya (Vision)**: The system analyzes the document to identify "where" the content is (titles, headers, lists) and generates bounding boxes.
3.  **Tesseract (OCR)**: The engine reads the text specifically within those detected zones.
4.  **Mistral (LLM)**: The raw text is sent to the LLM which parses it into a clean JSON structure (Name, Email, Skills, Summary).
5.  **Output**: The frontend auto-fills a "Smart Application Form" and displays a visual debug map of the scanned zones.

---

## ⚠️ Troubleshooting

- **403 Forbidden**: Ensure your Hugging Face token has the **"Make calls to Inference Providers"** permission enabled in your account settings.
- **TesseractNotFoundError**: Verify that Tesseract is installed on your system and added to your environment `PATH`.
- **CORS Errors**: Ensure the FastAPI backend is running on port `8000` to allow the frontend to communicate correctly.
- **Empty Extraction**: If no text is found, check if the PDF is a scanned image without a text layer; ensure Tesseract languages are correctly installed.
