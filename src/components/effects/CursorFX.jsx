/**
 * CursorFX — Outline Arrow Cursor
 * ─────────────────────────────────────────────────────────────
 * • Seta outline (sem preenchimento sólido) via SVG no CSS
 * • Anel que aparece ao hover sobre elementos clicáveis
 * • Pulso ao clicar
 * • Rastro de partículas sutil
 */
import { useEffect, useRef } from "react";

const INTERACTIVE = "a,button,input,textarea,select,label,[role='button'],[tabindex]";
const BLUE        = "#1d4ed8";
const COLORS      = ["#3b82f6", "#60a5fa", "#1d4ed8", "#93c5fd", "#2563eb"];
const MAX_P       = 50;

/* ── SVG cursor (outline arrow azul forte) ──────────────── */
const makeCursorCSS = (strokeColor, strokeW = "1.6") => {
  const svg = encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24">` +
    `<path d="M4 3 L4 19 L7.5 15.5 L11 22 L13 21 L9.5 14.5 L15 14.5 Z" ` +
    `fill="white" fill-opacity="0.88" ` +
    `stroke="${strokeColor}" stroke-width="${strokeW}" stroke-linejoin="round"/>` +
    `</svg>`
  );
  return `url("data:image/svg+xml,${svg}") 4 3, auto`;
};

const CURSOR_DEFAULT = makeCursorCSS(BLUE, "1.6");

export function CursorFX() {
  const ringRef   = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const ring   = ringRef.current;
    const canvas = canvasRef.current;
    if (!ring || !canvas) return;

    const ctx = canvas.getContext("2d");

    /* ── CSS: cursor SVG + pointer em interativos + keyframe ── */
    const styleEl = document.createElement("style");
    styleEl.id = "cursor-fx-style";
    styleEl.textContent =
      `*, *::before, *::after { cursor: ${CURSOR_DEFAULT} !important; }\n` +
      `a, button, input, textarea, select, label,\n` +
      `[role='button'], [tabindex] { cursor: pointer !important; }\n` +
      `@keyframes ring-click {\n` +
      `  0%   { transform: var(--ring-t) scale(1);   opacity: 0.8; }\n` +
      `  50%  { transform: var(--ring-t) scale(1.7); opacity: 0.4; }\n` +
      `  100% { transform: var(--ring-t) scale(1);   opacity: var(--ring-base-opacity, 0); }\n` +
      `}`;
    document.head.appendChild(styleEl);

    /* ── State ───────────────────────────────────────── */
    const mouse   = { x: -300, y: -300 };
    const ringPos = { x: -300, y: -300 };
    let isHover   = false;
    let clicking  = false;
    const particles = [];
    let lastX = -300, lastY = -300;
    let rafId;

    /* ── Helpers ─────────────────────────────────────── */
    const setRingTransform = (x, y) => {
      const t = `translate3d(${x - 14}px, ${y - 14}px, 0)`;
      ring.style.setProperty("--ring-t", t);
      ring.style.transform = t;
    };

    /* ── Canvas resize ───────────────────────────────── */
    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize, { passive: true });

    /* ── Mouse move ──────────────────────────────────── */
    const onMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;

      const dx    = e.clientX - lastX;
      const dy    = e.clientY - lastY;
      const speed = Math.sqrt(dx * dx + dy * dy);

      if (speed > 3 && lastX > -299 && particles.length < MAX_P) {
        const count = Math.min(Math.ceil(speed / 11), 3);
        for (let i = 0; i < count; i++) {
          particles.push({
            x:     e.clientX + (Math.random() - 0.5) * 4,
            y:     e.clientY + (Math.random() - 0.5) * 4,
            vx:    dx * 0.02 + (Math.random() - 0.5) * 0.5,
            vy:    -(Math.random() * 1.0 + 0.2),
            life:  1,
            size:  Math.random() * 2 + 0.7,
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
          });
        }
      }
      lastX = e.clientX;
      lastY = e.clientY;
    };

    /* ── Hover ───────────────────────────────────────── */
    const onOver = (e) => {
      const was = isHover;
      isHover = !!e.target.closest(INTERACTIVE);
      if (isHover === was) return;
      /* Anel some quando hover (cursor vira pointer nativo) */
      ring.style.opacity   = "0";
      ring.style.animation = "none";
    };

    /* ── Click ───────────────────────────────────────── */
    const onDown = () => {
      clicking = true;
      ring.style.setProperty("--ring-base-opacity", isHover ? "0.7" : "0");
      ring.style.opacity   = "0.8";
      ring.style.animation = "none";
      /* force reflow */
      void ring.offsetWidth;
      ring.style.animation = "ring-click 0.38s ease-out forwards";
    };
    const onUp = () => {
      clicking = false;
    };

    window.addEventListener("mousemove",  onMove, { passive: true });
    window.addEventListener("mouseover",  onOver, { passive: true });
    window.addEventListener("mousedown",  onDown, { passive: true });
    window.addEventListener("mouseup",    onUp,   { passive: true });

    /* ── RAF loop ────────────────────────────────────── */
    const loop = () => {
      /* Ring lerp */
      ringPos.x += (mouse.x - ringPos.x) * 0.20;
      ringPos.y += (mouse.y - ringPos.y) * 0.20;
      if (!clicking) setRingTransform(ringPos.x, ringPos.y);

      /* Particles */
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x    += p.vx;
        p.y    += p.vy;
        p.vy   -= 0.028;
        p.vx   *= 0.97;
        p.life -= 0.030;

        if (p.life <= 0) { particles.splice(i, 1); continue; }

        ctx.save();
        ctx.globalAlpha = p.life * 0.45;
        ctx.shadowColor = p.color;
        ctx.shadowBlur  = 4;
        ctx.fillStyle   = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(p.size * p.life, 0.1), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);

    return () => {
      document.head.removeChild(styleEl);
      window.removeEventListener("resize",    resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup",   onUp);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <>
      {/* Anel hover / click */}
      <div
        ref={ringRef}
        className="pointer-events-none fixed top-0 left-0 z-[9999] rounded-full"
        style={{
          width:       "28px",
          height:      "28px",
          border:      "2px solid rgba(29,78,216,0.75)",
          opacity:     "0",
          willChange:  "transform, opacity",
          transition:  "opacity 0.18s ease",
        }}
      />

      {/* Rastro de partículas */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none fixed top-0 left-0 z-[9998]"
      />
    </>
  );
}
