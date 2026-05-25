import { ArrowRight, BookOpen, Sparkles, Zap, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NeuralBg } from "@/components/effects/NeuralBg";
import { CountUp } from "@/components/CountUp";
import { LogoMirante } from "@/components/LogoMirante";

const stats = [
  { value: "200+", label: "Prompts prontos" },
  { value: "100+", label: "Categorias" },
  { value: "10+", label: "Ferramentas de IA" },
  { value: "100%", label: "Gratuito para a equipe" },
];

const toolPills = [
  "ChatGPT",
  "Claude",
  "Gemini",
  "HeyGen",
  "elevenLabs",
  "Veo",
];

export function Hero() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden "
    >
      {/* ── Layer 0: Neural canvas (bottom-most) ─── */}
      <NeuralBg />

      {/* ── Layer 1: Gradient blobs ──────────────── */}
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        style={{ zIndex: 1 }}
      >
        <div className="hero-blob hero-blob-1" />
        <div className="hero-blob hero-blob-2" />
        <div className="hero-blob hero-blob-3" />
        <div className="hero-blob hero-blob-4" />
        <div className="dot-grid absolute inset-0" />
      </div>

      {/* ── Layer 2: Content ─────────────────────── */}
      <div
        className="select-none relative max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col items-center text-center gap-3"
        style={{ zIndex: 2 }}
      >
        {/* Logo em destaque */}
        <LogoMirante className="h-20 sm:h-48 w-auto object-contain drop-shadow-sm" />

        {/* Badge */}
        <div className="badge-glow inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/8 text-sm text-primary font-medium shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          Portal de Inteligência Artificial
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold leading-[1.08] tracking-tight max-w-4xl">
          Transforme sua forma de{" "}
          <span className="shimmer-text">trabalhar com IA</span>
          <br />
        </h1>

        {/* Subtext */}
        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl leading-relaxed">
          Acesse ferramentas, prompts prontos e recursos de Inteligência
          Artificial desenvolvidos especialmente para as equipes da Mirante.
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button
            className="btn-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] transition-all"
            onClick={() =>
              document
                .getElementById("ferramentas")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            <Sparkles className="w-4 h-4" />
            Explorar Ferramentas
          </Button>
          <Button
            variant="outline"
            className="btn-xl border-border hover:border-primary/40 hover:bg-accent hover:scale-[1.02] transition-all"
            onClick={() =>
              window.open(
                "https://bancodeprompts-mirante.onrender.com",
                "_blank",
              )
            }
          >
            <BookOpen className="w-4 h-4" />
            Banco de Prompts
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        {/* CTA — Por onde começar */}
        <button
          onClick={() =>
            document.getElementById("comecar")?.scrollIntoView({ behavior: "smooth" })
          }
          className="group relative flex items-center gap-3 px-5 py-3 rounded-2xl border border-primary/20 bg-primary/5 hover:bg-primary/10 hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10"
        >
          {/* Ícone */}
          <div className="w-8 h-8 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center shrink-0 group-hover:bg-primary/25 transition-colors">
            <Compass className="w-4 h-4 text-primary" />
          </div>

          {/* Texto */}
          <div className="text-left">
            <div className="flex items-center gap-1.5">
              {/* Pulsing dot */}
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-60" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary" />
              </span>
              <span className="text-xs text-muted-foreground">Novo por aqui?</span>
            </div>
            <div className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors leading-tight">
              Comece em 5 passos simples
            </div>
          </div>

          {/* Seta */}
          <ArrowRight className="w-4 h-4 text-primary/50 group-hover:text-primary group-hover:translate-x-1 transition-all ml-1 shrink-0" />
        </button>

        {/* Stats — animated CountUp */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-6 w-full max-w-2xl pt-6 border-t border-border">
          {stats.map((stat, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <span className="text-2xl sm:text-3xl font-bold gradient-text">
                <CountUp value={stat.value} duration={1800} />
              </span>
              <span className="text-xs text-muted-foreground">
                {stat.label}
              </span>
            </div>
          ))}
        </div>

        {/* Floating pills */}
        <div className="flex flex-wrap justify-center gap-2 max-w-lg">
          {toolPills.map((tool, i) => (
            <span
              key={tool}
              className="px-3 py-1 rounded-full text-xs border border-border bg-card text-muted-foreground shadow-sm"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              {tool}
            </span>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-muted-foreground/40"
        style={{ zIndex: 2 }}
      >
        <Zap className="w-4 h-4 animate-bounce" />
        <span className="text-xs">Role para explorar</span>
      </div>
    </section>
  );
}
