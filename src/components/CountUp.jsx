import { useEffect, useRef, useState } from "react";

/**
 * CountUp
 * Animates a numeric value from 0 to `value` when the element enters viewport.
 * Handles values like "200+", "100%", "1-clique" gracefully.
 *
 * @param {string|number} value  - e.g. "200+" or 42
 * @param {number} duration      - animation ms (default 1600)
 */
export function CountUp({ value, duration = 1600 }) {
  const ref = useRef(null);
  const started = useRef(false);
  const [display, setDisplay] = useState(() => {
    /* Show "0" + suffix initially */
    const m = String(value).match(/^(\d+)(.*)$/);
    return m ? "0" + m[2] : String(value);
  });

  const match = String(value).match(/^(\d+)(.*)$/);
  const target = match ? parseInt(match[1], 10) : null;
  const suffix = match ? match[2] : "";

  useEffect(() => {
    /* If no numeric part, just show as-is */
    if (target === null) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDisplay(String(value));
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const startTime = performance.now();

          const tick = (now) => {
            const elapsed = now - startTime;
            const t = Math.min(elapsed / duration, 1);
            /* Ease out cubic */
            const eased = 1 - Math.pow(1 - t, 3);
            setDisplay(Math.floor(eased * target) + suffix);
            if (t < 1) requestAnimationFrame(tick);
            else setDisplay(target + suffix);
          };
          requestAnimationFrame(tick);
          observer.unobserve(ref.current);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, suffix, duration, value]);

  return <span ref={ref}>{display}</span>;
}
