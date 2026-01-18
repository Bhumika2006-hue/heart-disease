'use client';

import { useMemo, useRef, useState } from 'react';

import { ChatMessage, PredictionResult, chat } from '@/lib/api';

function safeTrim(s: string) {
  return s.replace(/\s+/g, ' ').trim();
}

export default function ChatAssistant({ prediction }: { prediction: PredictionResult | null }) {
  const [provider, setProvider] = useState<'groq' | 'oss'>('groq');
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content:
        'Share your question about the cardiac MRI. If you already ran the classifier, I will incorporate its result as supportive context. I can also help you understand metrics and next steps to discuss with a clinician.',
    },
  ]);

  const logRef = useRef<HTMLDivElement | null>(null);

  const status = useMemo(() => {
    if (!prediction) return { label: 'No classification yet', danger: false };
    return { label: `Current ML: ${prediction.label} (prob_sick ${(prediction.prob_sick * 100).toFixed(1)}%)`, danger: prediction.is_sick };
  }, [prediction]);

  async function send() {
    const message = safeTrim(draft);
    if (!message || loading) return;

    setError(null);
    setLoading(true);

    const historyForRequest = messages;
    const nextMessages: ChatMessage[] = [...messages, { role: 'user', content: message }];
    setMessages(nextMessages);
    setDraft('');

    try {
      const res = await chat({
        message,
        history: historyForRequest,
        provider,
        prediction: prediction ?? undefined,
      });

      setMessages((prev) => [...prev, { role: 'assistant', content: res.reply }]);

      // scroll
      setTimeout(() => {
        logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: 'smooth' });
      }, 50);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Chat failed');
    } finally {
      setLoading(false);
    }
  }

  function clear() {
    setError(null);
    setMessages([
      {
        role: 'assistant',
        content:
          'New chat started. Ask anything about the MRI upload guidelines, the ML output, or general (non-diagnostic) information about CAD and next steps.',
      },
    ]);
  }

  return (
    <div className="card">
      <div className="cardHeader">
        <p className="cardTitle" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Medical Assistant Chat</span>
          <span className="badge">
            <span className={status.danger ? 'badgeDot badgeDotDanger' : 'badgeDot'} />
            <span style={{ fontWeight: 700 }}>{status.label}</span>
          </span>
        </p>
        <p className="hint">
          Choose a model provider, then chat. The assistant will be shown the ML classifier output (if available) to help contextualize answers.
        </p>
      </div>

      <div className="chat">
        <div ref={logRef} className="chatLog" aria-label="Chat messages">
          {messages.map((m, idx) => (
            <div key={idx} className={`msg ${m.role === 'user' ? 'msgUser' : 'msgAssistant'}`}>
              {m.content}
            </div>
          ))}
          {loading ? <div className="msg msgAssistant">Thinking…</div> : null}
        </div>

        <div className="chatFooter">
          <div className="row">
            <select
              className="select"
              value={provider}
              onChange={(e) => setProvider(e.target.value as 'groq' | 'oss')}
              aria-label="AI provider"
            >
              <option value="groq">Groq API</option>
              <option value="oss">GPT 120B OSS</option>
            </select>
            <button className="button" onClick={clear} disabled={loading}>
              New chat
            </button>
          </div>

          <div style={{ height: 10 }} />

          <label className="label" htmlFor="chatInput">Your message</label>
          <textarea
            id="chatInput"
            className="textarea"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Example: What does a high prob_sick mean, and what should I do next?"
            onKeyDown={(e) => {
              if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                void send();
              }
            }}
          />

          <div style={{ height: 10 }} />

          <div className="buttonRow">
            <button className="button buttonPrimary" onClick={() => void send()} disabled={loading || !safeTrim(draft)}>
              {loading ? 'Sending…' : 'Send'}
            </button>
          </div>

          {error ? (
            <p className="small" style={{ color: 'rgba(153, 0, 28, 0.9)' }}>
              {error}
            </p>
          ) : (
            <p className="small">
              Tip: Press <strong>Ctrl/⌘ + Enter</strong> to send.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
