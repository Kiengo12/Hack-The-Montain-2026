from fastapi import APIRouter, HTTPException

from app.models.schemas import CorrectRequest, ImageResponse, SimulateRequest
from app.routers.upload import get_image
from app.services.cvd_pipeline import correct_cvd, image_to_base64, simulate_cvd

router = APIRouter()


@router.post("/simulate", response_model=ImageResponse)
async def simulate(body: SimulateRequest) -> ImageResponse:
    image_array = get_image(body.image_id)
    try:
        simulated = simulate_cvd(image_array, body.condition, body.severity)
        b64 = image_to_base64(simulated)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    return ImageResponse(
        image_id=body.image_id,
        image_base64=b64,
        condition=body.condition,
        severity=body.severity,
    )


@router.post("/correct", response_model=ImageResponse)
async def correct(body: CorrectRequest) -> ImageResponse:
    image_array = get_image(body.image_id)
    try:
        corrected = correct_cvd(image_array, body.condition, body.severity)
        b64 = image_to_base64(corrected)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    return ImageResponse(
        image_id=body.image_id,
        image_base64=b64,
        condition=body.condition,
        severity=body.severity,
    )
