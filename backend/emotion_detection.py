from fer import FER
import cv2
import numpy as np
from fastapi import UploadFile

def detect_emotion_from_image(file_or_bytes):
    if isinstance(file_or_bytes, UploadFile):
        # Read image from UploadFile
        image = np.frombuffer(file_or_bytes.file.read(), np.uint8)
    else:
        # Assume raw bytes
        image = np.frombuffer(file_or_bytes, np.uint8)
    img = cv2.imdecode(image, cv2.IMREAD_COLOR)
    detector = FER(mtcnn=True)
    result = detector.detect_emotions(img)
    if result and result[0]["emotions"]:
        # Return the emotion with the highest score
        return max(result[0]["emotions"], key=result[0]["emotions"].get)
    return "Neutral"
