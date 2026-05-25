import { useEffect } from "react";

export function ClickRipple() {
  useEffect(() => {
    const onClick = (e) => {
      /* Skip text inputs */
      if (["INPUT", "SELECT", "TEXTAREA"].includes(e.target.tagName)) return;

      const dark = document.documentElement.classList.contains("dark");
      const color = dark
        ? "rgba(99,91,255,0.30)"
        : "rgba(85,75,255,0.40)";

      const el = document.createElement("div");
      Object.assign(el.style, {
        position: "fixed",
        left: `${e.clientX}px`,
        top: `${e.clientY}px`,
        width: "0",
        height: "0",
        borderRadius: "50%",
        transform: "translate(-50%, -50%)",
        pointerEvents: "none",
        zIndex: "9997",
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        animation: "ripple-expand 0.75s cubic-bezier(0.22, 0.61, 0.36, 1) forwards",
      });

      document.body.appendChild(el);
      el.addEventListener("animationend", () => el.remove());
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}
