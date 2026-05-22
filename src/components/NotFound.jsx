import { useNavigate } from "react-router-dom";
import { ArrowLeft, Home } from "lucide-react";
import { LogoMirante } from "@/components/LogoMirante";

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-8 relative overflow-hidden">

      {/* background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full opacity-15"
          style={{
            background: "radial-gradient(ellipse, oklch(0.55 0.28 264 / 0.7) 0%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />
      </div>

      {/* logo */}
      <a href="/" className="mb-12 group">
        <LogoMirante className="h-9 w-auto object-contain transition-opacity group-hover:opacity-70" />
      </a>

      {/* 404 */}
      <div className="relative text-center flex flex-col items-center gap-5">
        <p className="text-[120px] sm:text-[160px] font-black leading-none gradient-text select-none">
          404
        </p>

        <div className="flex flex-col gap-2 -mt-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Página não encontrada
          </h1>
          <p className="text-muted-foreground max-w-sm">
            A URL que você digitou não existe ou foi removida.
          </p>
        </div>

        <div className="flex items-center gap-3 mt-2">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>
          <a
            href="/"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all shadow-sm shadow-primary/25"
          >
            <Home className="w-4 h-4" />
            Ir para o portal
          </a>
        </div>
      </div>
    </div>
  );
}
