/**
 * GettingStarted — "Por onde começar?" interactive onboarding trail
 * Static content — no admin or backend needed.
 */
import { useState } from "react";
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Copy,
  Check,
  Lightbulb,
  ExternalLink,
  Sparkles,
  PartyPopper,
  RotateCcw,
} from "lucide-react";

/* ── Trail steps data ──────────────────────────────────────────── */
const STEPS = [
  {
    id: 1,
    emoji: "👋",
    label: "Primeira conversa",
    title: "Faça sua primeira pergunta",
    tool: "ChatGPT",
    toolColor: "#10a37f",
    description:
      "Abra o ChatGPT e converse normalmente — como se fosse uma mensagem. A IA entende linguagem humana, não precisa de comandos especiais. Quanto mais contexto você der, melhor a resposta.",
    promptLabel: "Tente este prompt",
    prompt:
      "Me dê 5 ideias práticas para [um desafio do seu trabalho]. Sou [seu cargo] na área de [sua área] e preciso de sugestões aplicáveis no dia a dia.",
    tip: "Não ficou bom? Peça para refazer: 'tente de novo, mais direto' ou 'dê exemplos concretos do setor de tecnologia'.",
    url: "https://chatgpt.com",
    ctaLabel: "Abrir ChatGPT",
  },
  {
    id: 2,
    emoji: "✉️",
    label: "E-mail com IA",
    title: "Escreva um e-mail em segundos",
    tool: "ChatGPT",
    toolColor: "#10a37f",
    description:
      "Cole qualquer e-mail que precisa responder e a IA escreve a resposta completa para você. Ou descreva o que precisa comunicar — ela cuida da estrutura, tom e clareza.",
    promptLabel: "Tente este prompt",
    prompt:
      "Escreva um e-mail profissional para [destinatário] sobre [assunto]. Tom: [formal / cordial / direto]. Deve incluir: [pontos principais que precisa comunicar].",
    tip: "Após receber a resposta, experimente: 'reduza para 3 parágrafos' ou 'deixe mais formal e adicione uma abertura cordial'.",
    url: "https://chatgpt.com",
    ctaLabel: "Abrir ChatGPT",
  },
  {
    id: 3,
    emoji: "📄",
    label: "Analise documentos",
    title: "Entenda documentos longos em minutos",
    tool: "Claude",
    toolColor: "#d97706",
    description:
      "Cole um contrato, relatório ou ata inteira. O Claude lê tudo e responde suas perguntas com precisão — destacando riscos, resumindo pontos-chave e explicando termos técnicos sem enrolação.",
    promptLabel: "Tente este prompt",
    prompt:
      "Leia este documento e me diga:\n1) Os 3 pontos mais importantes\n2) Algum risco ou ponto de atenção\n3) Um resumo executivo em 5 linhas\n\n[Cole o documento aqui]",
    tip: "O Claude tem janela de contexto enorme — pode receber contratos, relatórios e atas completos de dezenas de páginas.",
    url: "https://claude.ai",
    ctaLabel: "Abrir Claude",
  },
  {
    id: 4,
    emoji: "🎨",
    label: "Crie apresentações",
    title: "Slides profissionais sem PowerPoint",
    tool: "Gamma",
    toolColor: "#8b5cf6",
    description:
      "Descreva o tema e o Gamma gera uma apresentação completa com design profissional em segundos — sem PowerPoint, sem designer, sem horas de trabalho. Ideal para reuniões, pitches e treinamentos.",
    promptLabel: "Tente este prompt",
    prompt:
      "Crie uma apresentação sobre [tema] com 6 slides: introdução, contexto, desafio, solução proposta, benefícios e próximos passos. Público: [equipe / cliente / diretoria]. Tom: [profissional / dinâmico].",
    tip: "Após gerar, peça mudanças diretamente: 'deixe mais visual com ícones' ou 'adicione um slide de dados e métricas'.",
    url: "https://gamma.app",
    ctaLabel: "Abrir Gamma",
  },
  {
    id: 5,
    emoji: "⚡",
    label: "Banco de Prompts",
    title: "Use prompts prontos da Mirante",
    tool: "Banco de Prompts",
    toolColor: "#635bff",
    description:
      "O Banco de Prompts da Mirante tem centenas de prompts testados e organizados por área — Marketing, RH, TI, Comercial e mais. Não precisa criar do zero: copie, cole e adapte para o seu contexto.",
    promptLabel: "Como usar",
    prompt:
      "1. Abra o Banco de Prompts Mirante\n2. Filtre pela sua área de atuação\n3. Escolha um prompt que faça sentido para você\n4. Copie e cole na IA recomendada\n5. Substitua os [campos] pelos seus dados reais",
    isInstructions: true,
    tip: "Encontrou um prompt muito bom que não está no banco? Fale com o time de IA para adicioná-lo e ajudar os colegas.",
    url: "https://bancodeprompts-mirante.onrender.com",
    ctaLabel: "Abrir Banco de Prompts",
  },
];

