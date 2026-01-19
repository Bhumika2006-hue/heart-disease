from __future__ import annotations

import os
import threading
import time
from dataclasses import dataclass
from typing import Optional

import torch
import torch.nn as nn
from huggingface_hub import hf_hub_download
from PIL import Image
from torchvision import models, transforms


@dataclass(frozen=True)
class ModelConfig:
    repo_id: str
    filename: str
    image_size: int = 896


class ModelService:
    def __init__(
        self,
        config: ModelConfig,
        device: Optional[str] = None,
    ):
        self.config = config
        self.device = device or ("cuda" if torch.cuda.is_available() else "cpu")
        self._lock = threading.Lock()
        self._model: Optional[nn.Module] = None
        self._threshold: Optional[float] = None
        self._transform = transforms.Compose(
            [
                transforms.Resize((self.config.image_size, self.config.image_size)),
                transforms.Grayscale(num_output_channels=3),
                transforms.ToTensor(),
                transforms.Normalize(mean=[0.5, 0.5, 0.5], std=[0.5, 0.5, 0.5]),
            ]
        )

    @property
    def model(self) -> nn.Module:
        if self._model is not None:
            return self._model

        with self._lock:
            if self._model is None:
                self._model = self._load_model()
        return self._model

    @property
    def threshold(self) -> float:
        if self._threshold is not None:
            return self._threshold

        with self._lock:
            if self._threshold is not None:
                return self._threshold

            env_threshold = os.getenv("OPTIMAL_THRESHOLD")
            if env_threshold:
                try:
                    self._threshold = float(env_threshold)
                    return self._threshold
                except ValueError:
                    pass

            # Try to pull from deployment_config.json if present in the model repo
            try:
                cfg_path = hf_hub_download(
                    repo_id=self.config.repo_id,
                    filename="deployment_config.json",
                    repo_type="model",
                    token=os.getenv("HF_TOKEN"),
                )
                import json

                with open(cfg_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                threshold = data.get("optimal_threshold")
                if threshold is not None:
                    self._threshold = float(threshold)
                    return self._threshold
            except Exception:
                pass

            self._threshold = 0.5
            return self._threshold

    def _load_model(self) -> nn.Module:
        ckpt_path = hf_hub_download(
            repo_id=self.config.repo_id,
            filename=self.config.filename,
            repo_type="model",
            token=os.getenv("HF_TOKEN"),
        )

        model = models.densenet169(weights=None)
        model.classifier = nn.Linear(model.classifier.in_features, 2)

        # PyTorch 2.6+ enforces weights_only=True by default for security.
        # We explicitly set weights_only=False for loading model checkpoints
        # that may contain optimizer states or other pickle objects.
        checkpoint = torch.load(ckpt_path, map_location="cpu", weights_only=False)
        state_dict = checkpoint.get("model_state_dict", checkpoint)
        model.load_state_dict(state_dict, strict=False)

        model.eval()
        model.to(self.device)
        return model

    def predict(self, image: Image.Image) -> dict:
        started = time.perf_counter()

        if image.mode != "L":
            image = image.convert("L")

        x = self._transform(image).unsqueeze(0)
        x = x.to(self.device)

        with torch.inference_mode():
            logits = self.model(x)
            probs = torch.softmax(logits, dim=1)[0].detach().cpu().float().numpy()

        prob_normal = float(probs[0])
        prob_sick = float(probs[1])
        threshold = float(self.threshold)
        is_sick = prob_sick > threshold
        label = "Sick" if is_sick else "Normal"

        ended = time.perf_counter()
        return {
            "label": label,
            "is_sick": is_sick,
            "prob_sick": prob_sick,
            "prob_normal": prob_normal,
            "threshold": threshold,
            "image_size": self.config.image_size,
            "inference_ms": int((ended - started) * 1000),
        }
