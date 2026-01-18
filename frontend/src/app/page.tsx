'use client';

import { useState } from 'react';

import ChatAssistant from '@/components/ChatAssistant';
import ImageClassifier from '@/components/ImageClassifier';
import type { PredictionResult } from '@/lib/api';

function HeartIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 21s-7.2-4.6-9.6-9C.7 8.7 2.1 5.7 5.3 5.1c1.9-.4 3.7.4 4.7 2 1-1.6 2.8-2.4 4.7-2 3.2.6 4.6 3.6 2.9 6.9C19.2 16.4 12 21 12 21Z"
        fill="rgba(230, 34, 80, 0.9)"
      />
    </svg>
  );
}

export default function Page() {
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);

  return (
    <div className="container">
      <header className="header">
        <div className="brand">
          <div className="logo">
            <HeartIcon />
          </div>
          <div>
            <h1 className="h1">Cardiac MRI Classifier</h1>
            <p className="subtitle">Production client UI · Multi-user friendly · FastAPI + Hugging Face model</p>
          </div>
        </div>

        <div className="pillRow" aria-label="Highlights">
          <span className="pill">Patient-level training</span>
          <span className="pill">DenseNet-169</span>
          <span className="pill">896px pipeline</span>
          <span className="pill">Assistive only</span>
        </div>
      </header>

      <div className="grid">
        <ImageClassifier onPrediction={setPrediction} />
        <ChatAssistant prediction={prediction} />
      </div>

      <p className="small" style={{ marginTop: 18 }}>
        <strong>Accessibility & safety:</strong> This app is designed to run on mobile and desktop. The ML output and the chat assistant are
        for informational purposes only; always consult qualified healthcare professionals.
      </p>
    </div>
  );
}
