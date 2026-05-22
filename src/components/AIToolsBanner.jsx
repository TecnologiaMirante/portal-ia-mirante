/**
 * AIToolsBanner — redesigned to match the platform's design system
 *
 * Icons: lobehub.com/icons (jsdelivr CDN)  →  simpleicons fallback  →  initials
 * Style: section-alt bg + glass-card cards (consistent with rest of portal)
 */
import React, { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Globe } from "lucide-react";
import { aiTools } from "@/data/aiTools";

/* ── Brand logo with fallback chain ────────────────────────
   1. lobehub /light/ (dark-colored icons — great on white box)
   2. lobehub /dark/ color variant
   3. simpleicons CDN
   4. Styled initials
─────────────────────────────────────────────────────────── */
function ToolLogo({ tool }) {
  const [srcIdx, setSrcIdx] = useState(0);

  /* Priority:
   * 0. tool.logoUrl (explicit override) — always used first when set
   * 1. lobehub dark color variant  → real brand colors, any background
   * 2. simpleicons with brand hex  → always colored SVG
   * 3. lobehub light               → dark monochrome, ok on colored bg
   * 4. lobehub dark                → white icon, visible on colored bg
   * → initials fallback
   */
  const sources = [
    tool.logoUrl,
    tool.lobehubSlug &&
      `https://cdn.jsdelivr.net/npm/@lobehub/icons-static-png@latest/dark/${tool.lobehubSlug}-color.png`,
    tool.simpleSlug &&
      `https://cdn.simpleicons.org/${tool.simpleSlug}/${tool.color.replace("#", "")}`,
    tool.lobehubSlug &&
      `https://cdn.jsdelivr.net/npm/@lobehub/icons-static-png@latest/light/${tool.lobehubSlug}.png`,
    tool.lobehubSlug &&
      `https://cdn.jsdelivr.net/npm/@lobehub/icons-static-png@latest/dark/${tool.lobehubSlug}.png`,
  ].filter(Boolean);

  const src = srcIdx < sources.length ? sources[srcIdx] : null;

  return (
    /* Colored tinted box — all icon variants visible regardless of color */
    <div
      className="w-[72px] h-[72px] rounded-2xl flex items-center justify-center p-2.5"
      style={{
        background: `${tool.color}18`,
        boxShadow: `0 2px 16px ${tool.color}30, inset 0 1px 0 ${tool.color}25`,
        border: `1px solid ${tool.color}25`,
      }}
    >
      {src ? (
        <img
          src={src}
          alt={`${tool.name} logo`}
          className={[
            "w-full h-full object-contain",
            tool.clipCircle ? "rounded-full" : "rounded-xl",
            tool.darkWhite ? "icon-white-dark" : "",
          ].join(" ")}
          onError={() => setSrcIdx((i) => i + 1)}
        />
      ) : (
        <span
          className="font-black text-lg tracking-tight leading-none"
          style={{ color: tool.color }}
        >
          {tool.initials}
        </span>
      )}
    </div>
  );
}

