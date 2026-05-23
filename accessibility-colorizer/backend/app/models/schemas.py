from pydantic import BaseModel, ConfigDict, Field


class UploadResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    image_id: str
    width: int
    height: int


class SimulateRequest(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    image_id: str
    condition: str = Field(..., pattern="^(deuteranopia|protanopia|tritanopia)$")
    severity: float = Field(..., ge=0.0, le=1.0)


class CorrectRequest(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    image_id: str
    condition: str = Field(..., pattern="^(deuteranopia|protanopia|tritanopia)$")
    severity: float = Field(..., ge=0.0, le=1.0)


class ImageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    image_id: str
    image_base64: str
    condition: str
    severity: float


class AnalyzeRequest(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    image_id: str


class DominantColor(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    hex: str
    percentage: float
    lab: list[float]


class ContrastPair(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    color1_hex: str
    color2_hex: str
    contrast_ratio: float
    passes_aa: bool
    passes_aaa: bool


class AccessibilityIssue(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    description: str
    affected_colors: list[str]
    recommendation: str
    suggested_colors: list[str]


class ConditionAnalysis(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    severity: str = Field(..., pattern="^(none|mild|moderate|severe)$")
    issues: list[AccessibilityIssue]


class AnalysisResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    image_id: str
    overall_score: int = Field(..., ge=0, le=100)
    affected_population_pct: float
    conditions: dict[str, ConditionAnalysis]
    top_issues: list[str]
    summary: str
    dominant_colors: list[DominantColor]
    contrast_pairs: list[ContrastPair]
