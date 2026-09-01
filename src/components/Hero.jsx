import {
  ArrowRight,
  BookOpen,
  Newspaper,
  Zap,
  Compass,
  ShieldCheck,
  Trophy,
  Lightbulb,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { NeuralBg } from "@/components/effects/NeuralBg";
import { CountUp } from "@/components/CountUp";
import { LogoMirante } from "@/components/LogoMirante";
import { aiTools } from "@/data/aiTools";

const stats = [
  { value: "200+",                label: "Prompts criados" },
  { value: "100+",                label: "Categorias" },
  { value: `${aiTools.length}+`, label: "Ferramentas de IA" },
  { value: "100%",                label: "Gratuito para a equipe" },
];

const toolPills = [
  "ChatGPT", "Claude", "Gemini", "HeyGen", "ElevenLabs", "Veo",
];

const scrollTo = (id) =>
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

export function Hero({ onOpenPolicy }) {
  return (
    <section
      id="hero"
      className="relative h-screen flex flex-col items-center justify-center overflow-hidden"
    >
      {/* ── Bg layers ───────────────────────────────── */}
      <NeuralBg />
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
          Ferramentas, prompts e recursos de IA desenvolvidos para as equipes da
          Mirante.
        </p>

        {/* CTAs principais */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button
            className="btn-xl text-white hover:scale-[1.02] transition-all shadow-lg hover:shadow-xl"
            style={{
              background: "linear-gradient(135deg, #7c3aed 0%, #635bff 55%, #2563eb 100%)",
              boxShadow: "0 4px 20px rgba(99,91,255,0.35)",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.boxShadow = "0 6px 28px rgba(99,91,255,0.55)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.boxShadow = "0 4px 20px rgba(99,91,255,0.35)")
            }
            onClick={() => scrollTo("noticias-ia")}
          >
            <Newspaper className="w-4 h-4" />
            Notícias de IA
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
          <Button
            className="btn-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] transition-all"
            onClick={() =>
              window.open("https://bancodeprompts-mirante.onrender.com", "_blank")
            }
          >
            <BookOpen className="w-4 h-4" />
            Banco de Prompts
          </Button>
        </div>

        {/* Cards secundários — 2×2 */}
        <div className="grid grid-cols-2 gap-2.5 w-full max-w-2xl">

          {/* Política de IA */}
          <button
            type="button"
            onClick={onOpenPolicy}
            className="group relative text-left flex items-center gap-3 p-3.5 rounded-2xl border border-amber-400/35 bg-amber-400/7 overflow-hidden transition-all duration-300 hover:border-amber-400/60 hover:bg-amber-400/12 hover:shadow-xl hover:shadow-amber-500/10 hover:-translate-y-0.5"
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
              style={{ background: "radial-gradient(ellipse at 0% 50%, oklch(0.80 0.18 80 / 0.08) 0%, transparent 70%)" }} />
            <div className="relative shrink-0">
              <div className="absolute inset-0 rounded-xl bg-amber-400/25 blur-md animate-pulse" />
              <div className="relative w-9 h-9 rounded-xl bg-amber-400/18 border border-amber-400/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <ShieldCheck className="w-4 h-4 text-amber-500 dark:text-amber-400" />
              </div>
            </div>
            <div className="flex-1 text-left min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-[9px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400/80">Obrigatório</span>
                <span className="relative flex h-1.5 w-1.5 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500" />
                </span>
              </div>
              <div className="text-sm font-bold text-foreground group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors leading-tight">
                Política de IA
              </div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-amber-500/40 group-hover:text-amber-500 group-hover:translate-x-1 transition-all duration-200 shrink-0" />
          </button>

          {/* Desafio da Semana */}
          <button
            onClick={() => scrollTo("desafio")}
            className="group relative flex items-center gap-3 p-3.5 rounded-2xl border border-emerald-500/25 bg-emerald-500/6 overflow-hidden transition-all duration-300 hover:border-emerald-500/50 hover:bg-emerald-500/11 hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-0.5"
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
              style={{ background: "radial-gradient(ellipse at 0% 50%, oklch(0.72 0.17 150 / 0.08) 0%, transparent 70%)" }} />
            <div className="w-9 h-9 rounded-xl bg-emerald-500/14 border border-emerald-500/25 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-emerald-500/22 transition-all duration-300">
              <Trophy className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="flex-1 text-left min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="relative flex h-1.5 w-1.5 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                </span>
                <span className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground/70">Toda semana</span>
              </div>
              <div className="text-sm font-semibold text-foreground group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors leading-tight">
                Desafio da Semana
              </div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-emerald-500/40 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all duration-200 shrink-0" />
          </button>

          {/* Prompt do Dia */}
          <button
            onClick={() => scrollTo("desafio")}
            className="group relative flex items-center gap-3 p-3.5 rounded-2xl border border-violet-500/22 bg-violet-500/5 overflow-hidden transition-all duration-300 hover:border-violet-500/45 hover:bg-violet-500/10 hover:shadow-xl hover:shadow-violet-500/10 hover:-translate-y-0.5"
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
              style={{ background: "radial-gradient(ellipse at 0% 50%, oklch(0.60 0.25 290 / 0.08) 0%, transparent 70%)" }} />
            <div className="w-9 h-9 rounded-xl bg-violet-500/12 border border-violet-500/22 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-violet-500/20 transition-all duration-300">
              <Lightbulb className="w-4 h-4 text-violet-500 dark:text-violet-400" />
            </div>
            <div className="flex-1 text-left min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="relative flex h-1.5 w-1.5 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-60" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-violet-500" />
                </span>
                <span className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground/70">Todo dia</span>
              </div>
              <div className="text-sm font-semibold text-foreground group-hover:text-violet-500 dark:group-hover:text-violet-400 transition-colors leading-tight">
                Prompt do Dia
              </div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-violet-500/40 group-hover:text-violet-500 group-hover:translate-x-1 transition-all duration-200 shrink-0" />
          </button>

          {/* Comece em 5 passos */}
          <button
            onClick={() => scrollTo("comecar")}
            className="group relative flex items-center gap-3 p-3.5 rounded-2xl border border-primary/18 bg-primary/5 overflow-hidden transition-all duration-300 hover:border-primary/40 hover:bg-primary/10 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-0.5"
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
              style={{ background: "radial-gradient(ellipse at 0% 50%, oklch(0.55 0.28 264 / 0.08) 0%, transparent 70%)" }} />
            <div className="w-9 h-9 rounded-xl bg-primary/13 border border-primary/20 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-primary/22 transition-all duration-300">
              <Compass className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 text-left min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="relative flex h-1.5 w-1.5 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-60" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary" />
                </span>
                <span className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground/70">Novo por aqui?</span>
              </div>
              <div className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors leading-tight">
                Comece em 5 passos
              </div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-primary/40 group-hover:text-primary group-hover:translate-x-1 transition-all duration-200 shrink-0" />
          </button>

        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 w-full max-w-2xl pt-4 border-t border-border">
          {stats.map((stat, i) => (
            <div key={i} className="flex flex-col items-center gap-0.5">
              <span className="text-xl sm:text-2xl font-bold gradient-text">
                <CountUp value={stat.value} duration={1800} />
              </span>
              <span className="text-[10px] text-muted-foreground leading-tight text-center">
                {stat.label}
              </span>
            </div>
          ))}
        </div>

        {/* Tool pills */}
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

        {/* Scroll indicator */}
        <div className="flex flex-col items-center gap-1 text-muted-foreground/35 mt-1">
          <Zap className="w-3.5 h-3.5 animate-bounce" />
          <span className="text-[10px]">Role para explorar</span>
        </div>
      </div>
    </section>
  );
}
