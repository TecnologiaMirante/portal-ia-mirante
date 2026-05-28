/**
 * PortalPreview — animated mock UI for each Mirante portal type
 * previewType: "bi-dashboard" | "creative-studio" | "commercial"
 */
import { Bot, TrendingUp, BarChart2, FileText, Sparkles, Search } from "lucide-react";

/* ── Shared: typing dots ───────────────────────────────── */
function TypingDots({ color }) {
  return (
    <div className="flex gap-1 items-center px-3 py-2">
      {[0, 150, 300].map((d) => (
        <div
          key={d}
          className="w-1.5 h-1.5 rounded-full animate-bounce"
          style={{ backgroundColor: color, animationDelay: `${d}ms`, animationDuration: "0.9s" }}
        />
      ))}
    </div>
  );
}

/* ── 1. BI Dashboard (PDMI) ────────────────────────────── */
const BI_BARS = [55, 72, 48, 88, 62, 78, 92, 58, 74, 84];

function BIDashboardPreview({ portal }) {
  return (
    <div className="w-full h-full flex flex-col rounded-xl overflow-hidden border border-border bg-background/60">
      {/* Topbar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-indigo-500/10">
        <BarChart2 className="w-3.5 h-3.5 text-indigo-400" />
        <span className="text-[10px] font-bold text-indigo-300">PDMI — Painel Executivo</span>
        <div className="ml-auto flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[8px] text-muted-foreground">live</span>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-3 gap-1.5 px-2.5 pt-2">
        {[
          { label: "Faturamento", value: "R$ 2,4M", delta: "+18%" },
          { label: "Margem",      value: "34,2%",   delta: "+2,1p" },
          { label: "NPS",         value: "72",       delta: "+5" },
        ].map((k) => (
          <div
            key={k.label}
            className="flex flex-col gap-0.5 p-1.5 rounded-lg border border-indigo-500/20 bg-indigo-500/8"
          >
            <span className="text-[8px] text-muted-foreground">{k.label}</span>
            <span className="text-[11px] font-bold text-indigo-300">{k.value}</span>
            <span className="text-[8px] text-emerald-400">{k.delta}</span>
          </div>
        ))}
      </div>

      {/* Mini bar chart */}
      <div className="flex-1 flex items-end gap-px px-2.5 pb-1.5 pt-2">
        {BI_BARS.map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-t-sm"
            style={{
              height: `${h}%`,
              background: i < 7
                ? `linear-gradient(to top, #6366f1, #818cf8)`
                : "rgba(99,102,241,0.25)",
              animation: `equalizer ${0.7 + (i % 5) * 0.12}s ease-in-out ${(i * 0.04).toFixed(2)}s infinite alternate`,
              transformOrigin: "bottom",
            }}
          />
        ))}
      </div>

      {/* Chat snippet */}
      <div className="px-2.5 pb-2 flex gap-1.5 items-end">
        <div className="w-5 h-5 rounded-md bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center shrink-0">
          <Bot className="w-3 h-3 text-indigo-400" />
        </div>
        <div className="bg-card border border-border text-[9px] text-foreground/70 rounded-xl rounded-bl-sm px-2.5 py-1.5 leading-relaxed max-w-[85%] line-clamp-2">
          {portal.previewChat?.ai}
        </div>
      </div>
    </div>
  );
}

