/**
 * CasoCTA — chamada permanente para envio de casos reais com IA
 * Semana 3: posicionada após Criações com IA, antes do PromptBankCTA
 */
import { useState } from "react";
import { Lightbulb, ArrowRight, Sparkles } from "lucide-react";
import { CaseSubmitModal } from "@/components/CaseSubmitModal";

export function CasoCTA() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <section className="py-10 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div
            className="reveal glass-card rounded-3xl border border-primary/20 p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6"
            style={{
              background: "linear-gradient(135deg, oklch(0.55 0.28 264 / 0.07), oklch(0.62 0.26 295 / 0.04))",
              boxShadow: "0 0 0 1px oklch(0.55 0.28 264 / 0.12), inset 0 0 60px oklch(0.55 0.28 264 / 0.04)",
            }}
          >
            {/* Ícone */}
            <div className="relative shrink-0">
              <div className="absolute inset-0 rounded-2xl bg-primary/20 blur-xl animate-pulse" />
              <div className="relative w-14 h-14 rounded-2xl bg-primary/12 border border-primary/25 flex items-center justify-center">
                <Lightbulb className="w-7 h-7 text-primary" strokeWidth={1.5} />
              </div>
            </div>

            {/* Texto */}
            <div className="flex-1 text-center sm:text-left">
              <p className="text-[11px] font-bold uppercase tracking-widest text-primary mb-1">
                Compartilhe sua experiência
              </p>
              <h3 className="text-xl font-bold text-foreground mb-1.5">
                Você já usou IA no trabalho?
              </h3>
              <p className="text-sm text-muted-foreground max-w-lg">
                Conte seu caso e inspire os colegas. Não precisa ser perfeito — qualquer experiência com IA conta para o time.
              </p>
            </div>

            {/* CTA */}
            <button
              onClick={() => setOpen(true)}
              className="shrink-0 flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold text-sm text-white hover:opacity-90 hover:scale-[1.02] active:scale-100 transition-all shadow-lg shadow-primary/20"
              style={{
                background: "linear-gradient(135deg, oklch(0.55 0.28 264), oklch(0.60 0.26 295))",
                boxShadow: "0 4px 18px oklch(0.55 0.28 264 / 0.35)",
              }}
            >
              <Sparkles className="w-4 h-4" />
              Envie seu caso
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      <CaseSubmitModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
