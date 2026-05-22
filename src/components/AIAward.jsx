import { useState } from "react";
import { Trophy, Zap, Share2, Medal, ArrowRight, Bell, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const steps = [
  {
    icon: Zap,
    lightColor: "text-amber-600",
    darkColor:  "dark:text-amber-400",
    lightBg:    "bg-amber-50 border-amber-100",
    darkBg:     "dark:bg-amber-500/15 dark:border-amber-500/25",
    step: "01",
    title: "Use IA no trabalho",
    description:
      "Aplique ferramentas de IA nas suas tarefas diárias e documente os resultados obtidos.",
  },
  {
    icon: Share2,
    lightColor: "text-indigo-600",
    darkColor:  "dark:text-indigo-400",
    lightBg:    "bg-indigo-50 border-indigo-100",
    darkBg:     "dark:bg-indigo-500/15 dark:border-indigo-500/25",
    step: "02",
    title: "Compartilhe resultados",
    description:
      "Apresente o caso de uso para o time: ganho de tempo, qualidade ou nova solução encontrada.",
  },
  {
    icon: Trophy,
    lightColor: "text-emerald-600",
    darkColor:  "dark:text-emerald-400",
    lightBg:    "bg-emerald-50 border-emerald-100",
    darkBg:     "dark:bg-emerald-500/15 dark:border-emerald-500/25",
    step: "03",
    title: "Seja reconhecido",
    description:
      "Os melhores casos são premiados trimestralmente. Destaque, certificado e reconhecimento público.",
  },
];

const badges = [
  { icon: Medal,  label: "Inovador IA",  lightColor: "text-amber-600",   darkColor: "dark:text-amber-400",   lightBg: "bg-amber-50 border-amber-200",    darkBg: "dark:bg-amber-500/15 dark:border-amber-500/30" },
  { icon: Trophy, label: "Campeão IA",   lightColor: "text-indigo-600",  darkColor: "dark:text-indigo-400",  lightBg: "bg-indigo-50 border-indigo-200",  darkBg: "dark:bg-indigo-500/15 dark:border-indigo-500/30" },
  { icon: Zap,    label: "IA do Mês",    lightColor: "text-emerald-600", darkColor: "dark:text-emerald-400", lightBg: "bg-emerald-50 border-emerald-200", darkBg: "dark:bg-emerald-500/15 dark:border-emerald-500/30" },
];

/* ── Coming Soon Modal ───────────────────────────────────────── */
function ComingSoonModal({ onClose }) {
  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center p-4 animate-in fade-in duration-200"
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm bg-card border border-border rounded-2xl shadow-2xl p-8 flex flex-col items-center text-center gap-5 animate-in zoom-in-95 fade-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* icon */}
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center overflow-hidden">
            <Trophy className="trophy-drop w-9 h-9 text-amber-500 dark:text-amber-400" strokeWidth={1.5} />
          </div>
          {/* pulse ring */}
          <div className="absolute inset-0 rounded-full border-2 border-amber-400/30 animate-ping" />
        </div>

        {/* text */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-bold uppercase tracking-widest text-amber-500 dark:text-amber-400">
              Em breve
            </span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>

          <h3 className="text-xl font-bold text-foreground leading-snug">
            Prêmio IA Mirante
          </h3>

          <p className="text-sm text-muted-foreground leading-relaxed">
            Estamos preparando algo especial para reconhecer quem usa IA com
            excelência. Fique de olho nas novidades pelo portal e no Teams!
          </p>
        </div>

        {/* decorative badges preview */}
        <div className="flex gap-2 w-full justify-center">
          {badges.map(({ icon: Icon, label, lightColor, darkColor, lightBg, darkBg }, i) => (
            <div
              key={i}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl border opacity-60 ${lightBg} ${darkBg}`}
            >
              <Icon className={`w-4 h-4 ${lightColor} ${darkColor}`} />
              <span className="text-[9px] font-semibold text-muted-foreground text-center leading-tight">
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* cta */}
        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-500/90 text-white font-semibold text-sm transition-all shadow-md shadow-amber-500/25 flex items-center justify-center gap-2"
        >
          <Bell className="w-4 h-4" />
          Entendido, aguardo!
        </button>
      </div>
    </div>
  );
}

/* ── Section ─────────────────────────────────────────────────── */
export function AIAward() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <section id="premio-ia" className="py-16 relative overflow-hidden bg-background">
        {/* Warm glow */}
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <div
            className="absolute bottom-0 right-1/4 w-[600px] h-[400px] rounded-full opacity-20 dark:opacity-15"
            style={{
              background: "radial-gradient(ellipse, oklch(0.70 0.20 60 / 0.5) 0%, transparent 70%)",
              filter: "blur(80px)",
            }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="reveal">
              <span className="text-xs font-semibold uppercase tracking-widest text-amber-500 dark:text-amber-400 mb-3 block">
                Prêmio IA
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                Reconhecendo quem usa{" "}
                <span className="gradient-text-warm">IA com excelência</span>
              </h2>
              <p className="text-muted-foreground">
                O programa de premiação da Mirante reconhece e celebra os colaboradores
                que utilizam Inteligência Artificial para criar resultados extraordinários.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Trophy visual */}
            <div className="reveal flex flex-col items-center justify-center">
              <div className="relative w-52 h-52">
                <div className="absolute inset-0 rounded-full bg-amber-500/8 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 animate-pulse" />
                <div className="absolute inset-6 rounded-full bg-amber-500/12 dark:bg-amber-500/15 border border-amber-300/40 dark:border-amber-500/30" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Trophy
                    className="w-24 h-24 text-amber-500 dark:text-amber-400"
                    strokeWidth={1.5}
                  />
                </div>
              </div>

              <h3 className="mt-6 text-2xl font-bold text-foreground">Prêmio IA Mirante</h3>
              <p className="text-sm text-muted-foreground mt-1">Edição Trimestral</p>

              {/* Badges */}
              <div className="flex gap-3 mt-6">
                {badges.map(({ icon: Icon, label, lightColor, darkColor, lightBg, darkBg }, i) => (
                  <div
                    key={i}
                    className={`flex flex-col items-center gap-1.5 px-4 py-3 rounded-xl border min-w-[80px] ${lightBg} ${darkBg}`}
                  >
                    <Icon className={`w-5 h-5 ${lightColor} ${darkColor}`} />
                    <span className="text-[10px] font-semibold text-muted-foreground text-center">
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Steps */}
            <div className="flex flex-col gap-4">
              {steps.map(({ icon: Icon, lightColor, darkColor, lightBg, darkBg, step, title, description }, i) => (
                <div
                  key={i}
                  className={`reveal reveal-delay-${i + 1} glass-card flex items-start gap-4 p-5 rounded-2xl hover:-translate-x-0.5 transition-all`}
                >
                  <div className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 ${lightBg} ${darkBg}`}>
                    <Icon className={`w-5 h-5 ${lightColor} ${darkColor}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-muted-foreground/50">{step}</span>
                      <span className="font-semibold text-foreground">{title}</span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
                  </div>
                </div>
              ))}

              <div className="reveal reveal-delay-4 mt-2">
                <Button
                  variant="outline"
                  onClick={() => setModalOpen(true)}
                  className="btn-xl border-amber-300 text-amber-600 hover:bg-amber-50 hover:border-amber-400 dark:border-amber-500/30 dark:text-amber-400 dark:hover:bg-amber-500/10 dark:hover:border-amber-500/50 transition-all"
                >
                  <Trophy className="w-4 h-4" />
                  Saiba mais sobre o prêmio
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modal */}
      {modalOpen && <ComingSoonModal onClose={() => setModalOpen(false)} />}
    </>
  );
}