/* ── Single card ─────────────────────────────────────────── */
function ToolCard({ tool }) {
  const cardRef = React.useRef(null);

  const handleEnter = () => {
    const el = cardRef.current;
    if (!el) return;
    el.style.borderColor = `${tool.color}55`;
    el.style.boxShadow   = `0 4px 24px ${tool.color}18, 0 1px 4px rgba(0,0,0,0.06)`;
    el.style.transform   = "translateY(-3px)";
  };
  const handleLeave = () => {
    const el = cardRef.current;
    if (!el) return;
    el.style.borderColor = "";
    el.style.boxShadow   = "";
    el.style.transform   = "translateY(0)";
  };

  return (
    <div
      ref={cardRef}
      className="min-w-[272px] max-w-[272px] rounded-2xl overflow-hidden glass-card select-none"
      style={{ transition: "border-color 0.25s, box-shadow 0.25s, transform 0.25s" }}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      {/* ── Icon area */}
      <div
        className="h-[110px] flex items-center justify-center relative overflow-hidden border-b border-border"
        style={{ background: `${tool.color}0d` }}
      >
        <div
          className="absolute w-28 h-28 rounded-full blur-2xl pointer-events-none"
          style={{ background: `${tool.color}22` }}
        />
        <ToolLogo tool={tool} />
      </div>

      {/* ── Body */}
      <div className="p-4 flex flex-col gap-3">
        {/* Name + badge + provider */}
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-foreground text-[15px] leading-tight">
              {tool.name}
            </h3>
            {tool.badge && (
              <span
                className="text-[9px] font-bold px-2 py-0.5 rounded-full leading-none shrink-0 border"
                style={{
                  background:  `${tool.color}12`,
                  color:        tool.color,
                  borderColor: `${tool.color}35`,
                }}
              >
                {tool.badge}
              </span>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">{tool.provider}</p>
        </div>

        {/* Description */}
        <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-3">
          {tool.description}
        </p>

        {/* Category tags */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {(tool.tags ?? []).slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-[9px] px-2 py-0.5 rounded-full border whitespace-nowrap"
              style={{
                background:  `${tool.color}0d`,
                borderColor: `${tool.color}30`,
                color:        tool.color,
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* CTA — única área clicável */}
        <a
          href={tool.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm border transition-all duration-200 hover:brightness-110 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          style={{
            background:  `${tool.color}12`,
            borderColor: `${tool.color}40`,
            color:        tool.color,
          }}
        >
          <Globe className="w-3.5 h-3.5" />
          Acessar na Web
        </a>
      </div>
    </div>
  );
}

/* ── Section ─────────────────────────────────────────────── */
export function AIToolsBanner() {
  const scrollRef = useRef(null);
  const isDragging = useRef(false);

  /* Arrow scroll */
  const scroll = (dir) =>
    scrollRef.current?.scrollBy({ left: dir * 296, behavior: "smooth" });

  /* Drag-to-scroll — clientX is reliable with mx-auto containers */
  const onMouseDown = (e) => {
    const el = scrollRef.current;
    if (!el) return;
    isDragging.current = false;
    const startX = e.clientX;
    const startScroll = el.scrollLeft;

    const onMove = (ev) => {
      const dx = ev.clientX - startX;
      if (Math.abs(dx) > 4) isDragging.current = true;
      el.scrollLeft = startScroll - dx;
    };
    const onUp = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
    e.preventDefault();
  };

  /* Block link navigation when the user dragged */
  const onClickCapture = (e) => {
    if (isDragging.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const doubled = [...aiTools, ...aiTools];

  return (
    <section
      id="ferramentas"
      className="relative py-16 overflow-hidden section-alt"
    >
      {/* Dot grid */}
      <div className="dot-grid absolute inset-0 pointer-events-none opacity-60" />

      {/* ── Section header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-8 relative">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div className="reveal">
            <span className="text-xs font-semibold uppercase tracking-widest text-primary mb-3 block">
              Ferramentas Homologadas para Uso Imediato
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
              Ferramentas de <span className="gradient-text">IA</span>
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Todas disponíveis para uso imediato — explore os cards e clique em{" "}
              <span className="font-medium text-foreground">Acessar na Web</span> para abrir cada ferramenta.
            </p>
          </div>

          <div className="flex items-center gap-3 reveal reveal-delay-1">
            <span className="text-sm text-muted-foreground">
              <span className="font-bold text-primary">{aiTools.length}</span>{" "}
              ferramentas ativas
            </span>
            <div className="flex gap-2">
              {[-1, 1].map((dir) => (
                <button
                  key={dir}
                  onClick={() => scroll(dir)}
                  className="w-9 h-9 rounded-full flex items-center justify-center border border-border bg-background text-muted-foreground hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all duration-200"
                >
                  {dir === -1 ? (
                    <ChevronLeft className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Scrollable carousel */}
      <div
        ref={scrollRef}
        onMouseDown={onMouseDown}
        onClickCapture={onClickCapture}
        className="flex gap-4 overflow-x-auto no-scrollbar pb-4 cursor-grab active:cursor-grabbing"
        style={{
          paddingLeft: "max(1rem, calc((100vw - 80rem) / 2 + 1.5rem))",
          paddingRight: "1rem",
        }}
      >
        {aiTools.map((tool) => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </div>

      {/* ── Marquee strip */}
      <div className="mt-14 overflow-hidden border-t border-border bg-background/60 py-3">
        <div className="marquee-track">
          {doubled.map((tool, i) => (
            <div
              key={`${tool.id}-${i}`}
              className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-border bg-background/80 whitespace-nowrap select-none"
            >
              <span className="text-xs font-bold" style={{ color: tool.color }}>
                {tool.initials}
              </span>
              <span className="text-xs text-muted-foreground">{tool.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
