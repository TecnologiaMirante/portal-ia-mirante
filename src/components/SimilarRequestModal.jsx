/**
 * SimilarRequestModal — pedido de ajuda para criar algo parecido com uma criação existente.
 * Disparado pelo botão "Quero fazer algo parecido" no MediaModal de AICreations.
 */
import { useState, useEffect } from "react";
import emailjs from "@emailjs/browser";
import { X, Send, Loader2, CheckCircle2, Sparkles } from "lucide-react";
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

const AI_TOOLS = [
  "ChatGPT", "Claude", "Gemini", "HeyGen", "ElevenLabs",
  "Veo", "Gamma", "Canva IA", "Copilot", "Outra",
];

export function SimilarRequestModal({ open, onClose, referenceTitle = "", prefilledTool = "" }) {
  const [form, setForm] = useState({
    name: "", area: "", whatToCreate: "", tool: prefilledTool, context: "",
  });
  const [status, setStatus] = useState("idle");

  useEffect(() => {
    if (open) {
      setForm((f) => ({ ...f, tool: prefilledTool, whatToCreate: "" }));
      setStatus("idle");
    }
  }, [open, prefilledTool]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [open, onClose]);

  if (!open) return null;

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.area || !form.whatToCreate) return;
    setStatus("sending");

    const payload = {
      subject:         `Pedido de criação com IA — Portal Mirante`,
      form_type:       "Pedido de Criação Similar",
      sender_name:     form.name || "Anônimo",
      sender_area:     form.area,
      challenge_title: referenceTitle || "—",
      problem:         form.whatToCreate,
      tool_used:       form.tool || "Não definida",
      result:          form.context || "Sem contexto adicional",
      time_saved:      "—",
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
        <div
          className="h-[3px] w-full shrink-0"
          style={{ background: "linear-gradient(90deg, oklch(0.55 0.28 264), oklch(0.62 0.26 295), transparent)" }}
        />

        <div className="p-6 flex flex-col gap-5">
          {status === "ok" ? (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/12 border border-emerald-500/25 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" strokeWidth={1.5} />
              </div>
              <div>
                <p className="font-bold text-foreground text-lg">Pedido enviado!</p>
                <p className="text-sm text-muted-foreground mt-1.5 max-w-xs mx-auto">
                  O time Mirante recebeu sua solicitação e vai entrar em contato em breve.
                </p>
              </div>
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
              >
                Fechar
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-primary/12 border border-primary/20 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4 text-primary" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">Quero fazer algo parecido</h3>
                    <p className="text-[11px] text-muted-foreground/60">O time Mirante vai te ajudar</p>
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

              {referenceTitle && (
                <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-primary/6 border border-primary/15 text-xs text-muted-foreground">
                  <Sparkles className="w-3.5 h-3.5 text-primary/60 shrink-0 mt-0.5" />
                  <span>Inspirado em: <span className="font-semibold text-foreground">{referenceTitle}</span></span>
                </div>
              )}

              <p className="text-sm text-muted-foreground -mt-1">
                Conta o que você precisa criar e o time vai orientar você com ferramentas, prompts e dicas.
              </p>

              <form onSubmit={submit} className="flex flex-col gap-4">
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

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-muted-foreground">
                      Área <span className="text-destructive">*</span>
                    </label>
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

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-muted-foreground">
                      Ferramenta preferida <span className="opacity-50">(opcional)</span>
                    </label>
                    <Select value={form.tool} onValueChange={(v) => set("tool", v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent className="z-[200]">
                        {AI_TOOLS.map((t) => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    O que você precisa criar? <span className="text-destructive">*</span>
                  </label>
                  <textarea
                    required
                    value={form.whatToCreate}
                    onChange={(e) => set("whatToCreate", e.target.value)}
                    placeholder="Ex: Um vídeo de apresentação do nosso produto com narração em IA..."
                    rows={3}
                    className="px-3 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all resize-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    Contexto adicional <span className="opacity-50">(opcional)</span>
                  </label>
                  <input
                    type="text"
                    value={form.context}
                    onChange={(e) => set("context", e.target.value)}
                    placeholder="ex: preciso para apresentação na sexta, é para cliente externo..."
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
                    : <><Send className="w-4 h-4" /> Enviar pedido</>}
                </button>

                <p className="text-[11px] text-muted-foreground/40 text-center">
                  Sem cadastro · o time Mirante recebe e orienta você
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
