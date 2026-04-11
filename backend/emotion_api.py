from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
from emotion_detection import detect_emotion_from_image
import base64
import numpy as np
import cv2

router = APIRouter()

# Model for receiving base64 image data
class FrameData(BaseModel):
    image_base64: str

@router.post("/detect_emotion")
async def detect_emotion(file: UploadFile = File(...)):
    emotion = detect_emotion_from_image(file)
    return {"emotion": emotion}

# New endpoint for live webcam frame (base64 image)
@router.post("/detect_emotion_frame")
async def detect_emotion_frame(data: FrameData):
    try:
        # Decode base64 image
        img_bytes = base64.b64decode(data.image_base64)
        nparr = np.frombuffer(img_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is None:
            raise ValueError("Invalid image data")
        # Use the same detection function (pass raw bytes)
        emotion = detect_emotion_from_image(img_bytes)
        return {"emotion": emotion}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
