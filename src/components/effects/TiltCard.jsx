import { useRef } from "react";

/**
 * TiltCard
 * Wraps children in a 3D tilt container.
 * – Applies perspective + rotateX/Y on mouse move
 * – Shows a subtle specular shine overlay
 * – Smoothly resets on mouse leave
 *
 * Usage:
 *   <TiltCard className="glass-card rounded-2xl p-6">
 *     ...content
 *   </TiltCard>
 */
export function TiltCard({
  children,
  className = "",
  intensity = 7,
  shine = true,
  ...props
}) {
  const cardRef = useRef(null);
  const shineRef = useRef(null);

  const onMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;   // -0.5 → 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    card.style.transform = `perspective(900px) rotateX(${(-y * intensity).toFixed(2)}deg) rotateY(${(x * intensity).toFixed(2)}deg) translateZ(8px)`;
    card.style.transition = "transform 0.08s ease";

    if (shine && shineRef.current) {
      const sx = ((x + 0.5) * 100).toFixed(1);
      const sy = ((y + 0.5) * 100).toFixed(1);
      shineRef.current.style.opacity = "1";
      shineRef.current.style.background = `radial-gradient(circle at ${sx}% ${sy}%, rgba(255,255,255,0.11) 0%, transparent 55%)`;
    }
  };

  const onMouseLeave = () => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transform =
      "perspective(900px) rotateX(0deg) rotateY(0deg) translateZ(0)";
    card.style.transition = "transform 0.45s cubic-bezier(0.22, 0.61, 0.36, 1)";
    if (shineRef.current) shineRef.current.style.opacity = "0";
  };

  return (
    <div
      ref={cardRef}
      className={`relative ${className}`}
      style={{ transformStyle: "preserve-3d", willChange: "transform" }}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      {...props}
    >
      {/* Specular shine overlay */}
      {shine && (
        <div
          ref={shineRef}
          className="absolute inset-0 rounded-[inherit] pointer-events-none z-10 opacity-0"
          style={{ transition: "opacity 0.3s ease, background 0.1s ease" }}
        />
      )}
      {children}
    </div>
  );
}
