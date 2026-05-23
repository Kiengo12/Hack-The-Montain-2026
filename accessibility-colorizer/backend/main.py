import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import designer, museum, upload

load_dotenv()

app = FastAPI(title="ChromaAccess API", version="1.0.0")

allowed_origins = os.getenv("ALLOWED_ORIGINS", "*").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload.router)
app.include_router(museum.router)
app.include_router(designer.router)


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}