/* ── 2. Creative Studio (Mira Creative) ─────────────────── */
function CreativeStudioPreview({ portal }) {
  return (
    <div className="w-full h-full flex flex-col rounded-xl overflow-hidden border border-border bg-background/60">
      {/* Topbar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-pink-500/10">
        <Sparkles className="w-3.5 h-3.5 text-pink-400" />
        <span className="text-[10px] font-bold text-pink-300">Mira Creative</span>
        <div className="ml-auto flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[8px] text-muted-foreground">online</span>
        </div>
      </div>

      {/* User input pill */}
      <div className="mx-2.5 mt-2.5 flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-pink-500/25 bg-pink-500/10">
        <Search className="w-3 h-3 text-pink-400/60 shrink-0" />
        <span className="text-[9px] text-pink-200/70 truncate">{portal.previewChat?.user}</span>
      </div>

      {/* Script lines */}
      <div className="flex-1 flex flex-col gap-1 px-2.5 pt-2 overflow-hidden">
        {[
          { label: "CENA 1",  text: "Logo + trilha emocional. Voz off: 'Há 20 anos...'" },
          { label: "CENA 2",  text: "Equipe em ação. Corte rápido, 3s cada shot." },
          { label: "CENA 3",  text: "CTA final: logo + tagline + música fade out." },
        ].map((line) => (
          <div key={line.label} className="flex gap-2 items-start">
            <span
              className="text-[8px] font-bold px-1.5 py-0.5 rounded shrink-0 mt-0.5"
              style={{ background: "rgba(236,72,153,0.2)", color: "#f9a8d4" }}
            >
              {line.label}
            </span>
            <span className="text-[9px] text-foreground/60 leading-relaxed line-clamp-1">{line.text}</span>
          </div>
        ))}
      </div>

      {/* Typing */}
      <div className="px-2.5 pb-2 flex items-end gap-1.5">
        <div className="w-5 h-5 rounded-md bg-pink-500/20 border border-pink-500/40 flex items-center justify-center shrink-0">
          <Bot className="w-3 h-3 text-pink-400" />
        </div>
        <div className="bg-card border border-border rounded-xl rounded-bl-sm shadow-sm">
          <TypingDots color="#ec4899" />
        </div>
      </div>
    </div>
  );
}

/* ── 3. Commercial (Produtos e Soluções) ─────────────────── */
function CommercialPreview({ portal }) {
  return (
    <div className="w-full h-full flex flex-col rounded-xl overflow-hidden border border-border bg-background/60">
      {/* Topbar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-amber-500/10">
        <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
        <span className="text-[10px] font-bold text-amber-300">Produtos e Soluções</span>
        <div className="ml-auto flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[8px] text-muted-foreground">online</span>
        </div>
      </div>

      {/* Uploaded file indicator */}
      <div className="mx-2.5 mt-2 flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-amber-500/25 bg-amber-500/8">
        <FileText className="w-3 h-3 text-amber-400 shrink-0" />
        <span className="text-[9px] text-amber-200/70 truncate">{portal.previewChat?.user}</span>
      </div>

      {/* Opportunities list */}
      <div className="flex-1 flex flex-col gap-1.5 px-2.5 pt-2 overflow-hidden">
        {[
          { n: "01", text: "Expansão de licenças — 3 usuários inativos",  badge: "Alta" },
          { n: "02", text: "Upsell módulo BI — cliente já usa base",      badge: "Média" },
          { n: "03", text: "Suporte premium — SLA expirado em 30d",       badge: "Alta" },
        ].map((op) => (
          <div key={op.n} className="flex items-center gap-2">
            <span className="text-[8px] text-amber-500/60 font-mono shrink-0">{op.n}</span>
            <span className="text-[9px] text-foreground/65 leading-tight flex-1 line-clamp-1">{op.text}</span>
            <span
              className="text-[7px] font-bold px-1.5 py-0.5 rounded-full shrink-0"
              style={{ background: op.badge === "Alta" ? "rgba(245,158,11,0.25)" : "rgba(245,158,11,0.12)", color: "#fbbf24" }}
            >
              {op.badge}
            </span>
          </div>
        ))}
      </div>

      {/* AI response */}
      <div className="px-2.5 pb-2 flex gap-1.5 items-end">
        <div className="w-5 h-5 rounded-md bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
          <Bot className="w-3 h-3 text-amber-400" />
        </div>
        <div className="bg-card border border-border text-[9px] text-foreground/70 rounded-xl rounded-bl-sm px-2.5 py-1.5 leading-relaxed max-w-[85%] line-clamp-2">
          {portal.previewChat?.ai}
        </div>
      </div>
    </div>
  );
}

/* ── Dispatcher ─────────────────────────────────────────── */
export function PortalPreview({ portal }) {
  if (portal.previewType === "bi-dashboard")    return <BIDashboardPreview    portal={portal} />;
  if (portal.previewType === "creative-studio") return <CreativeStudioPreview portal={portal} />;
  if (portal.previewType === "commercial")      return <CommercialPreview     portal={portal} />;
  return null;
}
