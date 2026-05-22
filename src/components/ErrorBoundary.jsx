import React from "react";
import { RefreshCw, AlertTriangle } from "lucide-react";
import { LogoMirante } from "@/components/LogoMirante";

/* ── Fallback UI ─────────────────────────────────────────────── */
function ErrorFallback({ error, onReset }) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] rounded-full opacity-10"
          style={{
            background: "radial-gradient(ellipse, #ef4444 0%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />
      </div>

      {/* logo */}
      <div className="mb-12">
        <LogoMirante className="h-9 w-auto object-contain opacity-80" />
      </div>

      <div className="flex flex-col items-center gap-5 text-center max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center">
          <AlertTriangle className="w-7 h-7 text-destructive" />
        </div>

        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-bold text-foreground">Algo deu errado</h2>
          <p className="text-sm text-muted-foreground">
            Um erro inesperado aconteceu. Tente recarregar a página.
          </p>
        </div>

        {/* error detail (dev only) */}
        {error?.message && (
          <pre className="w-full text-left text-[11px] font-mono text-destructive/60 bg-destructive/5 border border-destructive/10 rounded-xl p-3 overflow-x-auto max-h-28">
            {error.message}
          </pre>
        )}

        <div className="flex items-center gap-3">
          <button
            onClick={onReset}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
          >
            Tentar novamente
          </button>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all shadow-sm shadow-primary/25"
          >
            <RefreshCw className="w-4 h-4" />
            Recarregar página
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Class component (React requirement for error boundaries) ── */
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
    this.handleReset = this.handleReset.bind(this);
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  handleReset() {
    this.setState({ error: null });
  }

  render() {
    if (this.state.error) {
      return (
        <ErrorFallback
          error={this.state.error}
          onReset={this.handleReset}
        />
      );
    }
    return this.props.children;
  }
}
