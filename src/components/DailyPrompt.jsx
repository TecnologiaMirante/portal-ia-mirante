import { useState, useMemo } from "react";
import {
  Sparkles, Copy, Check, ChevronDown,
  ThumbsUp, ThumbsDown, RotateCcw,
} from "lucide-react";
import { useDailyPrompt } from "@/hooks/useDailyPrompt";

const AREA_COLORS = {
  Marketing:      "bg-pink-500/12 border-pink-500/25 text-pink-600 dark:text-pink-400",
  Comercial:      "bg-amber-500/12 border-amber-500/25 text-amber-600 dark:text-amber-400",
  RH:             "bg-violet-500/12 border-violet-500/25 text-violet-600 dark:text-violet-400",
  Financeiro:     "bg-emerald-500/12 border-emerald-500/25 text-emerald-600 dark:text-emerald-400",
  TI:             "bg-blue-500/12 border-blue-500/25 text-blue-600 dark:text-blue-400",
  Administrativo: "bg-slate-500/12 border-slate-500/25 text-slate-600 dark:text-slate-400",
  Jornalismo:     "bg-rose-500/12 border-rose-500/25 text-rose-600 dark:text-rose-400",
};

const TODAY_KEY = new Date().toISOString().slice(0, 10);

function getTodayFeedback() {
  try { return localStorage.getItem(`prompt_feedback_${TODAY_KEY}`) || null; }
  catch { return null; }
}
function saveTodayFeedback(val) {
  try { localStorage.setItem(`prompt_feedback_${TODAY_KEY}`, val); } catch {}
}

export function DailyPrompt() {
  const { prompt, allPrompts, loading } = useDailyPrompt();
  const [showPrompt, setShowPrompt]     = useState(false);
  const [showExample, setShowExample]   = useState(false);
  const [copied, setCopied]             = useState(false);
  const [feedback, setFeedback]         = useState(getTodayFeedback);
  const [browseArea, setBrowseArea]     = useState(null);

  const areas = useMemo(
    () => [...new Set(allPrompts.map((p) => p.area))].sort(),
    [allPrompts],
  );

  const browsePrompt = useMemo(() => {
    if (!browseArea || !allPrompts.length) return null;
    const pool = allPrompts.filter((p) => p.area === browseArea);
    if (!pool.length) return null;
    return pool[new Date().getDate() % pool.length];
  }, [browseArea, allPrompts]);

  const displayed = browseArea ? browsePrompt : prompt;

  const copy = async () => {
    if (!displayed?.prompt) return;
    try { await navigator.clipboard.writeText(displayed.prompt); } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const rate = (val) => { setFeedback(val); saveTodayFeedback(val); };

  if (loading) return <div className="glass-card rounded-2xl h-20 animate-pulse" />;
  if (!displayed) return null;

  const areaColor = AREA_COLORS[displayed.area] ?? "bg-primary/12 border-primary/25 text-primary";
  const dateLabel = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div className="reveal glass-card rounded-2xl overflow-hidden border border-border">
      {/* Linha de cor no topo */}
      <div
        className="h-0.5 w-full"
        style={{ background: `linear-gradient(90deg, ${displayed.toolColor}, ${displayed.toolColor}44, transparent)` }}
      />

      {/* Linha principal — sempre visível */}
      <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-4">

        {/* Esquerda: ícone + label + badges */}
        <div className="flex items-center gap-3 sm:min-w-[220px] shrink-0">
          <div className="w-8 h-8 rounded-xl bg-primary/12 border border-primary/20 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-primary" strokeWidth={1.5} />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary block">
              Prompt do Dia
            </span>
            <p className="text-[10px] text-muted-foreground/50 capitalize">{dateLabel}</p>
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${areaColor}`}>
                {displayed.area}
              </span>
              <span
                className="text-[10px] font-semibold px-2 py-0.5 rounded-full border"
                style={{ background: `${displayed.toolColor}15`, borderColor: `${displayed.toolColor}35`, color: displayed.toolColor }}
              >
                {displayed.tool}
              </span>
            </div>
          </div>
        </div>

        {/* Centro: título */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground leading-snug text-sm">{displayed.title}</p>
          <p className="text-[11px] text-muted-foreground/60 mt-0.5 line-clamp-1">
            {displayed.prompt.split("\n")[0]}
          </p>
        </div>

        {/* Direita: ações */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Feedback */}
          {feedback ? (
            <span className="text-[11px] text-muted-foreground flex items-center gap-1.5">
              {feedback === "yes" ? "Útil! 🎉" : "Valeu!"}
              <button
                onClick={() => { setFeedback(null); saveTodayFeedback(""); }}
                className="text-muted-foreground/40 hover:text-muted-foreground transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </span>
          ) : (
            <div className="flex items-center gap-1">
              <button
                onClick={() => rate("yes")}
                className="p-1.5 rounded-lg border border-border text-muted-foreground hover:border-emerald-500/40 hover:text-emerald-600 hover:bg-emerald-500/8 transition-all"
                title="Foi útil"
              >
                <ThumbsUp className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => rate("no")}
                className="p-1.5 rounded-lg border border-border text-muted-foreground hover:border-rose-500/40 hover:text-rose-600 hover:bg-rose-500/8 transition-all"
                title="Não foi útil"
              >
                <ThumbsDown className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Copiar */}
          <button
            onClick={copy}
            className={[
              "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all",
              copied
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                : "bg-primary/8 border-primary/25 text-primary hover:bg-primary/15",
            ].join(" ")}
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copiado!" : "Copiar prompt"}
          </button>

          {/* Expandir */}
          <button
            onClick={() => setShowPrompt((v) => !v)}
            className="p-1.5 rounded-xl border border-border text-muted-foreground hover:bg-accent transition-all"
            title={showPrompt ? "Recolher" : "Ver prompt completo"}
          >
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showPrompt ? "rotate-180" : ""}`} />
          </button>
        </div>
      </div>

      {/* Conteúdo expandido */}
      {showPrompt && (
        <div className="border-t border-border/50 px-5 pb-4 pt-4 flex flex-col gap-3 animate-in slide-in-from-top-1 fade-in duration-150">
          <pre className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap font-mono bg-muted/30 rounded-xl p-4 border border-border/50 max-h-48 overflow-y-auto">
            {displayed.prompt}
          </pre>

          {displayed.example && (
            <div>
              <button
                type="button"
                onClick={() => setShowExample((v) => !v)}
                className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronDown className={`w-3 h-3 transition-transform ${showExample ? "rotate-180" : ""}`} />
                {showExample ? "Ocultar exemplo" : "Ver exemplo preenchido"}
              </button>
              {showExample && (
                <p className="mt-2 text-[11px] text-muted-foreground italic leading-relaxed bg-muted/20 rounded-lg p-3 border border-border/40">
                  {displayed.example}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Filtro por área */}
      {areas.length > 1 && (
        <div className="border-t border-border/40 px-5 py-2.5 flex items-center gap-2 flex-wrap">
          <span className="text-[10px] text-muted-foreground/40 shrink-0">Filtrar por área:</span>
          {browseArea && (
            <button
              onClick={() => setBrowseArea(null)}
              className="px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-primary/10 border-primary/30 text-primary"
            >
              Hoje ✕
            </button>
          )}
          {areas.map((a) => (
            <button
              key={a}
              onClick={() => setBrowseArea(browseArea === a ? null : a)}
              className={[
                "px-2 py-0.5 rounded-full text-[10px] font-medium border transition-all",
                browseArea === a
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
              ].join(" ")}
            >
              {a}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
