/**
 * NewsPreview — seção do portal principal.
 * Exibe os 3 artigos mais recentes e um CTA para /noticias.
 * Segue o padrão visual das demais seções (section-alt, section-divider,
 * glass-card, TiltCard, reveal).
 */
import { useState } from "react";
import { Link } from "react-router-dom";
import { Newspaper, Clock, ArrowRight, Sparkles, Rss } from "lucide-react";
import { useNews }       from "@/hooks/useNews";
import { TiltCard }      from "@/components/effects/TiltCard";
import { ArticleModal }  from "@/components/ArticleModal";

/* ── Paleta de setores ──────────────────────────────────── */
const DEPT_COLOR = {
  Marketing:  "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  RH:         "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  Financeiro: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  Comercial:  "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  Jurídico:   "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  Gestão:     "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
  Saúde:      "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20",
  Educação:   "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
};

// Datas já chegam limpas do useNews (CDATA removido no hook)
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

/* ── Card de artigo ─────────────────────────────────────── */
function ArticleCard({ article, delay, onOpen }) {
  const dept  = article.depts?.[0];
  const style = DEPT_COLOR[dept];

  return (
    <div className={`reveal reveal-delay-${delay} h-full`}>
      <TiltCard className="glass-card group rounded-2xl overflow-hidden cursor-pointer h-full flex flex-col">
        <div onClick={onOpen} className="flex flex-col h-full">

          {/* Imagem */}
          <div className="relative h-44 overflow-hidden bg-muted shrink-0">
            {article.image ? (
              <img
                src={article.image}
                alt={article.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
                onError={(e) => { e.currentTarget.style.display = "none"; }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, oklch(0.20 0.08 264), oklch(0.15 0.06 310))" }}>
                <div className="dot-grid absolute inset-0 opacity-40" />
                <Newspaper className="w-8 h-8 text-primary/30 relative z-10" />
              </div>
            )}

            {/* Gradiente bottom */}
            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-card to-transparent" />

            {/* Dept pill */}
            {dept && style && (
              <span className={`absolute top-2.5 left-2.5 z-10 inline-flex items-center gap-1
                text-[9px] font-bold px-2 py-0.5 rounded-full border backdrop-blur-sm ${style}`}>
                {dept}
              </span>
            )}
          </div>

          {/* Texto */}
          <div className="flex flex-col gap-2.5 p-5 flex-1">
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <Rss className="w-2.5 h-2.5 shrink-0 text-primary/60" />
              <span className="font-semibold truncate text-foreground/55">
                {article.source?.name ?? article.source}
              </span>
              <span className="text-muted-foreground/30">·</span>
              <Clock className="w-2.5 h-2.5 shrink-0" />
              <span className="shrink-0">{timeAgo(article.publishedAt)}</span>
            </div>

            <h3 className="font-semibold text-foreground text-sm leading-snug line-clamp-3 flex-1
              group-hover:text-primary transition-colors duration-200">
              {article.title}
            </h3>

            <div className="flex items-center gap-1 text-primary/70 text-[11px] font-semibold mt-auto
              opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0
              transition-all duration-200">
              Ler matéria <ArrowRight className="w-3 h-3" />
            </div>
          </div>
        </div>
      </TiltCard>
    </div>
  );
}

/* ── Skeleton ───────────────────────────────────────────── */
function SkeletonCard({ delay }) {
  return (
    <div className={`reveal reveal-delay-${delay} h-64 rounded-2xl overflow-hidden animate-pulse bg-muted border border-border`} />
  );
}

/* ── Seção ──────────────────────────────────────────────── */
export function NewsPreview() {
  const { articles, loading } = useNews();
  const [selected, setSelected] = useState(null);
  const preview = articles.slice(0, 3);

  if (!loading && articles.length === 0) return null;

  return (
    <section id="noticias-ia" className="py-16 section-alt">
      {/* Divisor topo */}
      <div className="section-divider mb-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* ── Cabeçalho ── */}
        <div className="text-center max-w-2xl mx-auto mb-10 pt-6">
          <div className="reveal">
            <span className="text-xs font-semibold uppercase tracking-widest text-primary mb-3 block">
              Notícias de IA
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              IA em{" "}
              <span className="gradient-text">Destaque</span>
            </h2>
            <p className="text-muted-foreground">
              As principais novidades em Inteligência Artificial — curadas para todos os setores da Mirante, atualizadas automaticamente todo dia às 07h.
            </p>
          </div>
        </div>

        {/* ── Badge contagem ── */}
        {articles.length > 0 && (
          <div className="flex justify-center mb-8 reveal">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full
              border border-primary/20 bg-primary/8 text-primary text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              {articles.length} artigos hoje · Atualizado às 07h
              <Sparkles className="w-3 h-3" />
            </div>
          </div>
        )}

        {/* ── Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pb-4">
          {loading
            ? [1, 2, 3].map((i) => <SkeletonCard key={i} delay={i} />)
            : preview.map((a, i) => (
                <ArticleCard key={a.url ?? i} article={a} delay={i + 1} onOpen={() => setSelected(a)} />
              ))
          }
        </div>

        {/* ── CTA ── */}
        <div className="flex justify-center mt-8 reveal">
          <Link
            to="/noticias"
            className="group relative inline-flex items-center gap-3
              px-8 sm:px-12 py-4 rounded-2xl overflow-hidden
              font-bold text-base text-white tracking-wide
              transition-all duration-300 hover:scale-[1.03] hover:-translate-y-0.5 active:scale-[0.98]"
            style={{
              background: "linear-gradient(135deg, #7c3aed 0%, #635bff 50%, #2563eb 100%)",
              boxShadow: "0 8px 32px oklch(0.55 0.28 264 / 0.35), inset 0 1px 0 rgba(255,255,255,0.15)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = "0 16px 48px oklch(0.55 0.28 264 / 0.55), inset 0 1px 0 rgba(255,255,255,0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "0 8px 32px oklch(0.55 0.28 264 / 0.35), inset 0 1px 0 rgba(255,255,255,0.15)";
            }}
          >
            {/* Shine */}
            <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{
                background: "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.18) 50%, transparent 70%)",
                backgroundSize: "200% 100%",
                animation: "shimmer 1.8s ease infinite",
              }}
            />
            <Newspaper className="w-5 h-5 relative z-10" />
            <span className="relative z-10">Ver todas as notícias de IA</span>
            <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform duration-200" />
          </Link>
        </div>
      </div>

      {/* Divisor base */}
      <div className="section-divider mt-10" />

      {selected && (
        <ArticleModal article={selected} onClose={() => setSelected(null)} />
      )}
    </section>
  );
}
