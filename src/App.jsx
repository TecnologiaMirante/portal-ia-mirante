import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

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
import { AIAward }       from "@/components/AIAward";
import { Footer }        from "@/components/Footer";
import { PolicyModal }   from "@/components/PolicyModal";

/* Admin */
import { AdminLayout }    from "@/components/admin/AdminLayout";
import { AdminLogin }     from "@/components/admin/AdminLogin";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { CreationForm }   from "@/components/admin/CreationForm";

/* Visual effects */
import { ScrollProgress } from "@/components/effects/ScrollProgress";
import { ScrollSpy }      from "@/components/effects/ScrollSpy";
import { ClickRipple }    from "@/components/effects/ClickRipple";
import { BackToTop }      from "@/components/effects/BackToTop";

/* Error boundary + 404 */
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { NotFound }      from "@/components/NotFound";

/* ── Portal page ─────────────────────────────────────────────── */
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
        <Hero />
        <Features />
        <GettingStarted />
        <AIToolsBanner />
        <MiranteAIs />
        <AICreations />
        <PromptBankCTA />
        <AIAward />
      </main>

      <Footer onOpenPolicy={() => setPolicyOpen(true)} />

      <PolicyModal open={policyOpen} onClose={() => setPolicyOpen(false)} />
    </div>
  );
}

/* ── App root ────────────────────────────────────────────────── */
function App() {
  /* Scroll reveal */
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
      { threshold: 0.12 },
    );
    const observe = () =>
      document.querySelectorAll(".reveal:not(.visible)").forEach((el) => observer.observe(el));
    observe();
    const t = setTimeout(observe, 300);
    return () => { observer.disconnect(); clearTimeout(t); };
  }, []);

  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ErrorBoundary>
            <Toaster />
            <Routes>
              {/* ── Portal principal ──────────────────── */}
              <Route path="/" element={<PortalPage />} />

              {/* ── Admin ─────────────────────────────── */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminLayout />}>
                <Route index           element={<AdminDashboard />} />
                <Route path="new"      element={<CreationForm />} />
                <Route path="edit/:id" element={<CreationForm />} />
              </Route>

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
