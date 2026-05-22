import { ExternalLink, Bot, ArrowUpRight, Users } from "lucide-react";
import { mirantePortals } from "@/data/mirante";
import { TiltCard } from "@/components/effects/TiltCard";
import { PortalPreview } from "@/components/PortalPreview";

/* ── Portal card ─────────────────────────────────────────── */
function PortalCard({ portal, delay }) {
  return (
    <div className={`reveal reveal-delay-${delay}`}>
      <TiltCard intensity={5} className="glass-card rounded-2xl overflow-hidden flex flex-col h-full group">

        {/* ── Portal preview — iframe embed + fallback */}
        <div className="h-[210px] p-2.5 border-b border-border bg-secondary/20 dark:bg-background/30">
          <PortalPreview portal={portal} />
        </div>

        {/* ── Body */}
        <div className="flex flex-col gap-4 p-5 flex-1">

          {/* Portal name + badge */}
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-bold text-foreground text-base leading-tight">{portal.portal}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{portal.portalFull}</p>
            </div>
            <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full shrink-0 ${portal.badgeClass}`}>
              {portal.badge}
            </span>
          </div>

          {/* Agents list */}
          <div className="flex flex-col gap-2 flex-1">
            <div className="flex items-center gap-1.5">
              <Users className={`w-3 h-3 ${portal.textClass}`} />
              <span className={`text-[10px] font-bold uppercase tracking-widest ${portal.textClass} opacity-70`}>
                {portal.agents.length === 1 ? "Agente" : `${portal.agents.length} Agentes`}
              </span>
            </div>
            {portal.agents.map((agent, i) => (
              <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-secondary/60 dark:bg-background/40 border border-border">
                <div
                  className="w-7 h-7 rounded-lg border flex items-center justify-center shrink-0"
                  style={{ background: `${portal.color}18`, borderColor: `${portal.color}40`, color: portal.color }}
                >
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-semibold text-foreground">{agent.name}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${portal.badgeClass}`}>{agent.role}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">{agent.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <a
            href={portal.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl border font-semibold text-sm transition-all duration-200 hover:opacity-90 hover:scale-[1.01]"
            style={{
              background: `${portal.color}18`,
              borderColor: `${portal.color}45`,
              color: portal.color,
            }}
          >
            <span>Acessar portal</span>
            <div className="flex items-center gap-1">
              <ExternalLink className="w-3.5 h-3.5" />
              <ArrowUpRight className="w-3.5 h-3.5 opacity-0 -ml-3.5 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200" />
            </div>
          </a>
        </div>
      </TiltCard>
    </div>
  );
}

/* ── Section ─────────────────────────────────────────────── */
export function MiranteAIs() {
  return (
    <section id="implementacoes" className="py-16 relative overflow-hidden bg-background">
      {/* Accent glow */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full opacity-10"
          style={{ background: "radial-gradient(ellipse, oklch(0.55 0.28 264 / 0.5) 0%, transparent 70%)", filter: "blur(60px)" }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="max-w-2xl mb-10">
          <div className="reveal">
            <span className="text-xs font-semibold uppercase tracking-widest text-primary mb-3 block">
              Implementações na Mirante
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              IA que já está{" "}
              <span className="gradient-text">funcionando aqui</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Agentes de IA que a Mirante já desenvolveu e implantou nos portais internos.
              Cada um com um papel específico no seu setor — acesse e use agora.
            </p>
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {mirantePortals.map((portal, i) => (
            <PortalCard key={portal.id} portal={portal} delay={i + 1} />
          ))}
        </div>
      </div>
    </section>
  );
}
