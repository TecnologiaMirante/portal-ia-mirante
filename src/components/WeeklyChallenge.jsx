/**
 * WeeklyChallenge — "Desafio IA da Semana"
 * Lê public/challenges.json, exibe o desafio da semana atual
 * e envia o resultado via EmailJS (configura via variáveis de ambiente).
 */
import { useState } from "react";
import emailjs from "@emailjs/browser";
import {
  Trophy,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Send,
  Zap,
  Clock,
  Lightbulb,
  X,
  Loader2,
} from "lucide-react";
import { useChallenge } from "@/hooks/useChallenge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const EMAILJS_SERVICE  = import.meta.env.VITE_EMAILJS_SERVICE_ID  || "";
const EMAILJS_TEMPLATE = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || "";
const EMAILJS_KEY      = import.meta.env.VITE_EMAILJS_PUBLIC_KEY  || "";
const SHEETS_URL       = import.meta.env.VITE_SHEETS_WEBHOOK_URL   || "";

const AREAS = [
  "Marketing", "Comercial", "RH", "Financeiro",
  "TI", "Administrativo", "Jornalismo", "Outra",
];

const DIFFICULTY_COLOR = {
  Fácil:  { bg: "bg-emerald-500/12 border-emerald-500/25 text-emerald-600 dark:text-emerald-400" },
  Médio:  { bg: "bg-amber-500/12 border-amber-500/25 text-amber-600 dark:text-amber-400" },
  Difícil:{ bg: "bg-rose-500/12 border-rose-500/25 text-rose-600 dark:text-rose-400" },
};

/* ── CopyBtn ─────────────────────────────────────────────── */
function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(text); }
    catch { /* fallback */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={copy}
      className={[
        "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-200 shrink-0",
        copied
          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
          : "bg-primary/8 border-primary/25 text-primary hover:bg-primary/15",
      ].join(" ")}
    >
      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
      {copied ? "Copiado!" : "Copiar prompt"}
    </button>
  );
}

