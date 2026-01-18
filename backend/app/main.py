from __future__ import annotations

import io
import os
from typing import Any

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image

from .llm import MEDICAL_DISCLAIMER, chat
from .model_service import ModelConfig, ModelService
from .schemas import ChatRequest, ChatResponse, ClassifyResponse, PredictionResult


def _cors_origins() -> list[str]:
    raw = os.getenv("CORS_ORIGINS", "*").strip()
    if raw == "*":
        return ["*"]
    return [o.strip() for o in raw.split(",") if o.strip()]


MODEL_REPO = os.getenv("MODEL_REPO", "Arko007/cardiac-mri-cnn")
MODEL_FILE = os.getenv("MODEL_FILE", "best_model_epoch20_auc0.8129.pt")
IMAGE_SIZE = int(os.getenv("IMAGE_SIZE", "896"))

model_service = ModelService(ModelConfig(repo_id=MODEL_REPO, filename=MODEL_FILE, image_size=IMAGE_SIZE))

app = FastAPI(
    title="Cardiac MRI Classifier API",
    version="1.0.0",
    description="FastAPI backend for cardiac MRI classification + medical assistant chat.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins(),
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root() -> dict[str, Any]:
    return {
        "name": "Cardiac MRI Classifier API",
        "docs": "/docs",
        "health": "/health",
    }


@app.get("/health")
def health() -> dict[str, Any]:
    return {
        "status": "ok",
        "device": model_service.device,
        "model_repo": MODEL_REPO,
        "model_file": MODEL_FILE,
        "image_size": IMAGE_SIZE,
    }


@app.post("/classify", response_model=ClassifyResponse)
async def classify(file: UploadFile = File(...)) -> ClassifyResponse:
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Please upload an image file.")

    try:
        raw = await file.read()
        with Image.open(io.BytesIO(raw)) as im:
            im.load()
            image = im.copy()
    except Exception:
        raise HTTPException(status_code=400, detail="Could not read the uploaded image.")

    pred_dict = model_service.predict(image)

    prediction = PredictionResult(
        label=pred_dict["label"],
        is_sick=pred_dict["is_sick"],
        prob_sick=pred_dict["prob_sick"],
        prob_normal=pred_dict["prob_normal"],
        threshold=pred_dict["threshold"],
        model_repo=MODEL_REPO,
        model_file=MODEL_FILE,
        image_size=pred_dict["image_size"],
        inference_ms=pred_dict["inference_ms"],
    )

    return ClassifyResponse(prediction=prediction, disclaimer=MEDICAL_DISCLAIMER)


@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(req: ChatRequest) -> ChatResponse:
    try:
        reply, model = chat(
            provider=req.provider,
            user_message=req.message,
            history=req.history,
            prediction=req.prediction,
        )
    except RuntimeError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception:
        raise HTTPException(status_code=500, detail="Chat provider request failed.")

    return ChatResponse(reply=reply, provider=req.provider, model=model, disclaimer=MEDICAL_DISCLAIMER)

