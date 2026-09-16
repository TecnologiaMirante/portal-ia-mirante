import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/** Volta ao topo na troca de rota; se houver hash, rola até a âncora. */
export function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
      return;
    }

    const id = hash.slice(1);
    // Tenta imediatamente e depois aguarda a renderização completa
    const tryScroll = () => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        return true;
      }
      return false;
    };

    if (!tryScroll()) {
      const t1 = setTimeout(tryScroll, 100);
      const t2 = setTimeout(tryScroll, 400);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
  }, [pathname, hash]);

  // Suporte a hashchange sem recarregar página (links internos)
  useEffect(() => {
    const onHashChange = () => {
      const id = window.location.hash.slice(1);
      if (id) document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return null;
}
