import { useEffect, useRef } from "react";

export function ScrollProgress() {
  const barRef = useRef(null);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;

    const onScroll = () => {
      const scrolled = window.scrollY;
      const max =
        document.documentElement.scrollHeight - window.innerHeight;
      const pct = max > 0 ? (scrolled / max) * 100 : 0;
      bar.style.width = `${pct}%`;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    /* sits right above the navbar (z-[9999]) */
    <div className="fixed top-0 left-0 right-0 z-[9999] h-[2.5px] pointer-events-none">
      <div
        ref={barRef}
        className="h-full"
        style={{
          width: "0%",
          background:
            "linear-gradient(90deg, #6366f1 0%, #a855f7 50%, #3b82f6 100%)",
          boxShadow: "0 0 8px rgba(99,91,255,0.6)",
          transition: "width 0.08s linear",
        }}
      />
    </div>
  );
}
