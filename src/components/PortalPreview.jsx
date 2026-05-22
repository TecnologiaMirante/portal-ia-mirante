/**
 * PortalPreview — tries a live iframe embed of each portal first,
 * falls back to a custom mini-UI if the portal blocks framing.
 *
 * Iframe scaling trick:
 *   The iframe renders at 4.5× the container size (e.g. ~1600px wide)
 *   then CSS scale(0.222) shrinks it back to fit — giving a real desktop
 *   viewport compressed into the card preview area.
 *
 * Fallback types: "bi-dashboard" | "creative-studio" | "commercial"
 */
import { useRef, useEffect, useState } from "react";

/* ══════════════════════════════════════════════════════════
   FALLBACK PREVIEWS  (shown when iframe is blocked)
   ══════════════════════════════════════════════════════════ */

/* ── 1. PDMI — Power BI hub + Mara ───────────────────────── */
const PDMI_BARS = [52, 68, 44, 82, 59, 74, 91, 56, 71, 86, 42, 64];
const PDMI_KPIS = [
  { label: "Faturamento", value: "R$2.4M", trend: "+18%" },
  { label: "Meta",         value: "87%",   trend: "+5%"  },
  { label: "Sessões",      value: "1.4K",  trend: "+23%" },
];

function BiDashboardPreview({ portal }) {
  return (
    <div
      className="w-full h-full rounded-xl overflow-hidden border border-border flex flex-col"
      style={{ background: `linear-gradient(160deg, ${portal.color}07 0%, ${portal.color}02 100%)` }}
    >
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-border shrink-0"
        style={{ background: `${portal.color}12` }}>
        <div className="w-4 h-4 rounded-sm flex items-center justify-center text-[6px] font-black shrink-0"
          style={{ background: `${portal.color}30`, color: portal.color }}>BI</div>
        <span className="text-[10px] font-bold flex-1" style={{ color: portal.color }}>PDMI · Dashboards</span>
        <div className="flex items-center gap-1 shrink-0">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[8px] text-muted-foreground">Mara online</span>
        </div>
      </div>

      <div className="flex gap-1.5 px-2.5 pt-2 shrink-0">
        {PDMI_KPIS.map((k) => (
          <div key={k.label} className="flex-1 rounded-lg px-1.5 py-1 border"
            style={{ background: `${portal.color}09`, borderColor: `${portal.color}22` }}>
            <div className="text-[10px] font-black leading-none" style={{ color: portal.color }}>{k.value}</div>
            <div className="text-[7px] text-muted-foreground mt-0.5 leading-none truncate">{k.label}</div>
            <div className="text-[7px] text-emerald-400 mt-0.5 leading-none">{k.trend}</div>
          </div>
        ))}
      </div>

      <div className="flex-1 flex items-end gap-px px-2.5 pb-1 pt-2 min-h-0">
        {PDMI_BARS.map((h, i) => (
          <div key={i} className="flex-1 rounded-t-sm"
            style={{ height: `${h}%`, background: i < 8 ? `linear-gradient(to top, ${portal.color}dd, ${portal.color}77)` : `${portal.color}30` }} />
        ))}
      </div>

      <div className="flex items-center gap-2 px-2.5 py-1.5 border-t border-border shrink-0"
        style={{ background: `${portal.color}0a` }}>
        <div className="w-5 h-5 rounded-lg flex items-center justify-center text-[8px] font-black shrink-0"
          style={{ background: `${portal.color}28`, color: portal.color }}>M</div>
        <div className="flex-1 min-w-0">
          <div className="text-[9px] font-semibold leading-none" style={{ color: portal.color }}>Mara · Analista de BI</div>
          <div className="text-[7.5px] text-muted-foreground leading-none mt-0.5 truncate">Consultando dataset...</div>
        </div>
        <div className="flex gap-0.5 shrink-0">
          {[0, 120, 240].map((d) => (
            <div key={d} className="w-1 h-1 rounded-full animate-bounce"
              style={{ background: portal.color, opacity: 0.7, animationDelay: `${d}ms`, animationDuration: "0.9s" }} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── 2. Mira Creative — editorial production hub ──────────── */
const MC_PAUTAS = [
  { title: "Especial de Aniversário",   status: "Em Produção", statusColor: "#f59e0b" },
  { title: "Entrevista com CEO",         status: "Aprovado",    statusColor: "#10b981" },
  { title: "Vídeo Institucional 2025",  status: "IA Review",   statusColor: "#ec4899" },
];
const MC_KPIS = [
  { v: "24", l: "Pautas"   },
  { v: "91%", l: "Aprovação" },
  { v: "7",   l: "Em Prod." },
];

function CreativeStudioPreview({ portal }) {
  return (
    <div
      className="w-full h-full rounded-xl overflow-hidden border border-border flex flex-col"
      style={{ background: `linear-gradient(160deg, ${portal.color}07 0%, ${portal.color}02 100%)` }}
    >
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-border shrink-0"
        style={{ background: `${portal.color}12` }}>
        <div className="w-4 h-4 rounded-sm flex items-center justify-center text-[5.5px] font-black shrink-0"
          style={{ background: `${portal.color}30`, color: portal.color }}>MC</div>
        <span className="text-[10px] font-bold flex-1" style={{ color: portal.color }}>Mira Creative</span>
        <span className="text-[8px] text-muted-foreground shrink-0">3 ativas</span>
      </div>

      <div className="flex gap-1.5 px-2.5 pt-2 shrink-0">
        {MC_KPIS.map((k) => (
          <div key={k.l} className="flex-1 flex flex-col items-center rounded-lg py-1 border"
            style={{ background: `${portal.color}09`, borderColor: `${portal.color}22` }}>
            <span className="text-[10px] font-black leading-none" style={{ color: portal.color }}>{k.v}</span>
            <span className="text-[7px] text-muted-foreground mt-0.5 leading-none">{k.l}</span>
          </div>
        ))}
      </div>

      <div className="flex-1 flex flex-col gap-1 px-2.5 py-2 overflow-hidden min-h-0">
        {MC_PAUTAS.map((p, i) => (
          <div key={i} className="flex items-center gap-2 px-2 py-1 rounded-lg border"
            style={{ background: `${portal.color}06`, borderColor: `${portal.color}18` }}>
            <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: p.statusColor }} />
            <span className="text-[9px] text-foreground/75 flex-1 truncate leading-none">{p.title}</span>
            <span className="text-[7px] font-semibold px-1.5 py-0.5 rounded-full border shrink-0"
              style={{ color: p.statusColor, borderColor: `${p.statusColor}40`, background: `${p.statusColor}15` }}>
              {p.status}
            </span>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 px-2.5 py-1.5 border-t border-border shrink-0"
        style={{ background: `${portal.color}0a` }}>
        <div className="w-5 h-5 rounded-lg flex items-center justify-center text-[9px] shrink-0"
          style={{ background: `${portal.color}28`, color: portal.color }}>✦</div>
        <div className="flex-1 min-w-0">
          <div className="text-[9px] font-semibold leading-none" style={{ color: portal.color }}>Copiloto Criativo</div>
          <div className="text-[7.5px] text-muted-foreground leading-none mt-0.5">Gerando roteiro com GPT...</div>
        </div>
        <div className="flex gap-0.5 shrink-0">
          {[0, 120, 240].map((d) => (
            <div key={d} className="w-1 h-1 rounded-full animate-bounce"
              style={{ background: portal.color, opacity: 0.7, animationDelay: `${d}ms`, animationDuration: "0.9s" }} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── 3. Produtos & Soluções — commercial analyst ──────────── */
const PS_OPPS = [
  { label: "Expansão de licenças",  value: "+R$4.2K", badge: "Alta",  badgeColor: "#ef4444" },
  { label: "Módulo de BI avançado", value: "+R$2.8K", badge: "Média", badgeColor: "#f59e0b" },
  { label: "Suporte Premium 24h",   value: "+R$1.5K", badge: "Alta",  badgeColor: "#ef4444" },
];

function CommercialPreview({ portal }) {
  return (
    <div
      className="w-full h-full rounded-xl overflow-hidden border border-border flex flex-col"
      style={{ background: `linear-gradient(160deg, ${portal.color}07 0%, ${portal.color}02 100%)` }}
    >
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-border shrink-0"
        style={{ background: `${portal.color}12` }}>
        <div className="w-4 h-4 rounded-sm flex items-center justify-center text-[5px] font-black shrink-0"
          style={{ background: `${portal.color}30`, color: portal.color }}>P&S</div>
        <span className="text-[10px] font-bold flex-1" style={{ color: portal.color }}>Análise Comercial</span>
        <span className="text-[8px] text-emerald-400 shrink-0">3 oportunidades</span>
      </div>

      <div className="mx-2.5 mt-2 rounded-lg border px-2.5 py-1.5 shrink-0"
        style={{ background: `${portal.color}09`, borderColor: `${portal.color}28` }}>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm shrink-0" style={{ background: `${portal.color}45` }} />
          <span className="text-[9px] font-semibold leading-none" style={{ color: portal.color }}>
            Plano Empresarial · Cliente X
          </span>
        </div>
        <div className="flex gap-1.5 mt-1.5 flex-wrap">
          {["12 licenças", "Plano Base", "R$8.4K/mês"].map((t) => (
            <span key={t} className="text-[7px] text-muted-foreground border rounded px-1 py-0.5 leading-none"
              style={{ borderColor: `${portal.color}22` }}>{t}</span>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-1 px-2.5 py-2 overflow-hidden min-h-0">
        {PS_OPPS.map((o, i) => (
          <div key={i} className="flex items-center gap-2 px-2 py-1 rounded-lg border"
            style={{ background: `${portal.color}06`, borderColor: `${portal.color}18` }}>
            <span className="text-[9px] text-foreground/75 flex-1 truncate leading-none">{o.label}</span>
            <span className="text-[9px] font-bold text-emerald-400 shrink-0">{o.value}</span>
            <span className="text-[7px] font-semibold px-1.5 py-0.5 rounded-full border shrink-0"
              style={{ color: o.badgeColor, borderColor: `${o.badgeColor}40`, background: `${o.badgeColor}15` }}>
              {o.badge}
            </span>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 px-2.5 py-1.5 border-t border-border shrink-0"
        style={{ background: `${portal.color}0a` }}>
        <div className="w-5 h-5 rounded-lg flex items-center justify-center text-[8px] font-bold shrink-0"
          style={{ background: `${portal.color}28`, color: portal.color }}>AI</div>
        <div className="flex-1 min-w-0">
          <div className="text-[9px] font-semibold leading-none" style={{ color: portal.color }}>Analista Comercial</div>
          <div className="text-[7.5px] text-muted-foreground leading-none mt-0.5">Identificando oportunidades...</div>
        </div>
        <div className="flex gap-0.5 shrink-0">
          {[0, 120, 240].map((d) => (
            <div key={d} className="w-1 h-1 rounded-full animate-bounce"
              style={{ background: portal.color, opacity: 0.7, animationDelay: `${d}ms`, animationDuration: "0.9s" }} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   IFRAME EMBED  (primary — tries live portal first)
   ══════════════════════════════════════════════════════════ */

/**
 * Renders the portal inside a scaled-down "mini browser" frame.
 *
 * Scale trick: iframe is set to 450% width/height, then CSS
 * scale(0.222) brings it back to 100% of the container — so
 * the portal renders at ~1600px wide and compresses into the card.
 *
 * Detection strategy:
 *  - onLoad fires → try reading contentDocument
 *    • same-origin & has body → mark "loaded"
 *    • cross-origin SecurityError → iframe loaded (login page) → mark "loaded"
 *    • null / empty body → X-Frame-Options blocked → mark "blocked" → show fallback
 *  - 5-second timeout → if still "loading" → mark "blocked"
 */
function IframePortalPreview({ portal, fallback }) {
  const iframeRef             = useRef(null);
  const [status, setStatus]   = useState("loading"); // "loading" | "loaded" | "blocked"

  /* Timeout fallback */
  useEffect(() => {
    const timer = setTimeout(() => {
      setStatus((s) => (s === "loading" ? "blocked" : s));
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  const handleLoad = () => {
    try {
      const doc = iframeRef.current?.contentDocument;
      if (!doc || !doc.body || doc.body.children.length === 0) {
        /* Blank page → X-Frame-Options probably blocked it */
        setStatus("blocked");
      } else {
        /* Same-origin with real content */
        setStatus("loaded");
      }
    } catch {
      /* Cross-origin SecurityError → iframe loaded correctly (shows login / app) */
      setStatus("loaded");
    }
  };

  return (
    <div className="w-full h-full rounded-xl overflow-hidden border border-border flex flex-col">

      {/* ── Mini browser chrome ──────────────────────────── */}
      <div
        className="flex items-center gap-1.5 px-2.5 py-[5px] border-b border-border shrink-0"
        style={{ background: `${portal.color}10` }}
      >
        {/* Traffic lights */}
        <div className="flex gap-1 shrink-0">
          <div className="w-2 h-2 rounded-full bg-red-400/55"    />
          <div className="w-2 h-2 rounded-full bg-yellow-400/55" />
          <div className="w-2 h-2 rounded-full bg-green-400/55"  />
        </div>

        {/* Fake URL bar */}
        <div
          className="flex-1 mx-1.5 px-2 py-[3px] rounded-md text-[8px] text-muted-foreground border border-border truncate bg-background/50 flex items-center gap-1"
        >
          {/* Lock icon */}
          <span style={{ color: portal.color, opacity: 0.7, fontSize: "9px" }}>🔒</span>
          <span className="truncate">
            {portal.url.replace(/^https?:\/\//, "")}
          </span>
        </div>

        {/* Status indicator */}
        <div
          className="w-2 h-2 rounded-full shrink-0 transition-colors duration-500"
          title={status === "loaded" ? "Conectado" : status === "blocked" ? "Bloqueado" : "Carregando..."}
          style={{
            background: status === "loaded"  ? "#10b981"
                      : status === "blocked" ? "#6b7280"
                      : "#f59e0b",
            boxShadow: status === "loading" ? "0 0 4px #f59e0b" : "none",
          }}
        />
      </div>

      {/* ── Viewport ─────────────────────────────────────── */}
      <div className="flex-1 relative overflow-hidden bg-background">

        {/* Loading spinner */}
        {status === "loading" && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-2 z-10"
            style={{ background: `${portal.color}04` }}
          >
            <div
              className="w-5 h-5 rounded-full border-[2.5px] animate-spin"
              style={{ borderColor: `${portal.color}25`, borderTopColor: portal.color }}
            />
            <span className="text-[9px] text-muted-foreground">Carregando portal...</span>
          </div>
        )}

        {/* Live iframe (hidden if blocked) */}
        {status !== "blocked" && (
          <iframe
            ref={iframeRef}
            src={portal.url}
            onLoad={handleLoad}
            onError={() => setStatus("blocked")}
            title={`Preview — ${portal.portal}`}
            className="absolute inset-0 border-none pointer-events-none"
            style={{
              width:           "450%",
              height:          "450%",
              transform:       "scale(0.222)",
              transformOrigin: "0 0",
            }}
            sandbox="allow-scripts allow-same-origin"
          />
        )}

        {/* Fallback (blocked or timed-out) */}
        {status === "blocked" && (
          <div className="absolute inset-0">
            {fallback}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Fallback dispatcher ───────────────────────────────────── */
function FallbackPreview({ portal }) {
  const type = portal.previewType;
  if (type === "bi-dashboard")    return <BiDashboardPreview    portal={portal} />;
  if (type === "creative-studio") return <CreativeStudioPreview portal={portal} />;
  if (type === "commercial")      return <CommercialPreview      portal={portal} />;
  return null;
}

/* ── Public dispatcher ─────────────────────────────────────── */
export function PortalPreview({ portal }) {
  return (
    <IframePortalPreview
      portal={portal}
      fallback={<FallbackPreview portal={portal} />}
    />
  );
}
