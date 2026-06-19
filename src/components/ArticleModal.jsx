import { useState, useEffect, useRef } from "react";
import { ExternalLink, Clock, Newspaper, Rss, BookOpen, X } from "lucide-react";

/* ── Paleta de setores ──────────────────────────────────────── */
export const DEPT = {
  Marketing:  { pill: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/25",       dot: "#f43f5e" },
  RH:         { pill: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25",    dot: "#f59e0b" },
  Financeiro: { pill: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25", dot: "#10b981" },
  Comercial:  { pill: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/25",       dot: "#3b82f6" },
  Jurídico:   { pill: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/25", dot: "#a855f7" },
  Gestão:     { pill: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/25",       dot: "#06b6d4" },
  Saúde:      { pill: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/25",       dot: "#14b8a6" },
  Educação:   { pill: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/25", dot: "#6366f1" },
};

export function readingTime(text = "") {
  return Math.max(1, Math.round(text.trim().split(/\s+/).length / 200));
}

export function fmtDate(d) {
  const date = new Date(String(d));
  if (isNaN(date)) return "";
  return date.toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" });
}

export function Pill({ dept, sm }) {
  const s = DEPT[dept]; if (!s) return null;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border font-semibold backdrop-blur-sm
      ${sm ? "text-[9px] px-2 py-0.5" : "text-[10px] px-2.5 py-1"} ${s.pill}`}>
      <span className="w-1 h-1 rounded-full" style={{ background: s.dot }} />
      {dept}
    </span>
  );
}

const JUNK = [
  /assine (a newsletter|o)/i, /continua após a publicidade/i,
  /^por .{0,80}editado por/i, /termos de uso/i,
  /política de privacidade/i, /inscreva.se/i, /newsletter/i,
  /receba (notícias|artigos)/i, /^whatsapp/i, /cadastre.se/i,
  /leia (mais|também|a seguir)/i, /confira (também|mais)/i,
  /veja (também|mais|a seguir)/i, /clique aqui/i, /saiba mais/i,
  /se você gostou/i, /talvez (também )?se interesse/i,
  /pode te interessar/i, /você também pode/i,
  /o prompt abaixo/i, /a lista (abaixo|completa)/i,
  /ouça o podcast/i, /disponível no episódio/i,
  /spotify|deezer|apple podcasts/i,
  /está no whatsapp/i, /entre no canal/i,
  /acompanhe (notícias|dicas|conteúdo)/i,
];

export function ArticleModal({ article, onClose }) {
  const [visible, setVisible] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const esc = (e) => { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", esc);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", esc); document.body.style.overflow = ""; };
  }, []); // eslint-disable-line

  function close() { setVisible(false); setTimeout(onClose, 280); }

  const paragraphs = (article.content?.split("\n\n") ?? [])
    .map((p) => p.trim())
    .filter((p) => p.length > 60 && !JUNK.some((re) => re.test(p)));

  const [lead, ...body] = paragraphs;
  const hasContent = paragraphs.length > 0;
  const mins       = hasContent ? readingTime(article.content) : null;
  const src        = article.source?.name ?? article.source ?? "";
  const fullDate   = fmtDate(article.publishedAt);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{
        background: visible ? "rgba(0,0,0,0.7)" : "rgba(0,0,0,0)",
        backdropFilter: visible ? "blur(8px)" : "blur(0px)",
        transition: "background 280ms ease, backdrop-filter 280ms ease",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) close(); }}
    >
      <div
        className="relative w-full sm:max-w-3xl h-[100dvh] sm:h-[94dvh] flex flex-col
          bg-background sm:rounded-3xl overflow-hidden border-0 sm:border sm:border-border"
        style={{
          boxShadow: "0 40px 120px rgba(0,0,0,0.5)",
          transform: visible ? "translateY(0)" : "translateY(60px)",
          opacity:   visible ? 1 : 0,
          transition: "transform 320ms cubic-bezier(0.34,1.1,0.64,1), opacity 260ms ease",
        }}
      >
        {/* Topbar */}
        <div className="shrink-0 flex items-center justify-between gap-3
          px-4 sm:px-6 h-14 border-b border-border bg-background/95 backdrop-blur-sm">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest
              text-primary bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-full shrink-0">
              <Rss className="w-2.5 h-2.5" />
              {src}
            </span>
            <span className="hidden sm:flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Clock className="w-3 h-3 shrink-0" />
              {fullDate}
              {mins && <><span className="text-border">·</span><BookOpen className="w-3 h-3" />{mins} min</>}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-semibold
                text-muted-foreground hover:text-primary transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Ver original
            </a>
            <button
              onClick={close}
              className="w-8 h-8 rounded-full flex items-center justify-center
                bg-muted hover:bg-accent text-muted-foreground hover:text-foreground
                transition-colors border border-border"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Conteúdo scrollável */}
        <div ref={scrollRef} className="overflow-y-auto flex-1">
          {article.image && (
            <div className="w-full overflow-hidden" style={{ maxHeight: "360px" }}>
              <img
                src={article.image}
                alt={article.title}
                className="w-full h-full object-cover"
                style={{ maxHeight: "360px" }}
                onError={(e) => { e.currentTarget.parentElement.style.display = "none"; }}
              />
            </div>
          )}

          <div className="max-w-2xl mx-auto px-5 sm:px-8 py-8 sm:py-10">
            {article.depts?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-5">
                {article.depts.map((d) => <Pill key={d} dept={d} />)}
              </div>
            )}

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-foreground
              leading-[1.15] tracking-tight mb-5">
              {article.title}
            </h1>

            <div className="flex sm:hidden items-center gap-2 text-[11px] text-muted-foreground mb-6">
              <Clock className="w-3 h-3 shrink-0" />
              <span>{fullDate}</span>
              {mins && <><span>·</span><BookOpen className="w-3 h-3" /><span>{mins} min de leitura</span></>}
            </div>

            {hasContent ? (
              <div className="space-y-0">
                <p className="text-lg sm:text-xl text-foreground/90 leading-[1.75] font-medium mb-7
                  border-l-[3px] border-primary pl-4">
                  {lead}
                </p>
                {body.length > 0 && (
                  <div className="flex items-center gap-3 my-7">
                    <div className="h-px flex-1 bg-border" />
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                    <div className="h-px flex-1 bg-border" />
                  </div>
                )}
                <div className="space-y-5">
                  {body.map((p, i) => (
                    <p key={i} className="text-base sm:text-[17px] text-foreground/80 leading-[1.85] tracking-[0.01em]">
                      {p}
                    </p>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center gap-4 py-12">
                <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
                  <Newspaper className="w-6 h-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1.5">
                    Conteúdo disponível no site original
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                    Esta fonte não disponibiliza o texto completo. Acesse a matéria original para ler tudo.
                  </p>
                </div>
              </div>
            )}

            <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row
              items-start sm:items-center justify-between gap-4">
              <div className="text-[11px] text-muted-foreground">
                <span className="uppercase tracking-widest font-semibold block mb-0.5">Publicado por</span>
                <span className="font-bold text-foreground/70">{src}</span>
              </div>
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl
                  font-semibold text-sm text-white transition-all duration-200
                  hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: "linear-gradient(135deg, #7c3aed 0%, #635bff 50%, #2563eb 100%)",
                  boxShadow: "0 4px 16px oklch(0.55 0.28 264 / 0.35)",
                }}
              >
                <ExternalLink className="w-4 h-4" />
                Ler matéria original
              </a>
            </div>
            <div className="h-8" />
          </div>
        </div>
      </div>
    </div>
  );
}
