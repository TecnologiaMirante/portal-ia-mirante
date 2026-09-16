import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

/* Theme */
import { ThemeProvider } from "@/hooks/useTheme";

/* Toaster */
import { Toaster } from "@/components/ui/sonner";

/* Auth */
import { AuthProvider } from "@/hooks/useAuth";

/* Layout — portal principal */
import { Navbar }        from "@/components/Navbar";
import { Hero }          from "@/components/Hero";
import { Features }      from "@/components/Features";
import { AIToolsBanner }   from "@/components/AIToolsBanner";
import { GettingStarted }  from "@/components/GettingStarted";
import { MiranteAIs }      from "@/components/MiranteAIs";
import { AICreations }   from "@/components/AICreations";
import { CasoCTA }      from "@/components/CasoCTA";
import { PromptBankCTA } from "@/components/PromptBankCTA";
import { NewsPreview }   from "@/components/NewsPreview";
import { AIAward }       from "@/components/AIAward";
import { NewsCarousel }  from "@/components/NewsCarousel";
import { ComunicadosBanner } from "@/components/ComunicadosBanner";
import { EngagementSection } from "@/components/EngagementSection";
import { Footer }        from "@/components/Footer";
import { PolicyModal }   from "@/components/PolicyModal";

/* Admin */
import { Comunicados }           from "@/components/admin/Comunicados";
import { AdminLayout }           from "@/components/admin/AdminLayout";
import { AdminLogin }            from "@/components/admin/AdminLogin";
import { AdminDashboard }        from "@/components/admin/AdminDashboard";
import { CreationForm }          from "@/components/admin/CreationForm";
import { PremioInscricoes }      from "@/components/admin/PremioInscricoes";
import { PremioInscricaoDetail } from "@/components/admin/PremioInscricaoDetail";

/* Visual effects */
import { ScrollProgress } from "@/components/effects/ScrollProgress";
import { ScrollSpy }      from "@/components/effects/ScrollSpy";
import { ScrollToTop }    from "@/components/effects/ScrollToTop";
import { ClickRipple }    from "@/components/effects/ClickRipple";
import { BackToTop }      from "@/components/effects/BackToTop";

/* Pages */
import { NewsPage }     from "@/pages/NewsPage";
import { PremioIAPage }     from "@/pages/PremioIAPage";
import { PremioIAEditPage } from "@/pages/PremioIAEditPage";

/* Error boundary + 404 */
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { NotFound }      from "@/components/NotFound";

/* ── Scroll reveal — robusto: scroll + mutation + timeouts ─ */
function ScrollReveal() {
  const location = useLocation();

  useEffect(() => {
    /* Revela qualquer .reveal cujo topo já está dentro da janela (+150px) */
    const reveal = () => {
      document.querySelectorAll(".reveal:not(.visible)").forEach((el) => {
        const { top } = el.getBoundingClientRect();
        if (top < window.innerHeight + 150) el.classList.add("visible");
      });
    };

    reveal();
    const t1 = setTimeout(reveal, 150);
    const t2 = setTimeout(reveal, 600);
    const t3 = setTimeout(reveal, 1500);
    const t4 = setTimeout(reveal, 3000);

    window.addEventListener("scroll", reveal, { passive: true });

    /* Captura conteúdo renderizado de forma assíncrona (fetch, lazy, etc.) */
    const mo = new MutationObserver(reveal);
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener("scroll", reveal);
      mo.disconnect();
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [location.pathname]);

  return null;
}

/* ── Portal page ─────────────────────────────────────────── */
function PortalPage() {
  const [policyOpen, setPolicyOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <ScrollProgress />
      <ScrollSpy />
      <ClickRipple />
      <BackToTop />

      <Navbar onOpenPolicy={() => setPolicyOpen(true)} />

      <main>
        <ComunicadosBanner />
        <Hero onOpenPolicy={() => setPolicyOpen(true)} />
        <NewsCarousel />
        <EngagementSection />
        <Features />
        <GettingStarted />
        <AIToolsBanner />
        <MiranteAIs />
        <AICreations />
        <CasoCTA />
        <PromptBankCTA />
        <NewsPreview />
        <AIAward />
      </main>

      <Footer onOpenPolicy={() => setPolicyOpen(true)} />

      <PolicyModal open={policyOpen} onClose={() => setPolicyOpen(false)} />
    </div>
  );
}

/* ── App root ────────────────────────────────────────────── */
function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ErrorBoundary>
            <Toaster />
            <ScrollToTop />
            <ScrollReveal />
            <Routes>
              {/* ── Portal principal ──────────────────── */}
              <Route path="/" element={<PortalPage />} />

              {/* ── Admin ─────────────────────────────── */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminLayout />}>
                <Route index                element={<AdminDashboard />}        />
                <Route path="new"           element={<CreationForm />}          />
                <Route path="edit/:id"      element={<CreationForm />}          />
                <Route path="inscricoes"    element={<PremioInscricoes />}      />
                <Route path="inscricoes/:id" element={<PremioInscricaoDetail />} />
                <Route path="comunicados"   element={<Comunicados />}           />
              </Route>

              {/* ── Notícias ──────────────────────────── */}
              <Route path="/noticias" element={<NewsPage />} />

              {/* ── Prêmio IA ─────────────────────────── */}
              <Route path="/premio-ia"              element={<PremioIAPage />}     />
              <Route path="/premio-ia/editar/:id"   element={<PremioIAEditPage />} />

              {/* ── 404 ───────────────────────────────── */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </ErrorBoundary>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
