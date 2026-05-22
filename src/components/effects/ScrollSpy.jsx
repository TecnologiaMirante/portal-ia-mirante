import { useEffect, useState } from "react";

const SECTIONS = [
  { id: "hero",            label: "Início" },
  { id: "recursos",        label: "Recursos" },
  { id: "ferramentas",     label: "Ferramentas" },
  { id: "implementacoes",  label: "Portais IA" },
  { id: "criacoes",        label: "Criações" },
  { id: "banco-prompts",   label: "Banco de Prompts" },
  { id: "premio-ia",       label: "Prêmio IA" },
];

export function ScrollSpy() {
  const [active, setActive] = useState("hero");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible.length > 0) setActive(visible[0].target.id);
      },
      { threshold: 0.3 }
    );

    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav
      className="fixed right-5 top-1/2 -translate-y-1/2 z-50 hidden xl:flex flex-col gap-3"
      aria-label="Navegação por seção"
    >
      {SECTIONS.map(({ id, label }) => {
        const isActive = active === id;
        return (
          <button
            key={id}
            onClick={() => scrollTo(id)}
            title={label}
            className="group relative flex items-center justify-end gap-2.5"
          >
            {/* Tooltip */}
            <span
              className={`
                absolute right-full mr-3 whitespace-nowrap text-xs font-medium
                rounded-md px-2 py-1 border pointer-events-none
                transition-all duration-200
                ${isActive
                  ? "opacity-100 translate-x-0 text-primary border-primary/30 bg-primary/8"
                  : "opacity-0 translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 text-muted-foreground border-border bg-background/80"
                }
              `}
              style={{ backdropFilter: "blur(8px)" }}
            >
              {label}
            </span>

            {/* Dot */}
            <div className="relative">
              <div
                className={`rounded-full transition-all duration-300 ${
                  isActive
                    ? "w-3 h-3 bg-primary ring-4 ring-primary/20 shadow-lg shadow-primary/40"
                    : "w-2 h-2 bg-muted-foreground/30 group-hover:bg-primary/50 group-hover:scale-125"
                }`}
              />
              {/* Ping ring when active */}
              {isActive && (
                <div className="absolute inset-0 rounded-full bg-primary/30 animate-ping" />
              )}
            </div>
          </button>
        );
      })}
    </nav>
  );
}
