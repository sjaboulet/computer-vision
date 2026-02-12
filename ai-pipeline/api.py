from fastapi import FastAPI, UploadFile, File, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List
import shutil
import os
import uuid
from main import run_pipeline
from llm_engine import structure_data_with_llm
from database import SessionLocal, Candidate

app = FastAPI()
os.makedirs("static", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


class CandidateCreate(BaseModel):
    full_name: str
    email: str
    phone: str
    skills: List[str]
    summary: str


@app.post("/analyze")
async def analyze_document(file: UploadFile = File(...)):
    unique_id = str(uuid.uuid4())[:8]
    sanitized_filename = file.filename.replace(" ", "_")
    input_path = f"static/{unique_id}_{sanitized_filename}"

    try:
        with open(input_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        layout_data, original_debug_path = run_pipeline(input_path)

        final_image_name = f"debug_{unique_id}.png"
        final_image_path = os.path.join("static", final_image_name)

        if os.path.exists(original_debug_path):
            shutil.move(original_debug_path, final_image_path)
        else:

            print(f"Warning: Debug image not found at {original_debug_path}")

        full_text = "\n".join([b["content"] for b in layout_data])
        profile_data = structure_data_with_llm(full_text)

        if not profile_data.get("is_resume", False):
            return {
                "status": "error",
                "message": "This document does not seem to be a Resume/CV.",
            }

        image_url = f"http://127.0.0.1:8000/static/{final_image_name}"

        return {
            "status": "success",
            "profile_data": profile_data,
            "visual_data": layout_data,
            "image_url": image_url,
        }
    except Exception as e:
        print(f"Error processing file: {e}")
        return {"status": "error", "message": str(e)}
    finally:
        if os.path.exists(input_path):
            os.remove(input_path)


@app.post("/save")
def save_candidate(candidate: CandidateCreate, db: Session = Depends(get_db)):
    db_candidate = Candidate(
        full_name=candidate.full_name,
        email=candidate.email,
        phone=candidate.phone,
        skills=candidate.skills,
        summary=candidate.summary,
    )
    db.add(db_candidate)
    db.commit()
    db.refresh(db_candidate)
    return {"status": "success", "id": db_candidate.id}


@app.get("/history")
def get_history(db: Session = Depends(get_db)):
    candidates = (
        db.query(Candidate).order_by(Candidate.created_at.desc()).limit(50).all()
    )
    return candidates


@app.delete("/history/{candidate_id}")
def delete_candidate(candidate_id: int, db: Session = Depends(get_db)):
    candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")

    db.delete(candidate)
    db.commit()
    return {"status": "success", "message": "Candidate deleted"}
