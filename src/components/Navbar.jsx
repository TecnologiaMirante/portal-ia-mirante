import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Sun, Moon, BookOpen, ShieldCheck, Newspaper } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { LogoMirante } from "@/components/LogoMirante";

const navLinks = [
  { label: "Recursos",    href: "#recursos"       },
  { label: "Começar",     href: "#comecar"        },
  { label: "Ferramentas", href: "#ferramentas"     },
  { label: "Portais IA",  href: "#implementacoes"  },
  { label: "Criações",    href: "#criacoes"        },
  { label: "Prêmio IA",   href: "#premio-ia"       },
];

export function Navbar({ onOpenPolicy }) {
  const { dark, toggle } = useTheme();
  const [scrolled,    setScrolled]    = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "navbar-solid" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* ── Logo ─────────────────────────────────────── */}
          <a href="#" className="flex items-center gap-2.5 group shrink-0">
            <LogoMirante className="h-9 w-auto object-contain transition-opacity group-hover:opacity-75" />
            <span className="font-semibold text-foreground">
              Mirante <span className="gradient-text font-bold">IA</span>
            </span>
          </a>

          {/* ── Desktop nav ──────────────────────────────── */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground rounded-lg hover:bg-accent transition-colors whitespace-nowrap"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* ── Actions ──────────────────────────────────── */}
          <div className="hidden lg:flex items-center gap-2">
            {/* Notícias IA */}
            <a
              href="/noticias"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent border border-transparent hover:border-border transition-colors"
            >
              <Newspaper className="w-3.5 h-3.5" />
              Notícias IA
            </a>

            {/* Política de IA */}
            <button
              onClick={onOpenPolicy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent border border-transparent hover:border-border transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Política de IA
            </button>

            <button
              onClick={toggle}
              aria-label={dark ? "Modo claro" : "Modo escuro"}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent border border-transparent hover:border-border transition-colors"
            >
              {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <Button
              size="sm"
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/20 hover:shadow-primary/35 transition-all"
              onClick={() =>
                window.open("https://bancodeprompts-mirante.onrender.com", "_blank")
              }
            >
              <BookOpen className="w-3.5 h-3.5" />
              Banco de Prompts
            </Button>
          </div>

          {/* ── Mobile actions ───────────────────────────── */}
          <div className="lg:hidden flex items-center gap-1">
            <button
              onClick={toggle}
              aria-label={dark ? "Modo claro" : "Modo escuro"}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              onClick={() => setMobileOpen((v) => !v)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile menu ──────────────────────────────────── */}
      {mobileOpen && (
        <div className="lg:hidden navbar-solid border-t border-border">
          <nav className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground rounded-lg hover:bg-accent transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <a
              href="/noticias"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              <Newspaper className="w-3.5 h-3.5" />
              Notícias IA
            </a>
            <button
              onClick={() => { onOpenPolicy(); setMobileOpen(false); }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors text-left"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Política de IA
            </button>
            <Button
              size="sm"
              className="mt-2 w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={() =>
                window.open("https://bancodeprompts-mirante.onrender.com", "_blank")
              }
            >
              <BookOpen className="w-3.5 h-3.5" />
              Banco de Prompts
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}
