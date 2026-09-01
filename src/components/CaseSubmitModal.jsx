/**
 * CaseSubmitModal — formulário público para envio de casos reais com IA
 * Semana 3: envia via EmailJS para team@mirante.com.br, sem login.
 */
import { useState, useEffect } from "react";
import emailjs from "@emailjs/browser";
import { X, Send, Loader2, CheckCircle2, Sparkles } from "lucide-react";

const EMAILJS_SERVICE  = import.meta.env.VITE_EMAILJS_SERVICE_ID  || "";
const EMAILJS_TEMPLATE = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || "";
const EMAILJS_KEY      = import.meta.env.VITE_EMAILJS_PUBLIC_KEY  || "";
const SHEETS_URL       = import.meta.env.VITE_SHEETS_WEBHOOK_URL   || "";

const AREAS = [
  "Marketing", "Comercial", "RH", "Financeiro",
  "TI", "Administrativo", "Jornalismo", "Outra",
];

const AI_TOOLS = [
  "ChatGPT", "Claude", "Gemini", "HeyGen", "ElevenLabs",
  "Veo", "Gamma", "Canva IA", "Copilot", "Outra",
];

export function CaseSubmitModal({ open, onClose, prefilledTool = "" }) {
  const [form, setForm] = useState({
    name: "", area: "", problem: "", tool: prefilledTool, result: "", timeSaved: "",
  });
  const [status, setStatus] = useState("idle");

  /* Sincroniza ferramenta pré-preenchida quando o modal reabre */
  useEffect(() => {
    if (open) {
      setForm((f) => ({ ...f, tool: prefilledTool }));
      setStatus("idle");
    }
  }, [open, prefilledTool]);

  /* Bloqueia scroll do body enquanto aberto */
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  /* Fecha com Escape */
  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [open, onClose]);

  if (!open) return null;

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const reset = () => {
    setForm({ name: "", area: "", problem: "", tool: prefilledTool, result: "", timeSaved: "" });
    setStatus("idle");
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.area || !form.problem || !form.tool || !form.result) return;
    setStatus("sending");

    const payload = {
      subject:         "Novo caso de uso com IA — Portal Mirante",
      form_type:       "Caso de Uso com IA",
      sender_name:     form.name || "Anônimo",
      sender_area:     form.area,
      challenge_title: "—",
      problem:         form.problem,
      tool_used:       form.tool,
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
      await new Promise((r) => setTimeout(r, 700));
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

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-card border border-border rounded-3xl shadow-2xl animate-in zoom-in-95 fade-in duration-200 overflow-y-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Faixa de cor topo */}
        <div
          className="h-[3px] w-full shrink-0"
          style={{ background: "linear-gradient(90deg, oklch(0.55 0.28 264), oklch(0.62 0.26 295), transparent)" }}
        />

        <div className="p-6 flex flex-col gap-5">
          {status === "ok" ? (
            /* ── Sucesso ── */
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/12 border border-emerald-500/25 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" strokeWidth={1.5} />
              </div>
              <div>
                <p className="font-bold text-foreground text-lg">Caso enviado!</p>
                <p className="text-sm text-muted-foreground mt-1.5 max-w-xs mx-auto">
                  Obrigado por compartilhar. Que tal inspirar outros colegas?
                </p>
              </div>
              <div className="flex gap-3 flex-wrap justify-center">
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`Usei IA no trabalho com ${form.tool} e economizei ${form.timeSaved || "tempo"}\n\nCompartilhei no Portal IA Mirante — acesse e envie o seu também!`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#25D366] text-white text-sm font-semibold hover:bg-[#1ebe5d] transition-colors"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.122 1.532 5.859L.053 23.928l6.273-1.641A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.795 9.795 0 01-5.031-1.388l-.361-.214-3.724.976.993-3.63-.235-.374A9.795 9.795 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z"/></svg>
                  Compartilhar no WhatsApp
                </a>
                <button
                  onClick={reset}
                  className="px-4 py-2 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                >
                  Enviar outro
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          ) : (
            /* ── Formulário ── */
            <>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-primary/12 border border-primary/20 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4 text-primary" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">Envie seu caso de uso</h3>
                    <p className="text-[11px] text-muted-foreground/60">Sem login · menos de 2 minutos</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:bg-accent transition-colors shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-sm text-muted-foreground -mt-2">
                Conte como você usou IA no trabalho. Seu relato pode virar inspiração para toda a equipe!
              </p>

              <form onSubmit={submit} className="flex flex-col gap-4">
                {/* Nome */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    Nome <span className="opacity-50">(opcional)</span>
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    placeholder="Seu nome ou apelido"
                    className="h-10 px-3 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                  />
                </div>

                {/* Área + Ferramenta */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-muted-foreground">
                      Área <span className="text-destructive">*</span>
                    </label>
                    <select
                      required
                      value={form.area}
                      onChange={(e) => set("area", e.target.value)}
                      className="h-10 px-3 rounded-xl border border-border bg-background text-sm text-foreground outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                    >
                      <option value="">Selecione...</option>
                      {AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-muted-foreground">
                      Ferramenta usada <span className="text-destructive">*</span>
                    </label>
                    <select
                      required
                      value={form.tool}
                      onChange={(e) => set("tool", e.target.value)}
                      className="h-10 px-3 rounded-xl border border-border bg-background text-sm text-foreground outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                    >
                      <option value="">Selecione...</option>
                      {AI_TOOLS.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>

                {/* Problema */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    O que você precisava fazer? <span className="text-destructive">*</span>
                  </label>
                  <textarea
                    required
                    value={form.problem}
                    onChange={(e) => set("problem", e.target.value)}
                    placeholder="Ex: Criar um relatório semanal de 10 páginas em pouco tempo..."
                    rows={2}
                    className="px-3 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all resize-none"
                  />
                </div>

                {/* Resultado */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    O que aconteceu? Qual foi o resultado? <span className="text-destructive">*</span>
                  </label>
                  <textarea
                    required
                    value={form.result}
                    onChange={(e) => set("result", e.target.value)}
                    placeholder="Ex: Gerei o relatório em 20 minutos e o cliente adorou a organização..."
                    rows={2}
                    className="px-3 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all resize-none"
                  />
                </div>

                {/* Tempo economizado */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    Tempo economizado <span className="opacity-50">(opcional)</span>
                  </label>
                  <input
                    type="text"
                    value={form.timeSaved}
                    onChange={(e) => set("timeSaved", e.target.value)}
                    placeholder="ex: 1 hora e meia, 45 minutos..."
                    className="h-10 px-3 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
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
                    : <><Send className="w-4 h-4" /> Enviar meu caso</>}
                </button>

                <p className="text-[11px] text-muted-foreground/40 text-center">
                  Sem cadastro · suas informações vão direto para o time Mirante
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
