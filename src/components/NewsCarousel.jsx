import { useRef } from "react";
import { Link } from "react-router-dom";
import { Newspaper, ArrowRight, ChevronLeft, ChevronRight, Rss } from "lucide-react";
import { useNews } from "@/hooks/useNews";

/* ── Limpa tags HTML ─────────────────────────────────────── */
function stripHtml(str = "") {
  return str.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

/* ── Data relativa ───────────────────────────────────────── */
function timeAgo(raw = "") {
  const d = new Date(String(raw));
  if (isNaN(d)) return "";
  const diff = Date.now() - d.getTime();
  const m = Math.floor(diff / 60000), h = Math.floor(m / 60), day = Math.floor(h / 24);
  if (day > 0) return `${day}d atrás`;
  if (h   > 0) return `${h}h atrás`;
  if (m   > 0) return `${m}min atrás`;
  return "agora";
}

/* ── Paleta de fontes ────────────────────────────────────── */
const SOURCE_STYLE = {
  "TechCrunch AI": { bg: "bg-emerald-500/10 border-emerald-500/20", text: "text-emerald-600 dark:text-emerald-400" },
  "Tecnoblog":     { bg: "bg-indigo-500/10 border-indigo-500/20",   text: "text-indigo-600 dark:text-indigo-400"  },
  default:         { bg: "bg-primary/8 border-primary/20",          text: "text-primary"                          },
};
function getSourceStyle(source = "") {
  return SOURCE_STYLE[source] ?? SOURCE_STYLE.default;
}

/* ── Card ────────────────────────────────────────────────── */
function NewsCard({ article }) {
  const ss   = getSourceStyle(article.source);
  const ago  = timeAgo(article.publishedAt);
  const desc = stripHtml(article.description ?? "");

  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      draggable={false}
      className="group flex flex-col glass-card rounded-2xl overflow-hidden shrink-0 w-[280px] sm:w-[300px] hover:-translate-y-0.5 transition-transform duration-200"
    >
      {/* Imagem ou placeholder */}
      <div className="relative h-36 overflow-hidden bg-muted shrink-0">
        {article.image && (
          <img
            src={article.image}
            alt={article.title}
            draggable={false}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            onError={(e) => { e.currentTarget.style.display = "none"; }}
          />
        )}
        {!article.image && (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, oklch(0.20 0.08 264), oklch(0.15 0.06 310))" }}
          >
            <Newspaper className="w-8 h-8 text-primary/30" />
          </div>
        )}

        {/* Source badge */}
        <div className="absolute top-2 left-2">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border backdrop-blur-sm ${ss.bg} ${ss.text}`}>
            {article.source}
          </span>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="flex flex-col gap-2 p-4 flex-1">
        <h3 className="text-sm font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
          {article.title}
        </h3>
        {desc && (
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
            {desc}
          </p>
        )}
        <div className="mt-auto flex items-center justify-between pt-2 border-t border-border/50">
          {ago && <span className="text-[10px] text-muted-foreground/60">{ago}</span>}
          <span className="text-[10px] font-semibold text-primary flex items-center gap-0.5 ml-auto group-hover:gap-1.5 transition-all">
            Ler mais <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </a>
  );
}

/* ── Carrossel ────────────────────────────────────────────── */
export function NewsCarousel() {
  const { articles, loading } = useNews();
  const scrollRef  = useRef(null);
  const isDragging = useRef(false);

  /* Scroll com seta */
  const scroll = (dir) =>
    scrollRef.current?.scrollBy({ left: dir * 316, behavior: "smooth" });

  /* Drag-to-scroll igual ao AIToolsBanner */
  const onMouseDown = (e) => {
    const el = scrollRef.current;
    if (!el) return;
    isDragging.current = false;
    const startX     = e.clientX;
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

  /* Bloqueia clique se arrastou */
  const onClickCapture = (e) => {
    if (isDragging.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const items = articles.slice(0, 16);
  if (loading || items.length === 0) return null;

  return (
    <section className="py-12 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-6">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <Rss className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Notícias de IA</h2>
              <p className="text-[11px] text-muted-foreground">Atualizado automaticamente</p>
            </div>
          </div>

          {/* Controles */}
          <div className="flex items-center gap-2">
            {[-1, 1].map((dir) => (
              <button
                key={dir}
                onClick={() => scroll(dir)}
                className="w-9 h-9 rounded-full flex items-center justify-center border border-border bg-background text-muted-foreground hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all duration-200"
              >
                {dir === -1
                  ? <ChevronLeft className="w-4 h-4" />
                  : <ChevronRight className="w-4 h-4" />
                }
              </button>
            ))}

            <Link
              to="/noticias"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-primary border border-primary/20 hover:bg-primary/8 transition-colors ml-1"
            >
              Ver todas <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Track com drag-to-scroll */}
      <div
        ref={scrollRef}
        onMouseDown={onMouseDown}
        onClickCapture={onClickCapture}
        className="flex gap-4 overflow-x-auto no-scrollbar pb-4 cursor-grab active:cursor-grabbing"
        style={{
          paddingLeft:  "max(1rem, calc((100vw - 80rem) / 2 + 1.5rem))",
          paddingRight: "1rem",
        }}
      >
        {items.map((article, i) => (
          <NewsCard key={i} article={article} />
        ))}
      </div>
    </section>
  );
}
