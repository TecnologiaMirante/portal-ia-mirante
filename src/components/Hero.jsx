import { useEffect, useState } from "react";
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
  { value: "200+", label: "Prompts criados" },
  { value: "100+", label: "Categorias" },
  { value: `${aiTools.length}+`, label: "Ferramentas de IA" },
  { value: "100%", label: "Gratuito para a equipe" },
];

const toolPills = [
  "ChatGPT",
  "Claude",
  "Gemini",
  "HeyGen",
  "ElevenLabs",
  "Veo",
];

const PHRASES = [
  "trabalhar com IA",
  "criar com IA",
  "inovar com IA",
  "produzir com IA",
];

/* 5 chips por lado — posições espelhadas, sem colisão */
const FLOATING_CHIPS = [
  /* ── Esquerda ── */
  { name: "ChatGPT",    style: { top: "14%",    left: "5%"  }, dur: "3.6s", delay: "0s",   border: "#10b981", color: "#10b981", glow: "rgba(16,185,129,0.22)"  },
  { name: "NotebookLM", style: { top: "29%",    left: "11%" }, dur: "3.8s", delay: "2.5s", border: "#4ade80", color: "#4ade80", glow: "rgba(74,222,128,0.22)"  },
  { name: "Claude",     style: { top: "45%",    left: "5%"  }, dur: "4.2s", delay: "0.9s", border: "#f97316", color: "#f97316", glow: "rgba(249,115,22,0.22)"  },
  { name: "Gemini",     style: { top: "61%",    left: "12%" }, dur: "3.4s", delay: "1.7s", border: "#3b82f6", color: "#60a5fa", glow: "rgba(59,130,246,0.22)"  },
  { name: "Suno",       style: { bottom: "12%", left: "6%"  }, dur: "5.1s", delay: "0.6s", border: "#635bff", color: "#818cf8", glow: "rgba(99,91,255,0.22)"   },

  /* ── Direita (espelhada) ── */
  { name: "AI Studio",  style: { top: "14%",    right: "5%"  }, dur: "4.3s", delay: "2.1s", border: "#06b6d4", color: "#22d3ee", glow: "rgba(6,182,212,0.22)"   },
  { name: "Gamma",      style: { top: "29%",    right: "11%" }, dur: "4.5s", delay: "1.1s", border: "#a855f7", color: "#c084fc", glow: "rgba(168,85,247,0.22)"  },
  { name: "ElevenLabs", style: { top: "45%",    right: "5%"  }, dur: "3.9s", delay: "1.3s", border: "#ec4899", color: "#f472b6", glow: "rgba(236,72,153,0.22)"  },
  { name: "HeyGen",     style: { top: "61%",    right: "12%" }, dur: "4.8s", delay: "0.4s", border: "#8b5cf6", color: "#a78bfa", glow: "rgba(139,92,246,0.22)"  },
  { name: "Veo",        style: { bottom: "12%", right: "6%"  }, dur: "3.7s", delay: "1.9s", border: "#0ea5e9", color: "#38bdf8", glow: "rgba(14,165,233,0.22)"  },
];

const SPARKLES = [
  { left: "6%", dur: "7.2s", delay: "0s", size: "3px" },
  { left: "13%", dur: "9.1s", delay: "1.5s", size: "2px" },
  { left: "21%", dur: "6.4s", delay: "3.2s", size: "4px" },
  { left: "29%", dur: "8.3s", delay: "0.7s", size: "2px" },
  { left: "37%", dur: "7.8s", delay: "2.4s", size: "3px" },
  { left: "44%", dur: "10.5s", delay: "4.1s", size: "2px" },
  { left: "52%", dur: "6.9s", delay: "1.1s", size: "4px" },
  { left: "60%", dur: "8.7s", delay: "3.6s", size: "2px" },
  { left: "67%", dur: "7.3s", delay: "0.4s", size: "3px" },
  { left: "74%", dur: "9.4s", delay: "2.1s", size: "2px" },
  { left: "81%", dur: "6.2s", delay: "4.8s", size: "4px" },
  { left: "88%", dur: "8.1s", delay: "1.3s", size: "3px" },
  { left: "93%", dur: "7.6s", delay: "3.9s", size: "2px" },
  { left: "16%", dur: "11.2s", delay: "5.3s", size: "3px" },
  { left: "76%", dur: "10.1s", delay: "2.9s", size: "2px" },
  { left: "48%", dur: "8.9s", delay: "0.2s", size: "3px" },
  { left: "33%", dur: "6.7s", delay: "6.1s", size: "2px" },
  { left: "56%", dur: "9.8s", delay: "1.8s", size: "4px" },
];

const scrollTo = (id) =>
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

