import { ArrowRight, BookOpen, Copy, Star, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";

const stats = [
  { icon: BookOpen, value: "200+", label: "Prompts prontos" },
  { icon: Layers, value: "100+", label: "Categorias" },
  { icon: Star, value: "10+", label: "Setores cobertos" },
  { icon: Copy, value: "1 clique", label: "Para copiar e usar" },
];

const promptExamples = [
  {
    category: "Financeiro",
    colorText: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 border-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/20",
    iconBg:
      "bg-emerald-100 border-emerald-200 dark:bg-emerald-500/15 dark:border-emerald-500/25",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    title: "Assistente de Fluxo de Caixa",
    model: "ChatGPT",
  },
  {
    category: "Marketing",
    colorText: "text-rose-600 dark:text-rose-400",
    bg: "bg-rose-50 border-rose-100 dark:bg-rose-500/10 dark:border-rose-500/20",
    iconBg:
      "bg-rose-100 border-rose-200 dark:bg-rose-500/15 dark:border-rose-500/25",
    iconColor: "text-rose-600 dark:text-rose-400",
    title: "Criação de Campanha Digital",
    model: "Claude",
  },
  {
    category: "RH",
    colorText: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 border-amber-100 dark:bg-amber-500/10 dark:border-amber-500/20",
    iconBg:
      "bg-amber-100 border-amber-200 dark:bg-amber-500/15 dark:border-amber-500/25",
    iconColor: "text-amber-600 dark:text-amber-400",
    title: "Descrição de Vaga Atrativa",
    model: "Gemini",
  },
];

export function PromptBankCTA() {
  return (
    <section
      id="banco-prompts"
      className="py-16 relative overflow-hidden section-alt"
    >
      {/* Subtle primary glow (works both modes) */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full opacity-30 dark:opacity-20"
          style={{
            background:
              "radial-gradient(ellipse, oklch(0.55 0.28 264 / 0.15) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="rounded-3xl border border-border bg-background shadow-sm dark:shadow-none overflow-hidden">
          <div className="grid md:grid-cols-2 gap-0">
            {/* Left: content */}
            <div className="p-10 lg:p-14 flex flex-col justify-center gap-8">
              <div className="reveal">
                <span className="text-xs font-semibold uppercase tracking-widest text-primary mb-3 block">
                  Banco de Prompts
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                  Prompts prontos para{" "}
                  <span className="gradient-text">usar agora</span>
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Uma biblioteca curada com centenas de prompts organizados por
                  setor e categoria. Copie, adapte e obtenha resultados melhores
                  com IA — sem precisar partir do zero.
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 reveal reveal-delay-1">
                {stats.map(({ icon: Icon, value, label }, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <div className="font-bold text-foreground text-sm">
                        {value}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {label}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="reveal reveal-delay-2">
                <Button
                  className="btn-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-primary/35 hover:scale-[1.02] transition-all"
                  onClick={() =>
                    window.open(
                      "https://bancodeprompts-mirante.onrender.com",
                      "_blank",
                    )
                  }
                >
                  <BookOpen className="w-4 h-4" />
                  Acessar Banco de Prompts
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>

            {/* Right: mock preview */}
            <div className="p-8 lg:p-10 flex flex-col justify-center gap-4 border-t md:border-t-0 md:border-l border-border section-alt">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2 reveal">
                Exemplos de prompts
              </p>
              {promptExamples.map((p, i) => (
                <div
                  key={i}
                  className={`reveal reveal-delay-${i + 1} flex items-center gap-4 p-4 rounded-xl border ${p.bg} hover:-translate-y-0.5 transition-all`}
                >
                  <div
                    className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 ${p.iconBg}`}
                  >
                    <BookOpen className={`w-4 h-4 ${p.iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground truncate">
                      {p.title}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-xs font-medium ${p.colorText}`}>
                        {p.category}
                      </span>
                      <span className="text-muted-foreground/40">·</span>
                      <span className="text-xs text-muted-foreground">
                        {p.model}
                      </span>
                    </div>
                  </div>
                  <Copy className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0" />
                </div>
              ))}
              <p className="text-xs text-muted-foreground text-center mt-1 reveal reveal-delay-4">
                e mais de 200 prompts disponíveis...
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
