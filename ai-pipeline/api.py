from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import shutil
import os
from main import run_pipeline

app = FastAPI()

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="."), name="static")


@app.post("/analyze")
async def analyze_document(file: UploadFile = File(...)):

    temp_filename = "temp_upload.pdf"
    with open(temp_filename, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    try:
        layout_data, debug_image_path = run_pipeline(temp_filename)
        image_url = f"http://127.0.0.1:8000/static/{os.path.basename(debug_image_path)}"
        return {"status": "success", "data": layout_data, "image_url": image_url}

    except Exception as e:
        return {"status": "error", "message": str(e)}
