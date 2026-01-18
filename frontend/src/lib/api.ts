export type PredictionResult = {
  label: 'Normal' | 'Sick';
  is_sick: boolean;
  prob_sick: number;
  prob_normal: number;
  threshold: number;
  model_repo: string;
  model_file: string;
  image_size: number;
  inference_ms: number;
};

export type ClassifyResponse = {
  prediction: PredictionResult;
  disclaimer: string;
};

export type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export type ChatResponse = {
  reply: string;
  provider: 'grok' | 'oss';
  model: string;
  disclaimer: string;
};

export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:7860').replace(/\/$/, '');

async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit,
  ms: number,
): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);

  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
}

export async function classifyImage(file: File): Promise<ClassifyResponse> {
  const form = new FormData();
  form.append('file', file);

  const res = await fetch(`${API_BASE_URL}/classify`, {
    method: 'POST',
    body: form,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Classification failed (${res.status})`);
  }

  return (await res.json()) as ClassifyResponse;
}

export async function chat(
  params: {
    message: string;
    history: ChatMessage[];
    provider: 'grok' | 'oss';
    prediction?: PredictionResult;
  },
): Promise<ChatResponse> {
  const res = await fetchWithTimeout(
    `${API_BASE_URL}/chat`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: params.message,
        history: params.history.map((m) => ({ role: m.role, content: m.content })),
        provider: params.provider,
        prediction: params.prediction,
      }),
    },
    60_000,
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Chat failed (${res.status})`);
  }

  return (await res.json()) as ChatResponse;
}
