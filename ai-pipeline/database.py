from sqlalchemy import create_engine, Column, Integer, String, JSON, DateTime, Boolean, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import os

SQLALCHEMY_DATABASE_URL = os.getenv(
    "DATABASE_URL", "postgresql://postgres:password@localhost:5432/ats_db"
)

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class Candidate(Base):
    __tablename__ = "candidates"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, index=True)
    email = Column(String)
    phone = Column(String)
    skills = Column(JSON)
    summary = Column(String)
    score = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


Base.metadata.create_all(bind=engine)

# Run after create_all so the table always exists first.
# Uses text() as required by SQLAlchemy 2.x; engine.begin() auto-commits DDL.
with engine.begin() as conn:
    conn.execute(text("ALTER TABLE candidates ADD COLUMN IF NOT EXISTS score INTEGER;"))
