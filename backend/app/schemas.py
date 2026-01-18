from __future__ import annotations

from typing import Literal, Optional

from pydantic import BaseModel, Field


class PredictionResult(BaseModel):
    label: Literal["Normal", "Sick"]
    is_sick: bool
    prob_sick: float = Field(..., ge=0.0, le=1.0)
    prob_normal: float = Field(..., ge=0.0, le=1.0)
    threshold: float = Field(..., ge=0.0, le=1.0)
    model_repo: str
    model_file: str
    image_size: int
    inference_ms: int


class ClassifyResponse(BaseModel):
    prediction: PredictionResult
    disclaimer: str


class ChatMessage(BaseModel):
    role: Literal["system", "user", "assistant"]
    content: str = Field(..., min_length=1, max_length=8000)


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=4000)
    history: list[ChatMessage] = Field(default_factory=list)
    provider: Literal["groq", "grok", "oss"] = "groq"
    prediction: Optional[PredictionResult] = None


class ChatResponse(BaseModel):
    reply: str
    provider: Literal["groq", "grok", "oss"]
    model: str
    disclaimer: str
