from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import shutil
import os
from main import run_pipeline
from llm_engine import structure_data_with_llm

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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

    layout_data, debug_image_path = run_pipeline(temp_filename)
    full_text_context = "\n".join([block["content"] for block in layout_data])
    structured_profile = structure_data_with_llm(full_text_context)
    image_url = f"http://127.0.0.1:8000/static/{os.path.basename(debug_image_path)}"

    return {
        "status": "success",
        "visual_data": layout_data,
        "profile_data": structured_profile,
        "image_url": image_url,
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
