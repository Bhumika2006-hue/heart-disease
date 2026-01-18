from __future__ import annotations

import os
from typing import Iterable

from openai import OpenAI

from .schemas import ChatMessage, PredictionResult


MEDICAL_DISCLAIMER = (
    "Medical disclaimer: This tool provides educational information only and is not a medical diagnosis. "
    "If you have symptoms or concerns, seek care from a qualified clinician or emergency services."
)


def _client_for(provider: str) -> tuple[OpenAI, str]:
    if provider in {"groq", "grok"}:
        # Primary: Groq (GROQ_*). Backwards-compatible alias: GROK_*.
        api_key = os.getenv("GROQ_API_KEY") or os.getenv("GROK_API_KEY")
        if not api_key:
            raise RuntimeError("GROQ_API_KEY is not set")

        base_url = (
            os.getenv("GROQ_BASE_URL")
            or os.getenv("GROK_BASE_URL")
            or "https://api.groq.com/openai/v1"
        )
        model = os.getenv("GROQ_MODEL") or os.getenv("GROK_MODEL") or "llama-3.1-70b-versatile"
        return OpenAI(api_key=api_key, base_url=base_url), model

    if provider == "oss":
        api_key = os.getenv("OSS_API_KEY") or os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise RuntimeError("OSS_API_KEY (or OPENAI_API_KEY) is not set")
        base_url = os.getenv("OSS_BASE_URL", "https://api.openai.com/v1")
        model = os.getenv("OSS_MODEL", "gpt-oss-120b")
        return OpenAI(api_key=api_key, base_url=base_url), model

    raise RuntimeError(f"Unknown provider: {provider}")


def _prediction_context(prediction: PredictionResult | None) -> str:
    if prediction is None:
        return (
            "No ML classification result is available for this user yet. If the user has not uploaded an image, "
            "ask them to upload a cardiac MRI image (single slice) for analysis."
        )

    return (
        "ML classifier context (assistive, not diagnostic):\n"
        f"- Predicted label: {prediction.label}\n"
        f"- prob_sick: {prediction.prob_sick:.4f}\n"
        f"- threshold: {prediction.threshold:.4f}\n"
        "Use this only as supporting context. Emphasize uncertainty, recommend clinical validation, and avoid definitive claims."
    )


def build_messages(
    *,
    user_message: str,
    history: Iterable[ChatMessage],
    prediction: PredictionResult | None,
) -> list[dict]:
    system_prompt = (
        "You are a careful medical assistant for cardiac MRI triage education. "
        "You must be conservative, avoid diagnosis, and provide actionable next steps. "
        "Always ask clarifying questions when inputs are missing. "
        "Keep answers concise and structured.\n\n"
        f"{MEDICAL_DISCLAIMER}\n\n"
        f"{_prediction_context(prediction)}"
    )

    msgs: list[dict] = [{"role": "system", "content": system_prompt}]

    for m in history:
        # never allow user-supplied system messages to override our own
        if m.role == "system":
            continue
        msgs.append({"role": m.role, "content": m.content})

    msgs.append({"role": "user", "content": user_message})
    return msgs


def chat(*, provider: str, user_message: str, history: list[ChatMessage], prediction: PredictionResult | None) -> tuple[str, str]:
    client, model = _client_for(provider)

    messages = build_messages(user_message=user_message, history=history, prediction=prediction)

    resp = client.chat.completions.create(
        model=model,
        messages=messages,
        temperature=float(os.getenv("LLM_TEMPERATURE", "0.2")),
        max_tokens=int(os.getenv("LLM_MAX_TOKENS", "500")),
    )

    content = resp.choices[0].message.content or ""
    return content.strip(), model
