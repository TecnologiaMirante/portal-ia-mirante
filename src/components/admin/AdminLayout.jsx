import { useState } from "react";
import { Navigate, Outlet, useLocation, Link } from "react-router-dom";
import { LogOut, Sun, Moon, ChevronRight, LayoutDashboard, Plus, Edit2 } from "lucide-react";
import { LogoMirante } from "@/components/LogoMirante";
import { useAuth }       from "@/hooks/useAuth";
import { useTheme }      from "@/hooks/useTheme";
import { ConfirmDialog } from "@/components/ui/alert-dialog";

/* ── Breadcrumb config ───────────────────────────────────────── */
function useBreadcrumb(pathname) {
  if (pathname === "/admin" || pathname === "/admin/") {
    return [{ label: "Dashboard", icon: LayoutDashboard }];
  }
  if (pathname === "/admin/new") {
    return [
      { label: "Dashboard", icon: LayoutDashboard, href: "/admin" },
      { label: "Nova Criação", icon: Plus },
    ];
  }
  if (pathname.startsWith("/admin/edit/")) {
    return [
      { label: "Dashboard", icon: LayoutDashboard, href: "/admin" },
      { label: "Editar Criação", icon: Edit2 },
    ];
  }
  return [{ label: "Admin", icon: LayoutDashboard }];
}

/* ═══════════════════════════════════════════════════════════════
   AdminLayout
   ═══════════════════════════════════════════════════════════════ */
export function AdminLayout() {
  const { user, signOut }  = useAuth();
  const { dark, toggle }   = useTheme();
  const { pathname }       = useLocation();
  const crumbs             = useBreadcrumb(pathname);

  const [signOutOpen, setSignOutOpen] = useState(false);

  /* Not authenticated → login */
  if (user === null)      return <Navigate to="/admin/login" replace />;

  /* Still loading auth state */
  if (user === undefined) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* ── Top bar ────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 navbar-solid">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <Link to="/admin" className="flex items-center gap-2.5 group shrink-0">
              <LogoMirante className="h-7 w-auto object-contain transition-opacity group-hover:opacity-75" />
              <span className="text-muted-foreground text-sm font-normal">· Admin</span>
            </Link>

            {/* Right */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground hidden sm:block truncate max-w-[160px]">
                {user.email}
              </span>

              <button
                onClick={toggle}
                aria-label={dark ? "Modo claro" : "Modo escuro"}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent border border-transparent hover:border-border transition-colors"
              >
                {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              <button
                onClick={() => setSignOutOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/8 border border-transparent hover:border-destructive/20 transition-all"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sair
              </button>
            </div>
          </div>

          {/* ── Breadcrumb ─────────────────────────────────── */}
          {crumbs.length > 1 && (
            <div className="flex items-center gap-1.5 pb-2.5 text-xs text-muted-foreground">
              {crumbs.map((crumb, i) => {
                const isLast = i === crumbs.length - 1;
                const Icon   = crumb.icon;
                return (
                  <span key={i} className="flex items-center gap-1.5">
                    {i > 0 && <ChevronRight className="w-3 h-3 text-muted-foreground/40" />}
                    {crumb.href && !isLast ? (
                      <Link
                        to={crumb.href}
                        className="flex items-center gap-1 hover:text-foreground transition-colors"
                      >
                        <Icon className="w-3 h-3" />
                        {crumb.label}
                      </Link>
                    ) : (
                      <span className={`flex items-center gap-1 ${isLast ? "text-foreground font-medium" : ""}`}>
                        <Icon className="w-3 h-3" />
                        {crumb.label}
                      </span>
                    )}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      </header>

      {/* ── Page content ───────────────────────────────────── */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <Outlet />
      </main>

      {/* ── Sign out confirm ───────────────────────────────── */}
      <ConfirmDialog
        open={signOutOpen}
        onOpenChange={setSignOutOpen}
        title="Sair do painel?"
        description="Você será desconectado e redirecionado para a tela de login."
        confirmLabel="Sim, sair"
        cancelLabel="Cancelar"
        onConfirm={signOut}
        variant="default"
      />
    </div>
  );
}
