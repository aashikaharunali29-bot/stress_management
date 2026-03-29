from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal
from models import User
from schemas import UserCreate
import bcrypt
import secrets

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def normalize_email(email: str) -> str:
    """Normalize email: lowercase + strip whitespace"""
    return email.lower().strip()


# ── Register ──────────────────────────────────────────────────────────────────
@router.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    email = normalize_email(user.email)

    existing = db.query(User).filter(User.email == email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed = bcrypt.hashpw(user.password.encode("utf-8"), bcrypt.gensalt())

    new_user = User(email=email, password=hashed.decode("utf-8"))
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"message": "User registered successfully", "email": email}


# ── Login ─────────────────────────────────────────────────────────────────────
@router.post("/login")
def login(user: UserCreate, db: Session = Depends(get_db)):
    email = normalize_email(user.email)

    # FIX: always normalize email before querying
    db_user = db.query(User).filter(User.email == email).first()

    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    if not bcrypt.checkpw(user.password.encode("utf-8"), db_user.password.encode("utf-8")):
        raise HTTPException(status_code=401, detail="Incorrect password")

    # Return a session token so frontend can track the logged-in user
    token = secrets.token_hex(32)

    return {
        "message": "Login successful",
        "email": email,
        "token": token
    }