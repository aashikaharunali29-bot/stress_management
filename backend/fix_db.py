"""
Question-table cleanup utility.
This no longer seeds hardcoded questions. Runtime questions are fetched dynamically via API.
"""

from database import engine, SessionLocal
from models import Base, PersonalityQuestion, StressQuestion

Base.metadata.create_all(bind=engine)
print("Tables ensured")

db = SessionLocal()
db.query(PersonalityQuestion).delete()
db.query(StressQuestion).delete()
db.commit()
db.close()

print("Cleared cached DB question rows.")
print("Questions are now fetched at runtime from the configured source or the official IPIP public-domain questionnaire.")
print("Run: uvicorn main:app --reload")
