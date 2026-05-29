/**
 * NewsPage — /noticias
 * Design alinhado ao Portal IA Mirante (NeuralBg · blobs · glass-card · shimmer-text).
 */
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  RefreshCw, ExternalLink, Clock, Newspaper,
  Sparkles, AlertCircle, ArrowLeft, Rss,
  BookOpen, X, ChevronRight,
} from "lucide-react";
import { useNews }      from "@/hooks/useNews";
import { useTheme }     from "@/hooks/useTheme";
import { Button }       from "@/components/ui/button";
import { LogoMirante }  from "@/components/LogoMirante";
import { NeuralBg }     from "@/components/effects/NeuralBg";

/* ── Paleta de setores (light + dark) ───────────────────── */
const DEPT = {
  Marketing:  { pill: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/25",       dot: "#f43f5e" },
  RH:         { pill: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25",    dot: "#f59e0b" },
  Financeiro: { pill: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25", dot: "#10b981" },
  Comercial:  { pill: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/25",       dot: "#3b82f6" },
  Jurídico:   { pill: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/25", dot: "#a855f7" },
  Gestão:     { pill: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/25",       dot: "#06b6d4" },
  Saúde:      { pill: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/25",       dot: "#14b8a6" },
  Educação:   { pill: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/25", dot: "#6366f1" },
};
const ALL_DEPTS = Object.keys(DEPT);

/* ── Helpers ────────────────────────────────────────────── */
// Datas já chegam limpas do useNews (CDATA removido no hook)
function timeAgo(d) {
  const date = new Date(String(d));
  if (isNaN(date)) return "";
  const diff = Date.now() - date.getTime();
  const m = Math.floor(diff / 60000), h = Math.floor(m / 60), day = Math.floor(h / 24);
  if (day > 0) return `${day}d atrás`;
  if (h   > 0) return `${h}h atrás`;
  if (m   > 0) return `${m}min atrás`;
  return "agora";
}
function readingTime(text = "") {
  return Math.max(1, Math.round(text.trim().split(/\s+/).length / 200));
}
function fmtDate(d) {
  const date = new Date(String(d));
  if (isNaN(date)) return "";
  return date.toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" });
}

/* ── Pill de setor ──────────────────────────────────────── */
function Pill({ dept, sm }) {
  const s = DEPT[dept]; if (!s) return null;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border font-semibold backdrop-blur-sm
      ${sm ? "text-[9px] px-2 py-0.5" : "text-[10px] px-2.5 py-1"} ${s.pill}`}>
      <span className="w-1 h-1 rounded-full" style={{ background: s.dot }} />
      {dept}
    </span>
  );
}

/* ── Skeleton ───────────────────────────────────────────── */
function Skeleton({ h = "h-64" }) {
  return (
    <div className={`${h} rounded-3xl overflow-hidden animate-pulse bg-muted border border-border`}>
      <div className="w-full h-full bg-gradient-to-br from-muted-foreground/5 to-transparent" />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MODAL LEITOR — completo, dark + light mode
   ═══════════════════════════════════════════════════════════ */
function ArticleModal({ article, onClose }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const esc = (e) => { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", esc);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", esc); document.body.style.overflow = ""; };
  }, []);

  function close() { setVisible(false); setTimeout(onClose, 320); }

  const JUNK = [
    /assine a newsletter/i, /continua após a publicidade/i,
    /^por .{0,80}editado por/i, /termos de uso/i,
    /política de privacidade/i, /inscreva.se/i, /newsletter do/i,
    /receba notícias/i, /^whatsapp/i, /cadastre.se/i,
    /leia (mais|também)/i, /confira (também|mais)/i, /clique aqui/i,
  ];
  const paragraphs = (article.content?.split("\n\n") ?? [])
    .map((p) => p.trim())
    .filter((p) => p.length > 80 && !JUNK.some((re) => re.test(p)));
  const hasContent  = paragraphs.length > 0;
  const mins        = hasContent ? readingTime(article.content) : null;
  const src         = article.source?.name ?? article.source ?? "";
  const fullDate    = fmtDate(article.publishedAt);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 md:p-8"
      onClick={(e) => { if (e.target === e.currentTarget) close(); }}
    >
      {/* ── Backdrop ── */}
      <div
        className="absolute inset-0 backdrop-blur-md transition-opacity duration-300"
        style={{ background: "rgba(0,0,0,0.65)", opacity: visible ? 1 : 0 }}
        onClick={close}
      />

      {/* ── Painel ── */}
      <div
        className="relative z-10 w-full sm:max-w-2xl max-h-[97dvh] sm:max-h-[90dvh]
          flex flex-col rounded-t-[2rem] sm:rounded-[1.75rem] overflow-hidden
          bg-card border border-border"
        style={{
          boxShadow: "0 40px 100px rgba(0,0,0,0.4), 0 0 0 1px rgba(99,91,255,0.07)",
          transform: visible ? "translateY(0) scale(1)" : "translateY(52px) scale(0.96)",
          opacity:   visible ? 1 : 0,
          transition: "transform 350ms cubic-bezier(0.34,1.2,0.64,1), opacity 280ms ease",
        }}
      >

        {/* Handle mobile */}
        <div className="sm:hidden flex justify-center pt-3 shrink-0">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        {/* ══ HERO ══════════════════════════════════════════ */}
        <div className="relative shrink-0 overflow-hidden bg-muted"
          style={{ height: "clamp(180px, 30vh, 260px)" }}>

          {/* Neural Bg sempre de fundo */}
          <div className="absolute inset-0 opacity-60 dark:opacity-100"><NeuralBg /></div>

          {/* Blobs */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full blur-3xl opacity-20 dark:opacity-35"
              style={{ background: "radial-gradient(circle, oklch(0.55 0.28 264), transparent 70%)" }} />
            <div className="absolute -bottom-10 right-0 w-56 h-56 rounded-full blur-3xl opacity-15 dark:opacity-25"
              style={{ background: "radial-gradient(circle, oklch(0.55 0.26 310), transparent 70%)" }} />
          </div>

          {/* Imagem */}
          {article.image && (
            <img
              src={article.image} alt={article.title}
              className="absolute inset-0 w-full h-full object-cover"
              onError={(e) => { e.currentTarget.style.display = "none"; }}
            />
          )}

          {/* Fade p/ bg-card em cima e embaixo */}
          <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-card/80 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-card to-transparent" />

          {/* Botão fechar */}
          <button
            onClick={close}
            className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full
              flex items-center justify-center
              bg-background/70 border border-border backdrop-blur-sm
              text-muted-foreground hover:text-foreground hover:bg-background
              transition-all duration-200 hover:scale-110"
          >
            <X className="w-3.5 h-3.5" />
          </button>

          {/* Dept pills */}
          {article.depts?.length > 0 && (
            <div className="absolute top-3 left-3 z-20 flex flex-wrap gap-1.5">
              {article.depts.map((d) => <Pill key={d} dept={d} />)}
            </div>
          )}
        </div>

        {/* ══ CABEÇALHO DA MATÉRIA ══════════════════════════ */}
        <div className="shrink-0 px-6 pt-3 pb-4 border-b border-border space-y-3">

          {/* Fonte + data + leitura */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
            {/* Source chip */}
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest
              text-primary bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-full">
              <Rss className="w-2.5 h-2.5" />
              {src}
            </span>

            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <Clock className="w-3 h-3 shrink-0" />
              <span>{fullDate}</span>
              <span className="text-border">·</span>
              <span className="text-muted-foreground/70">{timeAgo(article.publishedAt)}</span>
            </div>

            {mins && (
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <BookOpen className="w-3 h-3" />
                <span>{mins} min de leitura</span>
              </div>
            )}
          </div>

          {/* Título completo */}
          <h2 className="text-xl sm:text-2xl font-extrabold text-foreground leading-[1.2] tracking-tight">
            {article.title}
          </h2>
        </div>

        {/* ══ CORPO SCROLLÁVEL ══════════════════════════════ */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-6">

          {/* Resumo em destaque */}
          {article.description && (
            <div className="flex gap-3 p-4 rounded-2xl bg-primary/5 border border-primary/15">
              <div className="shrink-0 mt-1 w-1 self-stretch rounded-full bg-primary/50" />
              <p className="text-[14px] font-medium leading-relaxed text-foreground/80">
                {article.description}
              </p>
            </div>
          )}

          {/* Conteúdo completo */}
          {hasContent ? (
            <div className="space-y-1">
              {/* Divisor */}
              <div className="flex items-center gap-3 pb-4">
                <div className="h-px flex-1 bg-border" />
                <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-muted-foreground/50">
                  Conteúdo
                </span>
                <div className="h-px flex-1 bg-border" />
              </div>

              <div className="space-y-4">
                {paragraphs.map((p, i) => (
                  <p key={i}
                    className={`leading-[1.85] text-foreground/85 tracking-[0.01em]
                      ${i === 0 ? "text-[15px] font-medium" : "text-[14px]"}`}>
                    {p}
                  </p>
                ))}
              </div>
            </div>
          ) : (
            /* Sem conteúdo scraped — mostra mensagem elegante */
            <div className="flex flex-col items-center text-center gap-4 py-6">
              <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center">
                <ExternalLink className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground mb-1">Conteúdo disponível no site original</p>
                <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
                  Esta fonte não disponibiliza o texto completo via RSS. Clique abaixo para ler a matéria completa.
                </p>
              </div>
            </div>
          )}

          {/* Tags completas no final */}
          {article.depts?.length > 0 && (
            <div className="pt-2 border-t border-border">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 mb-2.5">
                Setores relacionados
              </p>
              <div className="flex flex-wrap gap-2">
                {article.depts.map((d) => <Pill key={d} dept={d} />)}
              </div>
            </div>
          )}

          <div className="h-2" />
        </div>

        {/* ══ FOOTER CTA ════════════════════════════════════ */}
        <div className="shrink-0 px-4 sm:px-6 pt-3 pb-4 sm:pb-5 border-t border-border bg-card space-y-3">
          {/* Fonte */}
          <div className="flex items-center justify-between text-[10px] text-muted-foreground/50">
            <span className="uppercase tracking-widest font-semibold">Fonte</span>
            <span className="font-bold text-foreground/60 truncate max-w-[200px]">{src}</span>
          </div>

          {/* Botão principal — full width, grande, animado */}
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex items-center justify-center gap-3 w-full py-4 rounded-2xl
              font-extrabold text-[15px] text-white tracking-wide overflow-hidden
              transition-all duration-300 hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.98]"
            style={{
              background: "linear-gradient(135deg, #7c3aed 0%, #635bff 50%, #2563eb 100%)",
              boxShadow: "0 8px 32px oklch(0.55 0.28 264 / 0.45), inset 0 1px 0 rgba(255,255,255,0.18)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = "0 12px 40px oklch(0.55 0.28 264 / 0.65), inset 0 1px 0 rgba(255,255,255,0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "0 8px 32px oklch(0.55 0.28 264 / 0.45), inset 0 1px 0 rgba(255,255,255,0.18)";
            }}
          >
            {/* Shine animado */}
            <span
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                background: "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.15) 50%, transparent 70%)",
                backgroundSize: "200% 100%",
                animation: "shimmer 1.5s ease infinite",
              }}
            />
            <ExternalLink className="w-5 h-5 relative z-10 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
            <span className="relative z-10">Ler matéria completa no site original</span>
            <ChevronRight className="w-5 h-5 relative z-10 opacity-70 group-hover:translate-x-1 transition-transform duration-200" />
          </a>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   CARD DESTAQUE
   ═══════════════════════════════════════════════════════════ */
function FeaturedCard({ article, onClick }) {
  return (
    <div onClick={onClick}
      className="group relative w-full cursor-pointer overflow-hidden rounded-2xl sm:rounded-3xl
        transition-all duration-500 hover:-translate-y-1
        border border-border hover:border-primary/40
        shadow-lg hover:shadow-2xl hover:shadow-primary/10"
      style={{ height: "clamp(260px, 44vw, 500px)" }}>

      {/* Canvas bg */}
      <div className="absolute inset-0 opacity-40"><NeuralBg /></div>

      {/* Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="hero-blob hero-blob-1 opacity-40" />
        <div className="hero-blob hero-blob-3 opacity-30" />
        <div className="dot-grid absolute inset-0 opacity-30" />
      </div>

      {/* Imagem */}
      {article.image && (
        <img src={article.image} alt={article.title}
          className="absolute inset-0 w-full h-full object-cover opacity-55 group-hover:opacity-65 group-hover:scale-105 transition-all duration-700"
          loading="lazy" onError={(e) => { e.currentTarget.style.display = "none"; }} />
      )}

      {/* Gradiente */}
      <div className="absolute inset-0"
        style={{ background: "linear-gradient(to top, rgba(5,4,15,0.96) 0%, rgba(5,4,15,0.6) 45%, rgba(5,4,15,0.15) 100%)" }} />

      {/* Conteúdo */}
      <div className="absolute inset-0 flex flex-col justify-between p-5 sm:p-8 lg:p-10">

        {/* Topo */}
        <div className="flex items-start justify-between gap-3">
          <div className="badge-glow inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full
            border border-primary/30 bg-primary/10 text-primary text-[11px] font-bold tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Em destaque
          </div>
          {article.depts?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 justify-end">
              {article.depts.slice(0, 3).map((d) => <Pill key={d} dept={d} />)}
            </div>
          )}
        </div>

        {/* Base */}
        <div className="space-y-4">
          <div className="flex items-center gap-2.5 text-white/45 text-[11px]">
            <span className="font-bold uppercase tracking-[0.12em] text-white/65">
              {article.source?.name ?? article.source}
            </span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <Clock className="w-3 h-3" />
            <span>{timeAgo(article.publishedAt)}</span>
          </div>

          <h2 className="font-extrabold text-xl sm:text-3xl lg:text-4xl leading-[1.15] text-white max-w-3xl drop-shadow-xl
            group-hover:text-white/90 transition-colors line-clamp-3">
            {article.title}
          </h2>

          {article.description && (
            <p className="text-white/55 text-sm sm:text-base leading-relaxed line-clamp-2 max-w-2xl">
              {article.description}
            </p>
          )}

          <div className="inline-flex items-center gap-2 text-primary font-semibold text-sm
            group-hover:gap-3 transition-all duration-300">
            Ler matéria
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   CARD NORMAL (glass-card)
   ═══════════════════════════════════════════════════════════ */
function NewsCard({ article, onClick }) {
  const hasImg = !!article.image;

  return (
    <div onClick={onClick}
      className="glass-card group relative flex flex-col rounded-3xl overflow-hidden cursor-pointer
        transition-all duration-300 hover:-translate-y-1">

      {/* Imagem */}
      <div className="relative shrink-0 h-48 overflow-hidden">
        {hasImg ? (
          <img src={article.image} alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-600"
            loading="lazy" onError={(e) => { e.currentTarget.style.display = "none"; e.currentTarget.nextSibling.style.display = "flex"; }} />
        ) : null}
        {/* fallback */}
        <div className={`absolute inset-0 ${hasImg ? "hidden" : "flex"} items-center justify-center`}
          style={{ background: "linear-gradient(135deg, oklch(0.20 0.08 264), oklch(0.15 0.06 310))" }}>
          <div className="dot-grid absolute inset-0 opacity-40" />
          <Newspaper className="w-10 h-10 text-primary/30 relative z-10" />
        </div>

        {/* Gradient bottom */}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-card to-transparent" />

        {/* Dept pill */}
        {article.depts?.[0] && (
          <div className="absolute top-3 left-3 z-10">
            <Pill dept={article.depts[0]} sm />
          </div>
        )}
      </div>

      {/* Texto */}
      <div className="flex flex-col gap-2.5 p-5 flex-1">
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <span className="font-bold text-foreground/60 uppercase tracking-wide text-[9px] truncate max-w-[120px]">
            {article.source?.name ?? article.source}
          </span>
          <span className="text-muted-foreground/30">·</span>
          <Clock className="w-2.5 h-2.5 shrink-0" />
          <span className="shrink-0">{timeAgo(article.publishedAt)}</span>
        </div>

        <h3 className="font-bold text-foreground text-[14px] leading-snug line-clamp-3 flex-1
          group-hover:text-primary transition-colors duration-200">
          {article.title}
        </h3>

        {article.depts?.length > 1 && (
          <div className="flex flex-wrap gap-1 pt-0.5">
            {article.depts.slice(1, 3).map((d) => <Pill key={d} dept={d} sm />)}
          </div>
        )}

        <div className="flex items-center gap-1 text-primary/70 text-[11px] font-semibold mt-auto
          opacity-0 group-hover:opacity-100 -translate-y-1 group-hover:translate-y-0
          transition-all duration-250">
          Ler matéria <ChevronRight className="w-3 h-3" />
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   PÁGINA PRINCIPAL
   ═══════════════════════════════════════════════════════════ */
export function NewsPage() {
  const { articles, loading, error, lastUpdated, refresh } = useNews();
  const { dark, toggle } = useTheme();
  const [activeFilter, setActiveFilter]       = useState("Todos");
  const [selectedArticle, setSelectedArticle] = useState(null);

  const filtered = activeFilter === "Todos"
    ? articles
    : articles.filter((a) => a.depts?.includes(activeFilter));

  const counts = { Todos: articles.length };
  ALL_DEPTS.forEach((d) => { counts[d] = articles.filter((a) => a.depts?.includes(d)).length; });
  const activeDepts = ALL_DEPTS.filter((d) => counts[d] > 0);

  const [featured, ...rest] = filtered;

  return (
    <div className="min-h-screen bg-background text-foreground antialiased">

      {selectedArticle && (
        <ArticleModal article={selectedArticle} onClose={() => setSelectedArticle(null)} />
      )}

      {/* ══ NAVBAR ══════════════════════════════════════════ */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">

          <div className="flex items-center gap-3">
            <Link to="/"
              className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors text-sm">
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline text-xs font-medium">Portal</span>
            </Link>
            <div className="w-px h-4 bg-border" />
            <Link to="/" className="flex items-center gap-2 group">
              <LogoMirante className="h-6 w-auto" />
              <span className="font-bold text-sm text-foreground/80">
                Mirante <span className="text-primary">IA</span>
              </span>
            </Link>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-muted-foreground text-sm">
            <Newspaper className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-semibold">IA em Destaque</span>
          </div>

          <div className="flex items-center gap-1">
            {lastUpdated && (
              <span className="hidden md:block text-[10px] text-muted-foreground mr-1">
                {lastUpdated.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
            <button onClick={refresh} disabled={loading} title="Atualizar"
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent transition-colors disabled:opacity-40">
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
            <button onClick={toggle}
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
              {dark
                ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
                : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>
              }
            </button>
          </div>
        </div>
      </header>

      {/* ══ HERO TÍTULO ══════════════════════════════════════ */}
      <section className="relative overflow-hidden pt-14 pb-10 px-4 sm:px-6">
        {/* NeuralBg de fundo */}
        <div className="absolute inset-0 opacity-40 pointer-events-none"><NeuralBg /></div>

        {/* Blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="hero-blob hero-blob-1 opacity-25" />
          <div className="hero-blob hero-blob-2 opacity-20" />
          <div className="dot-grid absolute inset-0 opacity-50" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto flex items-end justify-between gap-6 flex-wrap">
          <div>
            {/* Badge */}
            <div className="badge-glow inline-flex items-center gap-2 px-4 py-1.5 rounded-full
              border border-primary/30 bg-primary/8 text-primary text-xs font-semibold mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Atualizado diariamente às 07h
            </div>

            <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-[1.05]">
              IA em{" "}
              <span className="shimmer-text">Destaque</span>
            </h1>
            <p className="text-muted-foreground mt-2.5 text-sm sm:text-base max-w-lg leading-relaxed">
              As principais novidades em Inteligência Artificial — curadas para todos os setores da Mirante.
            </p>
          </div>

          {articles.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground
              glass-card rounded-2xl px-5 py-3 shrink-0">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>
                <strong className="text-foreground font-bold">{articles.length}</strong> artigos hoje
              </span>
            </div>
          )}
        </div>
      </section>

      {/* ══ FILTROS ══════════════════════════════════════════ */}
      {!loading && !error && activeDepts.length > 0 && (
        <div className="sticky top-14 z-30 border-b border-border bg-background/92 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
            <div className="flex gap-2 overflow-x-auto scrollbar-none">
              {["Todos", ...activeDepts].map((dept) => {
                const active = activeFilter === dept;
                const dot    = DEPT[dept]?.dot;
                return (
                  <button key={dept} onClick={() => setActiveFilter(dept)}
                    className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[11px] font-semibold
                      whitespace-nowrap border transition-all duration-200 shrink-0
                      ${active
                        ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20"
                        : "bg-card text-muted-foreground border-border hover:border-primary/30 hover:text-foreground"
                      }`}>
                    {!active && dot && <span className="w-1.5 h-1.5 rounded-full" style={{ background: dot }} />}
                    {dept}
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full
                      ${active ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"}`}>
                      {counts[dept]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ══ MAIN ══════════════════════════════════════════════ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* Erro */}
        {error && (
          <div className="flex flex-col items-center text-center gap-4 py-20 max-w-md mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center">
              <AlertCircle className="w-7 h-7 text-destructive" />
            </div>
            <div>
              <h3 className="text-lg font-bold mb-1">Não foi possível carregar</h3>
              <p className="text-muted-foreground text-sm">{error}</p>
            </div>
            <Button variant="outline" onClick={refresh} className="gap-2">
              <RefreshCw className="w-4 h-4" /> Tentar novamente
            </Button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="space-y-5">
            <Skeleton h="h-[420px]" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} />)}
            </div>
          </div>
        )}

        {/* Feed */}
        {!loading && !error && filtered.length > 0 && (
          <>
            {featured && (
              <FeaturedCard article={featured} onClick={() => setSelectedArticle(featured)} />
            )}

            {rest.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {rest.map((a, i) => (
                  <NewsCard key={a.url ?? i} article={a} onClick={() => setSelectedArticle(a)} />
                ))}
              </div>
            )}
          </>
        )}

        {/* Vazio */}
        {!loading && !error && articles.length === 0 && (
          <div className="flex flex-col items-center text-center gap-5 py-24 max-w-md mx-auto">
            <div className="relative w-16 h-16 rounded-3xl flex items-center justify-center overflow-hidden"
              style={{ border: "1px solid oklch(0.22 0.04 264 / 0.5)" }}>
              <div className="absolute inset-0 opacity-50"><NeuralBg /></div>
              <Newspaper className="w-7 h-7 text-primary/60 relative z-10" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">Em breve</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Notícias atualizadas automaticamente todo dia às 07h.<br/>
                Volte amanhã ou dispare a atualização manual.
              </p>
            </div>
            <Button variant="outline" onClick={refresh} className="gap-2">
              <RefreshCw className="w-4 h-4" /> Verificar agora
            </Button>
          </div>
        )}

        {/* Filtro sem resultado */}
        {!loading && !error && filtered.length === 0 && articles.length > 0 && (
          <div className="text-center py-16">
            <p className="text-base font-semibold mb-1">
              Nenhuma notícia para <strong className="text-foreground">{activeFilter}</strong> hoje
            </p>
            <p className="text-muted-foreground text-sm mb-4">Tente outro setor ou volte mais tarde.</p>
            <button onClick={() => setActiveFilter("Todos")}
              className="text-primary hover:text-primary/80 text-sm font-semibold transition-colors">
              Ver todas as notícias →
            </button>
          </div>
        )}

        {/* Rodapé */}
        {!loading && !error && articles.length > 0 && (
          <div className="pt-8 border-t border-border flex flex-col sm:flex-row
            items-center justify-between gap-3 text-[11px] text-muted-foreground/50">
            <div className="flex items-center gap-1.5">
              <Rss className="w-3 h-3" />
              <span>Canaltech · Tecnoblog · TecMundo · The Verge · TechCrunch</span>
            </div>
            {lastUpdated && <span>Atualizado em: {fmtDate(lastUpdated.toISOString())}</span>}
          </div>
        )}
      </main>
    </div>
  );
}
