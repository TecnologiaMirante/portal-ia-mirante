import { useState } from "react";
import { Navigate } from "react-router-dom";
import { LogIn, Eye, EyeOff, Loader2, Sun, Moon } from "lucide-react";
import { LogoMirante } from "@/components/LogoMirante";
import { useAuth }  from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { Input }    from "@/components/ui/input";
import { Label }    from "@/components/ui/label";

export function AdminLogin() {
  const { user, signIn, error, loading } = useAuth();
  const { dark, toggle }                 = useTheme();

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [show,     setShow]     = useState(false);

  if (user) return <Navigate to="/admin" replace />;

  const handleSubmit = (e) => {
    e.preventDefault();
    signIn(email, password);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full opacity-20"
          style={{
            background: "radial-gradient(ellipse, oklch(0.55 0.28 264 / 0.6) 0%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />
      </div>

      {/* Theme toggle — top right */}
      <button
        onClick={toggle}
        aria-label={dark ? "Modo claro" : "Modo escuro"}
        className="fixed top-4 right-4 z-50 w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent border border-border bg-background/80 backdrop-blur-sm transition-colors"
      >
        {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </button>

      <div className="w-full max-w-sm relative">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <LogoMirante className="h-16 w-auto object-contain" />
          <div className="text-center">
            <h1 className="font-bold text-foreground text-xl tracking-tight">
              Portal <span className="gradient-text">IA</span> · Admin
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Acesso restrito à equipe
            </p>
          </div>
        </div>

        {/* Card */}
        <form
          onSubmit={handleSubmit}
          className="glass-card rounded-2xl p-6 flex flex-col gap-4"
        >
          {/* E-mail */}
          <div className="flex flex-col gap-1.5">
            <Label>E-mail</Label>
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@mirante.com.br"
              autoComplete="email"
            />
          </div>

          {/* Senha */}
          <div className="flex flex-col gap-1.5">
            <Label>Senha</Label>
            <div className="relative">
              <Input
                type={show ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="pr-10"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground transition-colors"
                aria-label={show ? "Ocultar senha" : "Mostrar senha"}
              >
                {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/8 border border-destructive/20 rounded-xl px-3 py-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-destructive shrink-0" />
              Credenciais inválidas. Verifique e-mail e senha.
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-sm shadow-primary/20 mt-1"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <LogIn className="w-4 h-4" />
            )}
            {loading ? "Entrando…" : "Entrar"}
          </button>
        </form>

        <p className="text-center text-xs text-muted-foreground/40 mt-4">
          Portal IA Mirante — uso interno
        </p>
      </div>
    </div>
  );
}
