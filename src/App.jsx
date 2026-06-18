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
import { PromptBankCTA } from "@/components/PromptBankCTA";
import { NewsPreview }   from "@/components/NewsPreview";
import { AIAward }       from "@/components/AIAward";
import { NewsCarousel }  from "@/components/NewsCarousel";
import { ComunicadosBanner } from "@/components/ComunicadosBanner";
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

/* ── Scroll reveal — re-observa a cada troca de rota ────── */
function ScrollReveal() {
  const location = useLocation();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08 },
    );

    const observe = () =>
      document.querySelectorAll(".reveal:not(.visible)").forEach((el) => observer.observe(el));

    observe();
    const t1 = setTimeout(observe, 100);
    const t2 = setTimeout(observe, 400);

    return () => {
      observer.disconnect();
      clearTimeout(t1);
      clearTimeout(t2);
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
        <Features />
        <GettingStarted />
        <AIToolsBanner />
        <MiranteAIs />
        <AICreations />
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
