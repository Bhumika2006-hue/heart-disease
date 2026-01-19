'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import styles from './MedicalAIChat.module.css';
import { ChatMessage, PredictionResult, chat, classifyImage } from '@/lib/api';

function safeTrim(s: string) {
  return s.replace(/\s+/g, ' ').trim();
}

export default function MedicalAIChat() {
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content:
        'Hello! I\'m here to help you understand cardiac MRI images. You can ask me questions or upload an MRI scan for analysis. How can I assist you today?',
    },
  ]);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [currentPrediction, setCurrentPrediction] = useState<PredictionResult | null>(null);

  const logRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (!selectedImage) {
      setImagePreview(null);
      return;
    }
    const url = URL.createObjectURL(selectedImage);
    setImagePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [selectedImage]);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: 'smooth' });
    }, 50);
  }, []);

  async function handleSend() {
    const message = safeTrim(draft);
    
    // Handle image upload
    if (selectedImage) {
      setError(null);
      setLoading(true);
      setDraft('');
      
      // Show user message with image
      const userMsg: ChatMessage = {
        role: 'user',
        content: message || 'Please analyze this cardiac MRI image.',
      };
      setMessages((prev) => [...prev, userMsg]);
      scrollToBottom();

      try {
        // Classify the image
        const classifyResult = await classifyImage(selectedImage);
        setCurrentPrediction(classifyResult.prediction);
        
        // Send classification to chat for interpretation
        const interpretationPrompt = `I just uploaded a cardiac MRI scan. ${message ? message : 'Can you explain what this means?'}`;
        
        const chatResponse = await chat({
          message: interpretationPrompt,
          history: messages,
          provider: 'groq',
          prediction: classifyResult.prediction,
        });

        setMessages((prev) => [...prev, { role: 'assistant', content: chatResponse.reply }]);
        scrollToBottom();
        
        setSelectedImage(null);
        setImagePreview(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to analyze image');
        // Remove the user message on error
        setMessages((prev) => prev.slice(0, -1));
      } finally {
        setLoading(false);
      }
      return;
    }

    // Handle text-only message
    if (!message || loading) return;

    setError(null);
    setLoading(true);

    const historyForRequest = messages;
    const nextMessages: ChatMessage[] = [...messages, { role: 'user', content: message }];
    setMessages(nextMessages);
    setDraft('');
    scrollToBottom();

    try {
      const res = await chat({
        message,
        history: historyForRequest,
        provider: 'groq',
        prediction: currentPrediction ?? undefined,
      });

      setMessages((prev) => [...prev, { role: 'assistant', content: res.reply }]);
      scrollToBottom();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Chat failed');
    } finally {
      setLoading(false);
    }
  }

  function handleImageSelect(files: FileList | null) {
    const file = files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      setError(null);
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        const file = items[i].getAsFile();
        if (file) {
          setSelectedImage(file);
          setError(null);
          e.preventDefault();
        }
      }
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      void handleSend();
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.backgroundAnimation}>
        <div className={styles.queueScene}>
          <div className={styles.helpDesk}>
            <div className={styles.deskIcon}>?</div>
          </div>
          <div className={styles.people}>
            {[...Array(8)].map((_, i) => (
              <div key={i} className={styles.person} style={{ animationDelay: `${i * 0.3}s` }}>
                <div className={styles.personHead}></div>
                <div className={styles.personBody}></div>
              </div>
            ))}
          </div>
          <div className={styles.doctor}>
            <div className={styles.doctorHead}>
              <div className={styles.doctorCap}>
                <div className={styles.doctorCapSymbol}>+</div>
              </div>
            </div>
            <div className={styles.doctorBody}></div>
          </div>
        </div>
      </div>

      <div className={styles.chatContainer}>
        <div className={styles.chatHeader}>
          <h2 className={styles.chatTitle}>Medical AI Assistant</h2>
          <p className={styles.chatSubtitle}>Ask questions or upload cardiac MRI images for analysis</p>
        </div>

        <div ref={logRef} className={styles.chatLog}>
          {messages.map((m, idx) => (
            <div key={idx} className={`${styles.message} ${m.role === 'user' ? styles.messageUser : styles.messageAssistant}`}>
              <div className={styles.messageContent}>{m.content}</div>
            </div>
          ))}
          {loading && (
            <div className={`${styles.message} ${styles.messageAssistant}`}>
              <div className={styles.messageContent}>
                <div className={styles.typingIndicator}>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className={styles.chatInputContainer}>
          {error && <div className={styles.error}>{error}</div>}
          
          {imagePreview && (
            <div className={styles.imagePreviewChip}>
              <img src={imagePreview} alt="Selected MRI" className={styles.previewImage} />
              <button
                className={styles.removeImageButton}
                onClick={() => {
                  setSelectedImage(null);
                  setImagePreview(null);
                }}
                aria-label="Remove image"
              >
                ×
              </button>
            </div>
          )}

          <div className={styles.inputWrapper}>
            <button
              className={styles.attachButton}
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              aria-label="Attach image"
              title="Upload MRI image"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </button>
            
            <textarea
              ref={textareaRef}
              className={styles.textarea}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              placeholder="Type a message or paste an image..."
              disabled={loading}
              rows={1}
            />
            
            <button
              className={styles.sendButton}
              onClick={() => void handleSend()}
              disabled={loading || (!safeTrim(draft) && !selectedImage)}
              aria-label="Send message"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
              </svg>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleImageSelect(e.target.files)}
              style={{ display: 'none' }}
            />
          </div>

          <p className={styles.hint}>
            Tip: Press <strong>Ctrl/⌘ + Enter</strong> to send • Paste images directly into the chat
          </p>
        </div>
      </div>
    </div>
  );
}
