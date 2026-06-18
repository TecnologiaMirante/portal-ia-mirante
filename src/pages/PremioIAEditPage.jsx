/**
 * PremioIAEditPage — /premio-ia/editar/:id?token=TOKEN
 * Carrega a inscrição existente, valida o token e re-usa InscricaoSection em modo edição.
 */
import { useEffect, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@infra/firebase";
import {
  Loader2, AlertCircle, Trophy, ArrowLeft, Sun, Moon,
} from "lucide-react"; // Trophy usado no navbar
import { useTheme }    from "@/hooks/useTheme";
import { LogoMirante } from "@/components/LogoMirante";
import { InscricaoSectionExport } from "@/pages/PremioIAPage";

/* Ativa animações .reveal sem ScrollSpy — re-executa quando `trigger` muda */
function RevealAll({ trigger }) {
  useEffect(() => {
    const run = () =>
      document.querySelectorAll(".reveal:not(.visible)").forEach((el) =>
        el.classList.add("visible")
      );
    run();
    // Aguarda o React pintar o DOM antes de tentar de novo
    const t1 = setTimeout(run, 50);
    const t2 = setTimeout(run, 300);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [trigger]);
  return null;
}

/* ── Mini Navbar ──────────────────────────────────────────── */
function EditNavbar() {
  const { dark, toggle } = useTheme();
  return (
    <header className="fixed top-0 left-0 right-0 z-50 navbar-solid border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          <Link
            to="/premio-ia"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <LogoMirante className="h-7 w-auto object-contain" />
            <span className="font-semibold text-foreground">
              Mirante <span className="gradient-text font-bold">IA</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-amber-500 dark:text-amber-400">
              <Trophy className="w-3.5 h-3.5" />
              Editar Inscrição
            </span>
            <button
              onClick={toggle}
              aria-label={dark ? "Modo claro" : "Modo escuro"}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent border border-transparent hover:border-border transition-colors"
            >
              {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

/* ═══════════════════════════════════════════════════════════
   PremioIAEditPage
   ═══════════════════════════════════════════════════════════ */
export function PremioIAEditPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const validParams = Boolean(id && token);

  const [loading,  setLoading]  = useState(validParams);
  const [docData,  setDocData]  = useState(null);
  const [fetchErr, setFetchErr] = useState(null);

  // Derived error: invalid URL params OR async fetch error
  const error = !validParams
    ? "Link inválido. Verifique o link enviado por e-mail."
    : fetchErr;

  useEffect(() => {
    if (!validParams) return;

    getDoc(doc(db, "premioInscricoes", id))
      .then((snap) => {
        if (!snap.exists()) {
          setFetchErr("Inscrição não encontrada.");
          return;
        }
        const data = snap.data();
        if (data.editToken !== token) {
          setFetchErr("Token de edição inválido. Verifique o link enviado por e-mail.");
          return;
        }
        if (data.status === "aprovado" || data.status === "rejeitado") {
          setFetchErr("Esta inscrição já foi avaliada e não pode ser editada.");
          return;
        }
        setDocData({ id: snap.id, ...data });
      })
      .catch((e) => setFetchErr(e.message))
      .finally(() => setLoading(false));
  }, [id, token, validParams]);

  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      {/* trigger muda quando dados chegam → garante .visible nos .reveal do formulário */}
      <RevealAll trigger={docData ? "loaded" : "init"} />
      <EditNavbar />
      <main className="pt-14">
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="max-w-lg mx-auto px-4 py-32 text-center flex flex-col items-center gap-5">
            <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-rose-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground mb-2">Não foi possível abrir</h2>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
            <Link
              to="/premio-ia"
              className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-border hover:bg-accent transition-colors"
            >
              Voltar ao Prêmio IA
            </Link>
          </div>
        ) : (
          <div>
            <InscricaoSectionExport prefill={docData} editDocId={id} />
          </div>
        )}
      </main>

      <footer className="border-t border-border py-6 text-center">
        <p className="text-xs text-muted-foreground">
          © 2026 Grupo Mirante · Prêmio IA Mirante ·{" "}
          <Link to="/" className="text-primary hover:underline underline-offset-2">
            Voltar ao Portal
          </Link>
        </p>
      </footer>
    </div>
  );
}
