'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import { ClassifyResponse, PredictionResult, classifyImage } from '@/lib/api';

function pct(v: number) {
  return `${(v * 100).toFixed(1)}%`;
}

export default function ImageClassifier({
  onPrediction,
}: {
  onPrediction: (pred: PredictionResult | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ClassifyResponse | null>(null);

  const badge = useMemo(() => {
    if (!result?.prediction) return null;
    const sick = result.prediction.is_sick;
    return (
      <span className="badge" aria-label={`Current prediction: ${result.prediction.label}`}>
        <span className={sick ? 'badgeDot badgeDotDanger' : 'badgeDot'} />
        <span style={{ fontWeight: 750 }}>{result.prediction.label}</span>
        <span style={{ color: 'rgba(7,38,58,0.7)', fontSize: 12 }}>
          prob_sick {pct(result.prediction.prob_sick)}
        </span>
      </span>
    );
  }, [result]);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  async function run() {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const res = await classifyImage(file);
      setResult(res);
      onPrediction(res.prediction);
    } catch (e) {
      onPrediction(null);
      setResult(null);
      setError(e instanceof Error ? e.message : 'Classification failed');
    } finally {
      setLoading(false);
    }
  }

  function clear() {
    setFile(null);
    setResult(null);
    setError(null);
    onPrediction(null);
    if (inputRef.current) inputRef.current.value = '';
  }

  function onFiles(files: FileList | null) {
    const f = files?.[0];
    if (!f) return;
    setFile(f);
    setResult(null);
    setError(null);
    onPrediction(null);
  }

  return (
    <div className="card">
      <div className="cardHeader">
        <p className="cardTitle" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Image Classification</span>
          {badge}
        </p>
        <p className="hint">
          Upload a single cardiac MRI slice (best quality, centered, not rotated). The ML result is assistive and not a
          diagnosis.
        </p>
      </div>

      <div className="cardBody">
        <label className="label" htmlFor="mriFile">Cardiac MRI image</label>

        <div
          className={`drop ${dragActive ? 'dropActive' : ''}`}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click();
          }}
          onClick={() => inputRef.current?.click()}
          onDragEnter={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setDragActive(true);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setDragActive(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setDragActive(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setDragActive(false);
            onFiles(e.dataTransfer.files);
          }}
          aria-label="Upload MRI image"
        >
          <div style={{ fontWeight: 700 }}>Drag & drop or click to upload</div>
          <div className="hint">Accepted: PNG/JPG/JPEG/BMP/TIFF · Recommended: original resolution</div>

          <input
            ref={inputRef}
            className="input"
            id="mriFile"
            type="file"
            accept="image/*"
            onChange={(e) => onFiles(e.target.files)}
            style={{ display: 'none' }}
          />

          {previewUrl ? (
            <div className="preview" aria-label="Preview">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previewUrl} alt="Uploaded cardiac MRI preview" />
            </div>
          ) : null}
        </div>

        <div style={{ height: 12 }} />

        <div className="buttonRow">
          <button className="button buttonPrimary" onClick={run} disabled={!file || loading}>
            {loading ? 'Analyzing…' : 'Run classifier'}
          </button>
          <button className="button" onClick={() => inputRef.current?.click()} disabled={loading}>
            Choose another
          </button>
          <button className="button buttonDanger" onClick={clear} disabled={loading}>
            Clear
          </button>
        </div>

        {error ? (
          <p className="small" style={{ color: 'rgba(153, 0, 28, 0.9)' }}>
            {error}
          </p>
        ) : null}

        {result ? (
          <>
            <hr className="sep" />
            <div className="kv" aria-label="Classification details">
              <div className="kvRow">
                <span className="k">Prediction</span>
                <span className="v">{result.prediction.label}</span>
              </div>
              <div className="kvRow">
                <span className="k">Prob (Sick)</span>
                <span className="v">{pct(result.prediction.prob_sick)}</span>
              </div>
              <div className="kvRow">
                <span className="k">Threshold used</span>
                <span className="v">{result.prediction.threshold.toFixed(4)}</span>
              </div>
              <div className="kvRow">
                <span className="k">Inference time</span>
                <span className="v">{result.prediction.inference_ms} ms</span>
              </div>
              <div className="kvRow">
                <span className="k">Model</span>
                <span className="v" style={{ textAlign: 'right' }}>
                  {result.prediction.model_repo}
                  <br />
                  <span style={{ fontWeight: 600, color: 'rgba(7,38,58,0.7)' }}>{result.prediction.model_file}</span>
                </span>
              </div>
            </div>

            <p className="small" style={{ marginTop: 12 }}>
              <strong>Disclaimer:</strong> {result.disclaimer}
            </p>
          </>
        ) : null}
      </div>
    </div>
  );
}
