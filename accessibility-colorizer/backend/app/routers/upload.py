import io
import os
import uuid

import numpy as np
from fastapi import APIRouter, HTTPException, UploadFile
from PIL import Image

from app.models.schemas import UploadResponse

router = APIRouter()

# In-memory image store keyed by UUID
_image_store: dict[str, np.ndarray] = {}

ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_SIDE = 1920


def get_image(image_id: str) -> np.ndarray:
    if image_id not in _image_store:
        raise HTTPException(status_code=404, detail=f"Image '{image_id}' not found")
    return _image_store[image_id]


@router.post("/upload", response_model=UploadResponse)
async def upload_image(file: UploadFile) -> UploadResponse:
    max_bytes = int(os.getenv("MAX_IMAGE_SIZE_MB", "10")) * 1024 * 1024

    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported file type '{file.content_type}'. Use JPEG, PNG, or WEBP.",
        )

    data = await file.read()
    if len(data) > max_bytes:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Maximum is {os.getenv('MAX_IMAGE_SIZE_MB', '10')} MB.",
        )

    try:
        pil_img = Image.open(io.BytesIO(data)).convert("RGB")
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Could not decode image: {exc}") from exc

    # Resize so the longest side is at most MAX_SIDE
    w, h = pil_img.size
    if max(w, h) > MAX_SIDE:
        ratio = MAX_SIDE / max(w, h)
        pil_img = pil_img.resize((int(w * ratio), int(h * ratio)), Image.LANCZOS)

    image_array = np.array(pil_img, dtype=np.uint8)
    image_id = str(uuid.uuid4())
    _image_store[image_id] = image_array

    h_out, w_out = image_array.shape[:2]
    return UploadResponse(image_id=image_id, width=w_out, height=h_out)
