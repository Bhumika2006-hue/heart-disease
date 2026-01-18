# Cardiac MRI Classifier Web App (Client Deployment)

This repository contains a production-oriented **multi-user web app**:

- **Backend (Hugging Face Spaces)**: FastAPI inference API + medical-assistant chat.
- **Frontend (Vercel)**: Responsive, professional UI (manual CSS, glassy sky-blue background, animated hearts).

The ML model is loaded from **Hugging Face model repo**: `Arko007/cardiac-mri-cnn` (file: `best_model_epoch20_auc0.8129.pt`).

## 1) Backend (FastAPI) — deploy to Hugging Face Spaces

### Endpoints

- `GET /health`
- `POST /classify` (multipart form: `file`)
- `POST /chat` (JSON)

### Environment variables (Spaces → Settings → Variables/Secrets)

**Model / inference**
- `MODEL_REPO` (default: `Arko007/cardiac-mri-cnn`)
- `MODEL_FILE` (default: `best_model_epoch20_auc0.8129.pt`)
- `IMAGE_SIZE` (default: `896`)
- `OPTIMAL_THRESHOLD` (optional; overrides threshold)
- `HF_TOKEN` (optional; only if the model repo is private)

**CORS**
- `CORS_ORIGINS` (default: `*`) — set to your Vercel domain for tighter security

**Chat providers (OpenAI-compatible)**

**Groq**
- `GROQ_API_KEY` (required for `provider=groq`)
- `GROQ_BASE_URL` (default: `https://api.groq.com/openai/v1`)
- `GROQ_MODEL` (default: `openai/gpt-oss-120b`)

**GPT 120B OSS**
- `OSS_API_KEY` (or `OPENAI_API_KEY`) (required for `provider=oss`)
- `OSS_BASE_URL` (default: `https://api.openai.com/v1`)
- `OSS_MODEL` (default: `gpt-oss-120b`)

### Space runtime

This repo includes a root **Dockerfile** that runs the API on port **7860** (HF Spaces default).

## 2) Frontend (Next.js) — deploy to Vercel

### Vercel settings

- **Root Directory**: `frontend`
- **Environment Variable**:
  - `NEXT_PUBLIC_API_BASE_URL` = `https://<your-space-name>.hf.space`

### Local development

Backend:
```bash
python -m venv .venv && source .venv/bin/activate
pip install -r backend/requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 7860 --reload
```

Frontend:
```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000`.

## Safety

This project is **assistive** and **not** a medical diagnosis. Always consult qualified healthcare professionals.