export function Hero({ onOpenPolicy }) {
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [displayed, setDisplayed] = useState(PHRASES[0]);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const full = PHRASES[phraseIdx];
    if (!deleting && displayed === full) {
      const t = setTimeout(() => setDeleting(true), 2200);
      return () => clearTimeout(t);
    }
    if (deleting && displayed === "") {
      setDeleting(false);
      setPhraseIdx((i) => (i + 1) % PHRASES.length);
      return;
    }
    const t = setTimeout(
      () =>
        setDisplayed(
          deleting
            ? full.slice(0, displayed.length - 1)
            : full.slice(0, displayed.length + 1),
        ),
      deleting ? 42 : 82,
    );
    return () => clearTimeout(t);
  }, [displayed, deleting, phraseIdx]);

  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-16"
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

        {/* Radar rings — pulsing from hero center */}
        <div className="hero-ring" style={{ "--ring-delay": "0s" }} />
        <div className="hero-ring" style={{ "--ring-delay": "2s" }} />
        <div className="hero-ring" style={{ "--ring-delay": "4s" }} />

        {/* Sparkle particles rising upward */}
        {SPARKLES.map((sp, i) => (
          <div
            key={i}
            className="hero-sparkle"
            style={{
              left: sp.left,
              "--sp-dur": sp.dur,
              "--sp-delay": sp.delay,
              "--sp-size": sp.size,
            }}
          />
        ))}

        {/* Floating AI tool chips — visible on large screens only */}
        <div className="hidden xl:block">
          {FLOATING_CHIPS.map((chip) => (
            <div
              key={chip.name}
              className="hero-float-chip absolute px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm select-none"
              style={{
                ...chip.style,
                "--chip-dur": chip.dur,
                "--chip-delay": chip.delay,
                border: `1px solid ${chip.border}55`,
                color: chip.color,
                background: "oklch(0.07 0.02 264 / 0.55)",
                boxShadow: `0 0 14px ${chip.glow}, inset 0 0 8px ${chip.glow}`,
              }}
            >
              {chip.name}
            </div>
          ))}
        </div>
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
          <span className="block">Transforme sua forma de</span>
          <span className="shimmer-text">
            {displayed}
            <span className="typewriter-cursor" aria-hidden="true" />
          </span>
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
              background:
                "linear-gradient(135deg, #7c3aed 0%, #635bff 55%, #2563eb 100%)",
              boxShadow: "0 4px 20px rgba(99,91,255,0.35)",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.boxShadow =
                "0 6px 28px rgba(99,91,255,0.55)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.boxShadow =
                "0 4px 20px rgba(99,91,255,0.35)")
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
              window.open(
                "https://bancodeprompts-mirante.onrender.com",
                "_blank",
              )
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
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse at 0% 50%, oklch(0.80 0.18 80 / 0.08) 0%, transparent 70%)",
              }}
            />
            <div className="relative shrink-0">
              <div className="absolute inset-0 rounded-xl bg-amber-400/25 blur-md animate-pulse" />
              <div className="relative w-9 h-9 rounded-xl bg-amber-400/18 border border-amber-400/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <ShieldCheck className="w-4 h-4 text-amber-500 dark:text-amber-400" />
              </div>
            </div>
            <div className="flex-1 text-left min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-[9px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400/80">
                  Obrigatório
                </span>
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
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse at 0% 50%, oklch(0.72 0.17 150 / 0.08) 0%, transparent 70%)",
              }}
            />
            <div className="w-9 h-9 rounded-xl bg-emerald-500/14 border border-emerald-500/25 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-emerald-500/22 transition-all duration-300">
              <Trophy className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="flex-1 text-left min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="relative flex h-1.5 w-1.5 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                </span>
                <span className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground/70">
                  Toda semana
                </span>
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
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse at 0% 50%, oklch(0.60 0.25 290 / 0.08) 0%, transparent 70%)",
              }}
            />
            <div className="w-9 h-9 rounded-xl bg-violet-500/12 border border-violet-500/22 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-violet-500/20 transition-all duration-300">
              <Lightbulb className="w-4 h-4 text-violet-500 dark:text-violet-400" />
            </div>
            <div className="flex-1 text-left min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="relative flex h-1.5 w-1.5 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-60" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-violet-500" />
                </span>
                <span className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground/70">
                  Todo dia
                </span>
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
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse at 0% 50%, oklch(0.55 0.28 264 / 0.08) 0%, transparent 70%)",
              }}
            />
            <div className="w-9 h-9 rounded-xl bg-primary/13 border border-primary/20 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-primary/22 transition-all duration-300">
              <Compass className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 text-left min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="relative flex h-1.5 w-1.5 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-60" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary" />
                </span>
                <span className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground/70">
                  Novo por aqui?
                </span>
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
