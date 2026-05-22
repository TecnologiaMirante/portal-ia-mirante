import {
  Rocket,
  PenLine,
  BarChart3,
  Repeat2,
  Lightbulb,
  GraduationCap,
} from "lucide-react";
import { TiltCard } from "@/components/effects/TiltCard";

const features = [
  {
    icon: Rocket,
    color: "text-indigo-600 dark:text-indigo-400",
    bg: "bg-indigo-50 border-indigo-100 dark:bg-indigo-500/15 dark:border-indigo-500/25",
    title: "Produtividade acelerada",
    description:
      "Automatize tarefas repetitivas, gere rascunhos em segundos e foque no que realmente importa.",
  },
  {
    icon: PenLine,
    color: "text-rose-600 dark:text-rose-400",
    bg: "bg-rose-50 border-rose-100 dark:bg-rose-500/15 dark:border-rose-500/25",
    title: "Criatividade ampliada",
    description:
      "Supere bloqueios criativos com sugestões inteligentes para textos, imagens, apresentações e vídeos.",
  },
  {
    icon: BarChart3,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 border-emerald-100 dark:bg-emerald-500/15 dark:border-emerald-500/25",
    title: "Análise de dados",
    description:
      "Interprete relatórios, identifique padrões e tome decisões mais rápidas com suporte de IA.",
  },
  {
    icon: Repeat2,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 border-amber-100 dark:bg-amber-500/15 dark:border-amber-500/25",
    title: "Automação inteligente",
    description:
      "Integre IA aos processos da equipe e elimine gargalos operacionais de forma gradual e eficiente.",
  },
  {
    icon: Lightbulb,
    color: "text-cyan-600 dark:text-cyan-400",
    bg: "bg-cyan-50 border-cyan-100 dark:bg-cyan-500/15 dark:border-cyan-500/25",
    title: "Inovação contínua",
    description:
      "Mantenha-se à frente do mercado explorando novas ferramentas e abordagens com suporte estruturado.",
  },
  {
    icon: GraduationCap,
    color: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-50 border-violet-100 dark:bg-violet-500/15 dark:border-violet-500/25",
    title: "Aprendizado prático",
    description:
      "Acesse prompts prontos e curados que ensinam as melhores formas de usar IA no dia a dia.",
  },
];

function FeatureCard({ feature, delay }) {
  return (
    /* Outer reveal wrapper — handles the scroll-in animation */
    <div className={`reveal reveal-delay-${delay}`}>
      {/* TiltCard handles 3D tilt + shine */}
      <TiltCard className="glass-card rounded-2xl p-6 flex flex-col gap-4 h-full">
        <div
          className={`w-11 h-11 rounded-xl border flex items-center justify-center transition-transform duration-200 group-hover:scale-110 ${feature.bg}`}
        >
          <feature.icon className={`w-5 h-5 ${feature.color}`} />
        </div>
        <div>
          <h3 className="font-semibold text-foreground mb-1.5">{feature.title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {feature.description}
          </p>
        </div>
      </TiltCard>
    </div>
  );
}

export function Features() {
  return (
    <section id="recursos" className="py-16 section-alt">
      {/* Top divider */}
      <div className="section-divider mb-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 pt-6">
          <div className="reveal">
            <span className="text-xs font-semibold uppercase tracking-widest text-primary mb-3 block">
              Recursos
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Por que usar IA{" "}
              <span className="gradient-text">na Mirante?</span>
            </h2>
            <p className="text-muted-foreground">
              Inteligência Artificial não substitui pessoas — ela amplifica o potencial
              de quem já sabe o que está fazendo.
            </p>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pb-4">
          {features.map((feature, i) => (
            <FeatureCard key={i} feature={feature} delay={(i % 3) + 1} />
          ))}
        </div>
      </div>

      {/* Bottom divider */}
      <div className="section-divider mt-0" />
    </section>
  );
}
