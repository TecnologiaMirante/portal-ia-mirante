import { ArrowRight, BookOpen, Sparkles, Zap, Compass, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NeuralBg } from "@/components/effects/NeuralBg";
import { CountUp } from "@/components/CountUp";
import { LogoMirante } from "@/components/LogoMirante";

const stats = [
  { value: "200+", label: "Prompts prontos" },
  { value: "100+", label: "Categorias" },
  { value: "10+",  label: "Ferramentas de IA" },
  { value: "100%", label: "Gratuito para a equipe" },
];

const toolPills = ["ChatGPT", "Claude", "Gemini", "HeyGen", "elevenLabs", "Veo"];

export function Hero({ onOpenPolicy }) {
  return (
    <section
      id="hero"
      className="relative h-screen flex flex-col items-center justify-center overflow-hidden"
    >
      {/* ── Bg layers ───────────────────────────────── */}
      <NeuralBg />
      <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 1 }}>
        <div className="hero-blob hero-blob-1" />
        <div className="hero-blob hero-blob-2" />
        <div className="hero-blob hero-blob-3" />
        <div className="hero-blob hero-blob-4" />
        <div className="dot-grid absolute inset-0" />
      </div>

      {/* ── Content ─────────────────────────────────── */}
      <div
        className="select-none relative w-full max-w-4xl mx-auto px-4 sm:px-6 flex flex-col items-center text-center gap-3"
        style={{ zIndex: 2 }}
      >
        {/* Logo */}
        <LogoMirante className="h-16 sm:h-28 w-auto object-contain drop-shadow-sm" />

        {/* Badge */}
        <div className="badge-glow inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/8 text-sm text-primary font-medium shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          Portal de Inteligência Artificial
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.08] tracking-tight max-w-3xl">
          Transforme sua forma de{" "}
          <span className="shimmer-text">trabalhar com IA</span>
        </h1>

        {/* Subtext */}
        <p className="text-base sm:text-lg text-muted-foreground max-w-xl leading-relaxed">
          Ferramentas, prompts e recursos de IA desenvolvidos para as equipes da Mirante.
        </p>

        {/* CTAs principais */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button
            className="btn-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] transition-all"
            onClick={() => document.getElementById("ferramentas")?.scrollIntoView({ behavior: "smooth" })}
          >
            <Sparkles className="w-4 h-4" />
            Explorar Ferramentas
          </Button>
          <Button
            variant="outline"
            className="btn-xl border-border hover:border-primary/40 hover:bg-accent hover:scale-[1.02] transition-all"
            onClick={() => window.open("https://bancodeprompts-mirante.onrender.com", "_blank")}
          >
            <BookOpen className="w-4 h-4" />
            Banco de Prompts
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        {/* Cards secundários — lado a lado */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">

          {/* Política de IA */}
          <div
            onClick={onOpenPolicy}
            className="group cursor-pointer flex items-center gap-3 p-3.5 rounded-2xl border border-amber-400/40 bg-amber-400/8 hover:bg-amber-400/14 hover:border-amber-400/65 transition-all duration-300 hover:shadow-lg hover:shadow-amber-400/10 hover:-translate-y-0.5"
          >
            <div className="relative shrink-0">
              <div className="absolute inset-0 rounded-xl bg-amber-400/30 blur-md animate-pulse" />
              <div className="relative w-9 h-9 rounded-xl bg-amber-400/20 border border-amber-400/35 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-amber-500 dark:text-amber-400" />
              </div>
            </div>
            <div className="flex-1 text-left min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-[9px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">Leitura obrigatória</span>
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500" />
                </span>
              </div>
              <div className="text-sm font-bold text-foreground group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors leading-tight truncate">
                Política de Uso de IA
              </div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-amber-500/50 group-hover:text-amber-500 group-hover:translate-x-1 transition-all shrink-0" />
          </div>

          {/* Por onde começar */}
          <button
            onClick={() => document.getElementById("comecar")?.scrollIntoView({ behavior: "smooth" })}
            className="group flex items-center gap-3 p-3.5 rounded-2xl border border-primary/20 bg-primary/5 hover:bg-primary/10 hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-0.5"
          >
            <div className="w-9 h-9 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center shrink-0 group-hover:bg-primary/25 transition-colors">
              <Compass className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 text-left min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-60" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary" />
                </span>
                <span className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">Novo por aqui?</span>
              </div>
              <div className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors leading-tight truncate">
                Comece em 5 passos simples
              </div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-primary/50 group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
          </button>

        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 w-full max-w-2xl pt-4 border-t border-border">
          {stats.map((stat, i) => (
            <div key={i} className="flex flex-col items-center gap-0.5">
              <span className="text-xl sm:text-2xl font-bold gradient-text">
                <CountUp value={stat.value} duration={1800} />
              </span>
              <span className="text-[10px] text-muted-foreground leading-tight text-center">{stat.label}</span>
            </div>
          ))}
        </div>

        {/* Pills */}
        <div className="flex flex-wrap justify-center gap-1.5">
          {toolPills.map((tool) => (
            <span
              key={tool}
              className="px-2.5 py-0.5 rounded-full text-xs border border-border bg-card text-muted-foreground shadow-sm"
            >
              {tool}
            </span>
          ))}
        </div>

        {/* Scroll indicator — no fluxo, não sobrepõe nada */}
        <div className="flex flex-col items-center gap-1 text-muted-foreground/35 mt-1">
          <Zap className="w-3.5 h-3.5 animate-bounce" />
          <span className="text-[10px]">Role para explorar</span>
        </div>
      </div>
    </section>
  );
}