/* ═══════════════════════════════════════════════════════════════ */
export function GettingStarted() {
  const [active, setActive] = useState(0);
  const [copied, setCopied] = useState(false);
  const [completed, setCompleted] = useState(new Set());
  const [trailDone, setTrailDone] = useState(false);

  const step = STEPS[active];
  const isLast = active === STEPS.length - 1;

  const goTo = (idx) => {
    setActive(idx);
    setCopied(false);
  };

  const markDone = (idx) => setCompleted((prev) => new Set([...prev, idx]));

  const handleNext = () => {
    markDone(active);
    if (isLast) {
      setTrailDone(true);
      return;
    }
    goTo(active + 1);
  };

  const handlePrev = () => {
    if (active > 0) goTo(active - 1);
  };

  const copyPrompt = async () => {
    await navigator.clipboard.writeText(step.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const reset = () => {
    setActive(0);
    setCopied(false);
    setCompleted(new Set());
    setTrailDone(false);
  };

  return (
    <section id="comecar" className="relative py-20 overflow-hidden">
      {/* bg dot grid */}
      <div className="dot-grid absolute inset-0 pointer-events-none opacity-40" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
        {/* ── Section header ─────────────────────────────── */}
        <div className="text-center mb-12 reveal">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary mb-3 block">
            Trilha para iniciantes
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
            Por onde <span className="gradient-text">começar?</span>
          </h2>
          <p className="mt-3 text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
            5 passos práticos para sair do zero e usar IA no trabalho hoje mesmo
            — sem curso, sem experiência prévia.
          </p>
        </div>

        {/* ── Layout grid ────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-5 items-start reveal reveal-delay-1">
          {/* ── Step list (left / top on mobile) ─────────── */}
          <div className="flex lg:flex-col gap-2 overflow-x-auto pb-1 lg:pb-0 no-scrollbar">
            {STEPS.map((s, i) => {
              const isDone = completed.has(i);
              const isActive = active === i;
              return (
                <button
                  key={s.id}
                  onClick={() => goTo(i)}
                  className={[
                    "flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-left",
                    "border transition-all duration-200 shrink-0 lg:shrink lg:w-full",
                    isActive
                      ? "border-primary/30 bg-primary/8 shadow-sm"
                      : isDone
                        ? "border-emerald-500/25 bg-emerald-500/5 hover:bg-emerald-500/8"
                        : "border-border bg-transparent hover:bg-accent/50",
                  ].join(" ")}
                >
                  {/* circle */}
                  <div
                    className={[
                      "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                      "text-xs font-bold transition-all",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm shadow-primary/30"
                        : isDone
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                          : "bg-muted text-muted-foreground",
                    ].join(" ")}
                  >
                    {isDone && !isActive ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      s.id
                    )}
                  </div>

                  <div className="min-w-0 hidden sm:block">
                    <p
                      className={[
                        "text-xs font-semibold leading-tight truncate",
                        isActive ? "text-foreground" : "text-muted-foreground",
                      ].join(" ")}
                    >
                      {s.label}
                    </p>
                    <p className="text-[10px] text-muted-foreground/50 truncate mt-0.5">
                      {s.tool}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* ── Step content card ─────────────────────────── */}
          {trailDone ? (
            /* ── Completion state ─────────────────────────── */
            <div
              className="glass-card rounded-3xl overflow-hidden"
              style={{ animation: "cardAppear 0.4s ease both" }}
            >
              <div
                className="h-1.5 w-full"
                style={{
                  background:
                    "linear-gradient(90deg, #10a37f, #635bff, #8b5cf6)",
                }}
              />
              <div className="p-8 sm:p-10 flex flex-col items-center text-center gap-5">
                <div className="w-20 h-20 rounded-3xl bg-emerald-500/12 border border-emerald-500/25 flex items-center justify-center">
                  <PartyPopper className="w-9 h-9 text-emerald-500" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-foreground mb-2">
                    Trilha concluída! 🎉
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
                    Você passou pelos 5 passos e já tem o que precisa para usar
                    IA no seu trabalho. Explore as ferramentas abaixo, confira
                    as criações dos colegas e use o Banco de Prompts no dia a
                    dia.
                  </p>
                </div>

                {/* Completed badges */}
                <div className="flex flex-wrap justify-center gap-2">
                  {STEPS.map((s) => (
                    <span
                      key={s.id}
                      className="flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full border"
                      style={{
                        background: `${s.toolColor}12`,
                        borderColor: `${s.toolColor}30`,
                        color: s.toolColor,
                      }}
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      {s.label}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-3 flex-wrap justify-center pt-2">
                  <button
                    onClick={reset}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Refazer trilha
                  </button>
                  <a
                    href="#ferramentas"
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all shadow-sm shadow-primary/20"
                  >
                    <Sparkles className="w-4 h-4" />
                    Explorar ferramentas
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          ) : (
            /* ── Active step card ─────────────────────────── */
            <div
              key={active}
              className="glass-card rounded-3xl overflow-hidden"
              style={{ animation: "cardAppear 0.3s ease both" }}
            >
              {/* tool color accent strip */}
              <div
                className="h-1.5 w-full transition-all duration-500"
                style={{
                  background: `linear-gradient(90deg, ${step.toolColor}, ${step.toolColor}55)`,
                }}
              />

              <div className="p-6 sm:p-8 flex flex-col gap-5">
                {/* ── Step header ──────────────────────────── */}
                <div className="flex items-start gap-4">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0"
                    style={{
                      background: `${step.toolColor}12`,
                      border: `1px solid ${step.toolColor}22`,
                    }}
                  >
                    {step.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <span
                        className="text-[10px] font-bold px-2.5 py-0.5 rounded-full border"
                        style={{
                          background: `${step.toolColor}12`,
                          color: step.toolColor,
                          borderColor: `${step.toolColor}30`,
                        }}
                      >
                        {step.tool}
                      </span>
                      <span className="text-[10px] text-muted-foreground/40">
                        Passo {step.id} de {STEPS.length}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-foreground leading-tight">
                      {step.title}
                    </h3>
                  </div>
                </div>

                {/* ── Description ──────────────────────────── */}
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>

                {/* ── Prompt / instructions box ─────────────── */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-primary" />
                      {step.promptLabel}
                    </span>
                    {!step.isInstructions && (
                      <button
                        onClick={copyPrompt}
                        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border border-border hover:border-primary/30 rounded-lg px-2.5 py-1 transition-all"
                      >
                        {copied ? (
                          <Check className="w-3 h-3 text-emerald-500" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                        {copied ? "Copiado!" : "Copiar"}
                      </button>
                    )}
                  </div>
                  <div
                    className="rounded-xl p-4 text-sm leading-relaxed border whitespace-pre-line font-mono"
                    style={{
                      background: `${step.toolColor}07`,
                      borderColor: `${step.toolColor}20`,
                      color: "var(--foreground)",
                      fontSize: "0.8125rem",
                    }}
                  >
                    {step.prompt}
                  </div>
                </div>

                {/* ── Tip ──────────────────────────────────── */}
                <div className="flex items-start gap-3 px-4 py-3.5 rounded-xl bg-amber-500/8 border border-amber-500/20">
                  <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    <span className="font-semibold text-amber-600 dark:text-amber-400">
                      Dica:{" "}
                    </span>
                    {step.tip}
                  </p>
                </div>

                {/* ── Navigation ───────────────────────────── */}
                <div className="flex items-center justify-between gap-3 pt-1 border-t border-border">
                  <button
                    onClick={handlePrev}
                    disabled={active === 0}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-all disabled:opacity-25 disabled:cursor-not-allowed"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Anterior</span>
                  </button>

                  <div className="flex items-center gap-3">
                    <a
                      href={step.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all hover:brightness-110 hover:scale-[1.02]"
                      style={{
                        background: `${step.toolColor}12`,
                        borderColor: `${step.toolColor}35`,
                        color: step.toolColor,
                      }}
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">{step.ctaLabel}</span>
                      <span className="sm:hidden">Abrir</span>
                    </a>

                    <button
                      onClick={handleNext}
                      className={[
                        "flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm",
                        isLast
                          ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20"
                          : "bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/20",
                      ].join(" ")}
                    >
                      {isLast ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          Concluir
                        </>
                      ) : (
                        <>
                          Próximo
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Progress dots ──────────────────────────────── */}
        {!trailDone && (
          <div className="flex items-center justify-center gap-2 mt-6">
            {STEPS.map((_, i) => (
              <button key={i} onClick={() => goTo(i)} className="p-0.5">
                <div
                  className={[
                    "rounded-full transition-all duration-300",
                    i === active
                      ? "w-6 h-2 bg-primary"
                      : completed.has(i)
                        ? "w-2 h-2 bg-emerald-500/60"
                        : "w-2 h-2 bg-border",
                  ].join(" ")}
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
