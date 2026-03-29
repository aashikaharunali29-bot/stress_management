from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine
from models import Base
from auth import router as auth_router
from questions_api import router as questions_router
from stress_engine import router as stress_router
from dotenv import load_dotenv
load_dotenv()
app = FastAPI(title="Stress Detection System")

# Create all DB tables on startup (safe - skips existing)
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


@app.get("/")
def root():
    return {"message": "Stress Detection System API running ✅"}