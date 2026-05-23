import asyncio

from fastapi import APIRouter, HTTPException

from app.models.schemas import AnalyzeRequest, AnalysisResponse
from app.routers.upload import get_image
from app.services.claude_service import analyze_with_claude
from app.services.color_analysis import get_problematic_pairs
from app.services.cvd_pipeline import image_to_base64, simulate_cvd

router = APIRouter()


@router.post("/analyze", response_model=AnalysisResponse)
async def analyze(body: AnalyzeRequest) -> AnalysisResponse:
    image_array = get_image(body.image_id)

    async def _color_analysis() -> dict:
        return get_problematic_pairs(image_array)

    async def _simulate_all() -> dict[str, str]:
        conditions = ["deuteranopia", "protanopia", "tritanopia"]
        results = {}
        for cond in conditions:
            sim = simulate_cvd(image_array, cond, severity=1.0)
            results[cond] = image_to_base64(sim)
        return results

    try:
        color_data, _ = await asyncio.gather(
            _color_analysis(),
            _simulate_all(),
        )
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail={"error": "analysis_failed", "message": str(exc)},
        ) from exc

    dominant_colors = color_data["dominant_colors"]
    contrast_pairs = color_data["contrast_pairs"]
    image_b64 = image_to_base64(image_array)

    try:
        claude_result = await analyze_with_claude(image_b64, dominant_colors, contrast_pairs)
    except ValueError as exc:
        raise HTTPException(
            status_code=500,
            detail={"error": "analysis_failed", "message": str(exc)},
        ) from exc

    try:
        conditions_parsed = {}
        for cond_name, cond_data in claude_result.get("conditions", {}).items():
            conditions_parsed[cond_name] = {
                "severity": cond_data.get("severity", "none"),
                "issues": cond_data.get("issues", []),
            }

        return AnalysisResponse(
            image_id=body.image_id,
            overall_score=int(claude_result.get("overall_score", 0)),
            affected_population_pct=float(claude_result.get("affected_population_pct", 0.0)),
            conditions=conditions_parsed,
            top_issues=claude_result.get("top_issues", []),
            summary=claude_result.get("summary", ""),
            dominant_colors=dominant_colors,
            contrast_pairs=contrast_pairs,
        )
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail={"error": "analysis_failed", "message": f"Failed to parse Claude response: {exc}"},
        ) from exc
