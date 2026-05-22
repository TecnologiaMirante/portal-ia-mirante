/**
 * CursorFX
 * ─────────────────────────────────────────────────────────────
 * 1. Soft radial glow that lazily follows the cursor (lerp)
 * 2. Canvas sparkle trail on mouse movement
 * Both run in a single requestAnimationFrame loop.
 */
import { useEffect, useRef } from "react";

const COLORS = ["#818cf8", "#a78bfa", "#93c5fd", "#c4b5fd", "#7dd3fc", "#6366f1"];
const MAX_PARTICLES = 80;

export function CursorFX() {
  const glowRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    /* ── skip on touch-only devices ─────────────────────── */
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const glow = glowRef.current;
    const canvas = canvasRef.current;
    if (!glow || !canvas) return;

    const ctx = canvas.getContext("2d");

    /* State */
    const mouse = { x: -1000, y: -1000 };
    const glowPos = { x: -1000, y: -1000 };
    const particles = [];
    let lastX = -1000;
    let lastY = -1000;
    let rafId;

    /* Resize canvas */
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize, { passive: true });

    /* Track mouse */
    const onMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;

      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      const speed = Math.sqrt(dx * dx + dy * dy);

      if (speed > 5 && lastX > 0 && particles.length < MAX_PARTICLES) {
        const count = Math.min(Math.ceil(speed / 7), 4);
        for (let i = 0; i < count; i++) {
          const angle = Math.random() * Math.PI * 2;
          const spread = Math.random() * 8;
          particles.push({
            x: e.clientX + Math.cos(angle) * spread,
            y: e.clientY + Math.sin(angle) * spread,
            vx: (Math.random() - 0.5) * 1.2 + dx * 0.05,
            vy: -(Math.random() * 2 + 0.5),
            life: 1,
            size: Math.random() * 2.5 + 0.8,
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
            spin: (Math.random() - 0.5) * 0.2,
          });
        }
      }
      lastX = e.clientX;
      lastY = e.clientY;
    };
    window.addEventListener("mousemove", onMove, { passive: true });

    /* RAF loop */
    const loop = () => {
      /* ── Glow lerp ───────────────────────────────────── */
      glowPos.x += (mouse.x - glowPos.x) * 0.06;
      glowPos.y += (mouse.y - glowPos.y) * 0.06;
      glow.style.transform = `translate3d(${glowPos.x - 320}px, ${glowPos.y - 320}px, 0)`;

      /* ── Particles ───────────────────────────────────── */
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy -= 0.045; /* float up */
        p.vx *= 0.97;
        p.life -= 0.028;

        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }

        const radius = p.size * Math.max(p.life, 0);
        ctx.save();
        ctx.globalAlpha = p.life * 0.75;
        /* Tiny star shape (4-point) */
        ctx.translate(p.x, p.y);
        ctx.rotate(p.spin * (1 - p.life) * 10);
        ctx.beginPath();
        for (let k = 0; k < 4; k++) {
          const angle = (k / 4) * Math.PI * 2;
          const r = k % 2 === 0 ? radius : radius * 0.4;
          const x = Math.cos(angle) * r;
          const y = Math.sin(angle) * r;
          k === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fillStyle = p.color;
        ctx.fill();
        ctx.restore();
      }

      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <>
      {/* Soft glow blob */}
      <div
        ref={glowRef}
        className="pointer-events-none fixed top-0 left-0 z-[9988] w-[640px] h-[640px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(99,91,255,0.07) 0%, rgba(168,85,247,0.04) 40%, transparent 70%)",
          willChange: "transform",
        }}
      />
      {/* Particle canvas */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none fixed top-0 left-0 z-[9989]"
        style={{ willChange: "transform" }}
      />
    </>
  );
}
