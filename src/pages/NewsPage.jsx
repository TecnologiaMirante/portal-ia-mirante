/**
 * NewsPage — /noticias
 * Feed diário de notícias de IA curadas para todos os setores da Mirante.
 */
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  RefreshCw, ExternalLink, Clock, Newspaper,
  Sparkles, AlertCircle, ArrowLeft, Rss, X,
} from "lucide-react";
import { useNews }  from "@/hooks/useNews";
import { useTheme } from "@/hooks/useTheme";
import { Button }   from "@/components/ui/button";
import { LogoMirante } from "@/components/LogoMirante";

/* ── Cores por setor ────────────────────────────────────── */
const DEPT_STYLE = {
  Marketing:  "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  RH:         "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  Financeiro: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  Comercial:  "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  Jurídico:   "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  Gestão:     "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
  Saúde:      "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20",
  Educação:   "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
};

const ALL_DEPTS = Object.keys(DEPT_STYLE);

/* ── Helpers ────────────────────────────────────────────── */
function timeAgo(dateStr) {
  const diff  = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days  = Math.floor(hours / 24);
  if (days  > 0) return `${days}d atrás`;
  if (hours > 0) return `${hours}h atrás`;
  if (mins  > 0) return `${mins}min atrás`;
  return "agora";
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    day: "numeric", month: "long", year: "numeric",
  });
}

/* ── Skeleton card ──────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden animate-pulse">
      <div className="h-44 bg-muted/60" />
      <div className="p-4 flex flex-col gap-2.5">
        <div className="h-3 w-24 bg-muted/60 rounded-full" />
        <div className="h-4 bg-muted/60 rounded-full" />
        <div className="h-4 w-4/5 bg-muted/60 rounded-full" />
        <div className="h-3 w-full bg-muted/40 rounded-full mt-1" />
        <div className="h-3 w-3/4 bg-muted/40 rounded-full" />
        <div className="flex gap-1.5 mt-1">
          <div className="h-5 w-16 bg-muted/40 rounded-full" />
          <div className="h-5 w-20 bg-muted/40 rounded-full" />
        </div>
      </div>
    </div>
  );
}

/* ── Embed via iframe ───────────────────────────────────── */
function IframeEmbed({ url }) {
  const [status, setStatus] = useState("loading"); // loading | ok | blocked

  useEffect(() => {
    // Timeout: se o iframe não carregar em 6s, consideramos bloqueado
    const t = setTimeout(() => setStatus((s) => s === "loading" ? "blocked" : s), 6000);
    return () => clearTimeout(t);
  }, [url]);

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-muted-foreground italic">
        Visualização incorporada — alguns sites bloqueiam esta exibição.
      </p>
      <div className="relative rounded-xl overflow-hidden border border-border bg-muted/20" style={{ height: 480 }}>
        {status === "loading" && (
          <div className="absolute inset-0 flex items-center justify-center">
            <RefreshCw className="w-6 h-6 text-primary animate-spin" />
          </div>
        )}
        {status === "blocked" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center p-6">
            <p className="text-sm text-muted-foreground">Este site não permite visualização incorporada.</p>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              Abrir no site original <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}
        <iframe
          src={url}
          title="Conteúdo do artigo"
          className="w-full h-full border-0"
          sandbox="allow-same-origin allow-scripts allow-popups"
          onLoad={() => setStatus("ok")}
          onError={() => setStatus("blocked")}
          style={{ opacity: status === "ok" ? 1 : 0 }}
        />
      </div>
    </div>
  );
}

