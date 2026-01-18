'use client';

import { useEffect, useRef } from 'react';

type Heart = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  hue: number;
};

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function drawHeart(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  const s = size;
  ctx.beginPath();
  ctx.moveTo(x, y + s * 0.3);
  ctx.bezierCurveTo(x, y, x - s, y, x - s, y + s * 0.55);
  ctx.bezierCurveTo(x - s, y + s * 1.05, x - s * 0.25, y + s * 1.25, x, y + s * 1.45);
  ctx.bezierCurveTo(x + s * 0.25, y + s * 1.25, x + s, y + s * 1.05, x + s, y + s * 0.55);
  ctx.bezierCurveTo(x + s, y, x, y, x, y + s * 0.3);
  ctx.closePath();
}

export default function BackgroundHearts() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let hearts: Heart[] = [];

    const resize = () => {
      const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.max(16, Math.min(34, Math.floor(window.innerWidth / 42)));
      hearts = new Array(count).fill(null).map(() => ({
        x: rand(0, window.innerWidth),
        y: rand(0, window.innerHeight),
        vx: rand(-0.18, 0.18),
        vy: rand(-0.12, 0.16),
        size: rand(10, 42),
        opacity: rand(0.05, 0.16),
        hue: rand(195, 215),
      }));
    };

    const step = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      for (const h of hearts) {
        h.x += h.vx;
        h.y += h.vy;

        if (h.x < -60) h.x = window.innerWidth + 60;
        if (h.x > window.innerWidth + 60) h.x = -60;
        if (h.y < -60) h.y = window.innerHeight + 60;
        if (h.y > window.innerHeight + 60) h.y = -60;

        ctx.save();
        ctx.globalAlpha = h.opacity;

        const grad = ctx.createRadialGradient(h.x, h.y, 0, h.x, h.y, h.size * 1.6);
        grad.addColorStop(0, `hsla(${h.hue}, 90%, 98%, ${h.opacity})`);
        grad.addColorStop(1, `hsla(${h.hue}, 90%, 70%, 0)`);
        ctx.fillStyle = grad;

        drawHeart(ctx, h.x, h.y, h.size);
        ctx.fill();
        ctx.restore();
      }

      raf = window.requestAnimationFrame(step);
    };

    resize();
    raf = window.requestAnimationFrame(step);
    window.addEventListener('resize', resize);

    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        filter: 'blur(0.2px)',
      }}
    />
  );
}