/* ── ParticipationForm ───────────────────────────────────── */
function ParticipationForm({ challengeTitle, onClose }) {
  const [form, setForm] = useState({ name: "", area: "", result: "", timeSaved: "" });
  const [status, setStatus] = useState("idle"); // idle | sending | ok | error

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.area || !form.result) return;

    setStatus("sending");

    const payload = {
      subject:         `Resultado do Desafio — ${challengeTitle}`,
      form_type:       "Resultado de Desafio",
      sender_name:     form.name || "Anônimo",
      sender_area:     form.area,
      challenge_title: challengeTitle,
      problem:         "—",
      tool_used:       "—",
      result:          form.result,
      time_saved:      form.timeSaved || "Não informado",
    };

    const canSend = EMAILJS_SERVICE && EMAILJS_TEMPLATE && EMAILJS_KEY;

    if (canSend) {
      try {
        await emailjs.send(EMAILJS_SERVICE, EMAILJS_TEMPLATE, payload, EMAILJS_KEY);
        setStatus("ok");
      } catch {
        setStatus("error");
        return;
      }
    } else {
      await new Promise((r) => setTimeout(r, 600));
      setStatus("ok");
    }

    if (SHEETS_URL) {
      fetch(SHEETS_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify(payload),
      }).catch(() => {});
    }
  };

  if (status === "ok") {
    const waText = encodeURIComponent(
      `Completei o Desafio IA da semana: "${challengeTitle}"\n\nAcesse o Portal IA Mirante (portalia-mirante.onrender.com) e participe você também!`
    );
    return (
      <div className="flex flex-col items-center gap-4 py-6 text-center">
        <div className="w-14 h-14 rounded-full bg-emerald-500/12 border border-emerald-500/25 flex items-center justify-center">
          <Trophy className="w-7 h-7 text-emerald-500" strokeWidth={1.5} />
        </div>
        <div>
          <p className="font-bold text-foreground">Resultado enviado!</p>
          <p className="text-sm text-muted-foreground mt-1">
            Obrigado por participar. Que tal compartilhar com o time?
          </p>
        </div>
        <div className="flex gap-3 flex-wrap justify-center">
          <a
            href={`https://wa.me/?text=${waText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#25D366] text-white text-sm font-semibold hover:bg-[#1ebe5d] transition-colors"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.122 1.532 5.859L.053 23.928l6.273-1.641A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.795 9.795 0 01-5.031-1.388l-.361-.214-3.724.976.993-3.63-.235-.374A9.795 9.795 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z"/></svg>
            Compartilhar no WhatsApp
          </a>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-foreground">Enviar meu resultado</h3>
        <button type="button" onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:bg-accent transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      <p className="text-sm text-muted-foreground">
        Conta o que você fez com o desafio desta semana. Não precisa ser perfeito — qualquer resultado vale!
      </p>

      {/* Nome (opcional) */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-muted-foreground">Nome <span className="opacity-50">(opcional)</span></label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          placeholder="Seu nome ou apelido"
          className="h-10 px-3 rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
        />
      </div>

      {/* Área */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-muted-foreground">Sua área <span className="text-destructive">*</span></label>
        <Select value={form.area} onValueChange={(v) => set("area", v)}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione..." />
          </SelectTrigger>
          <SelectContent className="z-[200]">
            {AREAS.map((a) => (
              <SelectItem key={a} value={a}>{a}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Resultado */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-muted-foreground">O que você fez / qual foi o resultado? <span className="text-destructive">*</span></label>
        <textarea
          required
          value={form.result}
          onChange={(e) => set("result", e.target.value)}
          placeholder="Descreva brevemente o que você tentou e o resultado..."
          rows={3}
          className="px-3 py-2.5 rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all resize-none"
        />
      </div>

      {/* Tempo economizado */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-muted-foreground">Tempo economizado <span className="opacity-50">(opcional)</span></label>
        <input
          type="text"
          value={form.timeSaved}
          onChange={(e) => set("timeSaved", e.target.value)}
          placeholder="ex: 45 minutos, 1 hora..."
          className="h-10 px-3 rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
        />
      </div>

      {status === "error" && (
        <p className="text-xs text-destructive bg-destructive/8 rounded-lg px-3 py-2">
          Ocorreu um erro ao enviar. Tente novamente.
        </p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="flex items-center justify-center gap-2 h-11 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 disabled:opacity-50 transition-all"
      >
        {status === "sending"
          ? <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</>
          : <><Send className="w-4 h-4" /> Enviar resultado</>}
      </button>
    </form>
  );
}

/* ── WeeklyChallenge ─────────────────────────────────────── */
export function WeeklyChallenge() {
  const { challenge, loading } = useChallenge();
  const [showTips, setShowTips]   = useState(false);
  const [showForm, setShowForm]   = useState(false);

  if (loading) {
    return <div className="rounded-3xl border border-border bg-card/40 animate-pulse h-56" />;
  }

  if (!challenge) return null;

  const diffStyle = DIFFICULTY_COLOR[challenge.difficulty] ?? DIFFICULTY_COLOR["Fácil"];

  return (
    <>
      <div className="flex flex-col gap-4">
        {/* Header compacto */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-primary/12 border border-primary/20 flex items-center justify-center shrink-0">
            <Trophy className="w-4 h-4 text-primary" strokeWidth={1.5} />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-primary block">
              Desafio da Semana
            </span>
            <p className="text-[11px] text-muted-foreground/60">
              Novo toda segunda-feira — use o prompt e compartilhe seu resultado
            </p>
          </div>
        </div>

        {/* Card principal */}
        <div className="reveal glass-card rounded-3xl overflow-hidden border border-border">
            {/* Topo colorido */}
            <div
              className="h-1 w-full"
              style={{
                background: `linear-gradient(90deg, ${challenge.toolColor}, ${challenge.toolColor}88, transparent)`,
              }}
            />

            <div className="p-6 sm:p-8 grid md:grid-cols-[1fr_auto] gap-6 md:gap-10">
              {/* Lado esquerdo */}
              <div className="flex flex-col gap-5">
                {/* Badges */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${diffStyle.bg}`}>
                    {challenge.difficulty}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Clock className="w-3 h-3" /> {challenge.estimatedTime}
                  </span>
                  <span
                    className="text-[11px] font-semibold px-2.5 py-1 rounded-full border"
                    style={{
                      background: `${challenge.toolColor}15`,
                      borderColor: `${challenge.toolColor}35`,
                      color: challenge.toolColor,
                    }}
                  >
                    {challenge.tool}
                  </span>
                </div>

                {/* Título */}
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-1">
                    {challenge.title}
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {challenge.description}
                  </p>
                </div>

                {/* Prompt */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      Prompt pronto para usar
                    </span>
                    <CopyBtn text={challenge.prompt} />
                  </div>
                  <pre className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap font-mono bg-muted/30 rounded-xl p-4 border border-border/50 max-h-40 overflow-y-auto">
                    {challenge.prompt}
                  </pre>
                </div>

                {/* Dicas */}
                {challenge.tips?.length > 0 && (
                  <div>
                    <button
                      type="button"
                      onClick={() => setShowTips((v) => !v)}
                      className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                      Dicas para ir além
                      {showTips
                        ? <ChevronUp className="w-3.5 h-3.5" />
                        : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                    {showTips && (
                      <ul className="mt-3 flex flex-col gap-1.5 animate-in slide-in-from-top-1 fade-in duration-150">
                        {challenge.tips.map((tip, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                            <span className="w-4 h-4 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                              {i + 1}
                            </span>
                            {tip}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>

              {/* Lado direito — CTA */}
              <div className="flex flex-col items-center justify-center gap-4 md:min-w-[200px] md:border-l md:border-border md:pl-10">
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center border text-4xl"
                  style={{
                    background: `${challenge.toolColor}12`,
                    borderColor: `${challenge.toolColor}30`,
                  }}
                >
                  <Zap
                    className="w-9 h-9"
                    style={{ color: challenge.toolColor }}
                    strokeWidth={1.5}
                  />
                </div>

                <div className="text-center">
                  <p className="text-xs font-semibold text-foreground">Participar é simples</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Use o prompt, veja o resultado e compartilhe com a gente
                  </p>
                </div>

                <button
                  onClick={() => setShowForm(true)}
                  className="w-full flex items-center justify-center gap-2 h-11 rounded-xl font-semibold text-sm text-white transition-all hover:opacity-90 hover:scale-[1.02]"
                  style={{ background: `linear-gradient(135deg, ${challenge.toolColor}, ${challenge.toolColor}cc)` }}
                >
                  <Send className="w-4 h-4" />
                  Enviar meu resultado
                </button>

                <p className="text-[10px] text-muted-foreground/50 text-center">
                  Sem cadastro, sem login. Só boa vontade.
                </p>
              </div>
            </div>
          </div>
        </div>

      {/* Modal do formulário */}
      {showForm && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center p-4 animate-in fade-in duration-200"
          style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)" }}
          onClick={() => setShowForm(false)}
        >
          <div
            className="relative w-full max-w-md bg-card border border-border rounded-3xl shadow-2xl p-6 animate-in zoom-in-95 fade-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <ParticipationForm
              challengeTitle={challenge.title}
              onClose={() => setShowForm(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}
