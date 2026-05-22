import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 500);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <button
      onClick={scrollToTop}
      aria-label="Voltar ao topo"
      className={[
        "fixed bottom-6 right-6 z-40",
        "w-10 h-10 rounded-full",
        "bg-primary text-primary-foreground",
        "shadow-lg shadow-primary/30",
        "flex items-center justify-center",
        "hover:bg-primary/90 hover:scale-110 hover:shadow-primary/50",
        "transition-all duration-200",
        visible
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 translate-y-4 pointer-events-none",
      ].join(" ")}
    >
      <ArrowUp className="w-4 h-4" />
    </button>
  );
}
