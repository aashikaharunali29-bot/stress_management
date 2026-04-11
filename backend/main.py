from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from auth import router as auth_router
from database import engine
from emotion_api import router as emotion_router
from flow_api import router as flow_router
from models import Base
from questions_api import router as questions_router
from stress_engine import router as stress_router

load_dotenv(Path(__file__).with_name(".env"))

app = FastAPI(title="Stress Detection System")

Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/auth")
app.include_router(questions_router, prefix="/questions")
app.include_router(stress_router, prefix="/stress")
app.include_router(emotion_router, prefix="/emotion")
app.include_router(flow_router, prefix="/flow")


@app.get("/")
def root():
    return {"message": "Stress Detection System API running"}
