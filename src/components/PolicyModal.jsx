/**
 * PolicyModal — Política Unificada de Uso de IA do Grupo Mirante
 * Tenta embed via iframe (funciona em Chrome/Edge desktop e Android Chrome).
 * Se o iframe não carregar em 10s ou disparar onError, exibe fallback
 * com link para abrir em nova aba.
 */
import { useEffect, useState } from "react";
import { X, ExternalLink, FileText, Loader2 } from "lucide-react";

const PDF_URL =
  "https://intranet.mirante.com.br/wp-content/uploads/2026/05/Politica-Unificada-de-Uso-de-Inteligencia-Artificial-IA.pdf";

export function PolicyModal({ open, onClose }) {
  const [status, setStatus] = useState("loading"); // loading | ok | blocked

  /* Reset ao abrir */
  useEffect(() => {
    if (open) setStatus("loading");
  }, [open]);

  /* Timeout fallback — 2s é suficiente: se o servidor bloqueou o embed
     (X-Frame-Options / CSP) o browser fica em loading infinito */
  useEffect(() => {
    if (!open || status !== "loading") return;
    const t = setTimeout(() => setStatus("blocked"), 2000);
    return () => clearTimeout(t);
  }, [open, status]);

  /* Trava scroll do body enquanto modal está aberto */
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  /* Close on Escape */
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    if (open) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      {/* Panel */}
      <div
        className="relative w-full max-w-4xl h-[88vh] glass-card rounded-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-border shrink-0">
          <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/25 flex items-center justify-center">
            <FileText className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground text-sm leading-tight truncate">
              Política Unificada de Uso de Inteligência Artificial
            </p>
            <p className="text-[11px] text-muted-foreground">Grupo Mirante · 2026</p>
          </div>
          <a
            href={PDF_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-primary bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            Abrir em nova aba
          </a>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 relative bg-secondary/30">
          {/* Loading state */}
          {status === "loading" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground">Carregando documento…</p>
            </div>
          )}

          {/* Blocked / fallback */}
          {status === "blocked" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <FileText className="w-7 h-7 text-primary" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-foreground">
                  Documento disponível na Intranet
                </p>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                  O PDF está hospedado na intranet corporativa. Acesse pelo link abaixo
                  enquanto estiver conectado à rede Mirante.
                </p>
              </div>
              <a
                href={PDF_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Abrir documento
              </a>
            </div>
          )}

          {/* iframe — Android Chrome consegue carregar, mas pode redirecionar */}
          <iframe
            src={status !== "blocked" ? PDF_URL : ""}
            title="Política de IA Mirante"
            className={`w-full h-full border-0 transition-opacity duration-300 ${
              status === "ok" ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
            onLoad={() => setStatus("ok")}
            onError={() => setStatus("blocked")}
          />
        </div>
      </div>
    </div>
  );
}