/* ── Modal leitor ───────────────────────────────────────── */
function ArticleModal({ article, onClose }) {
  // Fecha com Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const paragraphs = article.content?.split("\n\n").filter(Boolean) ?? [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Painel */}
      <div className="relative z-10 w-full sm:max-w-2xl max-h-[92dvh] sm:max-h-[88dvh] flex flex-col
        bg-background border border-border rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden">

        {/* Imagem do topo */}
        {article.image && (
          <div className="h-48 sm:h-56 shrink-0 overflow-hidden">
            <img
              src={article.image}
              alt={article.title}
              className="w-full h-full object-cover"
              onError={(e) => { e.currentTarget.parentElement.style.display = "none"; }}
            />
          </div>
        )}

        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-6 pt-5 pb-1 shrink-0">
          <div className="flex flex-col gap-2 flex-1 min-w-0">
            {/* Fonte + tempo */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
              <span className="font-semibold text-foreground/70">{article.source?.name ?? article.source}</span>
              <span className="text-muted-foreground/40">·</span>
              <Clock className="w-3 h-3 shrink-0" />
              <span>{timeAgo(article.publishedAt)}</span>
              {article.depts?.slice(0, 2).map((d) => (
                <span key={d} className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${DEPT_STYLE[d]}`}>{d}</span>
              ))}
            </div>
            {/* Título */}
            <h2 className="text-lg sm:text-xl font-bold text-foreground leading-snug">
              {article.title}
            </h2>
          </div>

          {/* Fechar */}
          <button
            onClick={onClose}
            className="shrink-0 p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo scrollável */}
        <div className="overflow-y-auto flex-1 px-6 py-4 space-y-4">
          {/* Resumo RSS */}
          {article.description && (
            <p className="text-sm text-muted-foreground leading-relaxed italic border-l-2 border-primary/30 pl-3">
              {article.description}
            </p>
          )}

          {/* Conteúdo */}
          {paragraphs.length > 0 ? (
            <div className="space-y-4">
              {paragraphs.map((p, i) => (
                <p key={i} className="text-sm text-foreground/90 leading-relaxed">
                  {p}
                </p>
              ))}
            </div>
          ) : (
            <IframeEmbed url={article.url} />
          )}
        </div>

        {/* Footer com link original */}
        <div className="shrink-0 border-t border-border px-6 py-4 flex items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground">
            Fonte: {article.source?.name ?? article.source}
          </span>
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
          >
            Ver original <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
}

/* ── Artigo card ────────────────────────────────────────── */
function NewsCard({ article, featured = false, onClick }) {
  const hasImage = !!article.image;

  return (
    <article
      onClick={onClick}
      className={`group flex flex-col rounded-2xl border border-border bg-card overflow-hidden cursor-pointer
        hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/8 hover:border-primary/25
        transition-all duration-300 ${featured ? "md:flex-row" : ""}`}
    >
      {/* Imagem */}
      <div className={`relative overflow-hidden shrink-0 bg-muted/40
        ${featured ? "md:w-2/5 h-52 md:h-auto" : "h-44"}`}
      >
        {hasImage ? (
          <img
            src={article.image}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            onError={(e) => { e.currentTarget.style.display = "none"; e.currentTarget.nextSibling.style.display = "flex"; }}
          />
        ) : null}
        {/* Fallback gradient */}
        <div
          className={`w-full h-full flex items-center justify-center ${hasImage ? "hidden" : "flex"}`}
          style={{ background: "linear-gradient(135deg, oklch(0.30 0.10 264), oklch(0.22 0.08 310))" }}
        >
          <Newspaper className="w-10 h-10 text-primary/30" />
        </div>

        {/* Setor badge no canto */}
        {article.depts?.[0] && (
          <span className={`absolute top-3 left-3 text-[10px] font-semibold px-2 py-0.5 rounded-full border backdrop-blur-sm ${DEPT_STYLE[article.depts[0]]}`}>
            {article.depts[0]}
          </span>
        )}
      </div>

      {/* Conteúdo */}
      <div className="flex flex-col gap-3 p-5 flex-1 min-w-0">
        {/* Fonte + tempo */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="font-semibold text-foreground/70 truncate max-w-[140px]">
            {article.source?.name ?? article.source}
          </span>
          <span className="text-muted-foreground/40">·</span>
          <Clock className="w-3 h-3 shrink-0" />
          <span className="shrink-0">{timeAgo(article.publishedAt)}</span>
        </div>

        {/* Título */}
        <h3 className={`font-bold text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-2 ${featured ? "text-xl" : "text-base"}`}>
          {article.title}
        </h3>

        {/* Descrição */}
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 flex-1">
          {article.description}
        </p>

        {/* Tags de setor */}
        {article.depts?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {article.depts.slice(0, 3).map((dept) => (
              <span
                key={dept}
                className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${DEPT_STYLE[dept]}`}
              >
                {dept}
              </span>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary group-hover:text-primary/80 transition-colors mt-auto pt-1">
          Ler matéria
          <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </div>
      </div>
    </article>
  );
}

/* ── Estado: sem chave de API ────────────────────────────── */
function NoKeyState() {
  return (
    <div className="flex flex-col items-center text-center gap-6 py-20 max-w-lg mx-auto">
      <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
        <Rss className="w-8 h-8 text-amber-500" />
      </div>
      <div>
        <h3 className="text-xl font-bold text-foreground mb-2">Configure a chave da API</h3>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Para carregar as notícias, adicione sua chave gratuita do{" "}
          <a href="https://gnews.io" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">GNews.io</a>
          {" "}no arquivo <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">.env</code>:
        </p>
      </div>
      <div className="w-full bg-muted/60 border border-border rounded-xl p-4 text-left font-mono text-sm text-muted-foreground">
        VITE_GNEWS_API_KEY=<span className="text-primary">sua_chave_aqui</span>
      </div>
      <div className="flex flex-col gap-2 text-sm text-muted-foreground">
        <p>1. Acesse <a href="https://gnews.io" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">gnews.io</a> e crie uma conta gratuita</p>
        <p>2. Copie sua API Key no dashboard</p>
        <p>3. Cole no <code className="text-xs bg-muted px-1 py-0.5 rounded font-mono">.env</code> e reinicie o servidor</p>
      </div>
      <a href="https://gnews.io/register" target="_blank" rel="noopener noreferrer">
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
          Criar conta gratuita →
        </Button>
      </a>
    </div>
  );
}

/* ── Estado: erro de rede ────────────────────────────────── */
function NetworkErrorState({ onRetry, errorMsg }) {
  return (
    <div className="flex flex-col items-center text-center gap-4 py-20 max-w-md mx-auto">
      <div className="w-14 h-14 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center">
        <AlertCircle className="w-7 h-7 text-destructive" />
      </div>
      <div>
        <h3 className="text-lg font-bold text-foreground mb-1">Não foi possível carregar</h3>
        <p className="text-muted-foreground text-sm">Verifique o console do navegador (F12) para mais detalhes.</p>
        {errorMsg && (
          <p className="mt-2 text-xs font-mono bg-muted px-3 py-1.5 rounded-lg text-muted-foreground">
            {errorMsg}
          </p>
        )}
      </div>
      <Button variant="outline" onClick={onRetry} className="gap-2">
        <RefreshCw className="w-4 h-4" /> Tentar novamente
      </Button>
    </div>
  );
}

/* ── Página principal ───────────────────────────────────── */
export function NewsPage() {
  const { articles, loading, error, lastUpdated, refresh } = useNews();
  const { dark, toggle } = useTheme();
  const [activeFilter, setActiveFilter]     = useState("Todos");
  const [selectedArticle, setSelectedArticle] = useState(null);

  /* Filtragem */
  const filtered = activeFilter === "Todos"
    ? articles
    : articles.filter((a) => a.depts?.includes(activeFilter));

  /* Contagem por setor */
  const counts = { Todos: articles.length };
  ALL_DEPTS.forEach((d) => {
    counts[d] = articles.filter((a) => a.depts?.includes(d)).length;
  });
  const filtersWithContent = ALL_DEPTS.filter((d) => counts[d] > 0);

  const [featured, ...rest] = filtered;

  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      {selectedArticle && (
        <ArticleModal article={selectedArticle} onClose={() => setSelectedArticle(null)} />
      )}

      {/* ── Navbar ──────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          {/* Logo + back */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors text-sm">
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Portal</span>
            </Link>
            <span className="text-border/60">|</span>
            <Link to="/" className="flex items-center gap-2 group">
              <LogoMirante className="h-7 w-auto" />
              <span className="font-semibold text-sm text-foreground">
                Mirante <span className="text-primary font-bold">IA</span>
              </span>
            </Link>
          </div>

          {/* Center: page title */}
          <div className="hidden sm:flex items-center gap-2">
            <Newspaper className="w-4 h-4 text-primary" />
            <span className="font-semibold text-sm text-foreground">IA em Destaque</span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {lastUpdated && (
              <span className="hidden md:block text-xs text-muted-foreground">
                Atualizado {lastUpdated.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
            <button
              onClick={refresh}
              disabled={loading}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors disabled:opacity-50"
              title="Atualizar notícias"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={toggle}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              {dark
                ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
              }
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* ── Hero do feed ──────────────────────────────── */}
        <div className="mb-8">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  Atualizado diariamente
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
                IA em <span className="gradient-text">Destaque</span>
              </h1>
              <p className="text-muted-foreground mt-1.5 text-sm sm:text-base max-w-xl">
                As principais novidades de Inteligência Artificial — curadas para todos os setores da Mirante.
              </p>
            </div>
            {articles.length > 0 && (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground bg-card border border-border rounded-xl px-4 py-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span><strong className="text-foreground">{articles.length}</strong> artigos hoje</span>
              </div>
            )}
          </div>
        </div>

        {/* ── Filtros por setor ─────────────────────────── */}
        {!loading && !error && filtersWithContent.length > 0 && (
          <div className="sticky top-14 z-30 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 bg-background/90 backdrop-blur-md border-b border-border mb-8">
            <div className="flex gap-2 overflow-x-auto scrollbar-none pb-0.5">
              {["Todos", ...filtersWithContent].map((dept) => (
                <button
                  key={dept}
                  onClick={() => setActiveFilter(dept)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium whitespace-nowrap border transition-all shrink-0
                    ${activeFilter === dept
                      ? "bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/20"
                      : "bg-card text-muted-foreground border-border hover:border-primary/30 hover:text-foreground"
                    }`}
                >
                  {dept}
                  {counts[dept] > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                      activeFilter === dept
                        ? "bg-white/20 text-white"
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {counts[dept]}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Estados ───────────────────────────────────── */}
        {error && <NetworkErrorState onRetry={refresh} errorMsg={error} />}

        {/* ── Loading skeletons ─────────────────────────── */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* ── Feed de notícias ──────────────────────────── */}
        {!loading && !error && filtered.length > 0 && (
          <div className="flex flex-col gap-6">
            {/* Destaque (primeiro artigo — grande) */}
            {featured && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">
                  Em destaque
                </p>
                <NewsCard article={featured} featured onClick={() => setSelectedArticle(featured)} />
              </div>
            )}

            {/* Grid restante */}
            {rest.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                  Mais notícias
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {rest.map((article, i) => (
                    <NewsCard key={article.url ?? i} article={article} onClick={() => setSelectedArticle(article)} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Ainda sem notícias (Action ainda não rodou) ── */}
        {!loading && !error && articles.length === 0 && (
          <div className="flex flex-col items-center text-center gap-4 py-20 max-w-md mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Newspaper className="w-7 h-7 text-primary/60" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground mb-1">Em breve</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                As notícias são atualizadas automaticamente todo dia às 07h.<br />
                Volte amanhã cedo ou acione a atualização manualmente.
              </p>
            </div>
            <Button variant="outline" onClick={refresh} className="gap-2">
              <RefreshCw className="w-4 h-4" /> Verificar agora
            </Button>
          </div>
        )}

        {/* ── Sem resultados para o filtro ─────────────── */}
        {!loading && !error && filtered.length === 0 && articles.length > 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-lg font-medium mb-1">Nenhuma notícia para <strong>{activeFilter}</strong> hoje</p>
            <p className="text-sm">Tente outro setor ou volte mais tarde.</p>
            <button onClick={() => setActiveFilter("Todos")} className="mt-4 text-primary hover:underline text-sm">
              Ver todas as notícias
            </button>
          </div>
        )}

        {/* ── Rodapé do feed ────────────────────────────── */}
        {!loading && !error && articles.length > 0 && (
          <div className="mt-12 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Rss className="w-3.5 h-3.5" />
              <span>Fonte: GNews · Notícias em português do Brasil</span>
            </div>
            {lastUpdated && (
              <span>
                Última atualização: {formatDate(lastUpdated.toISOString())} às{" "}
                {lastUpdated.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
