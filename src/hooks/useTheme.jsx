/**
 * useTheme — shared dark/light theme context
 * Single source of truth: all screens (portal + admin) read from this.
 */
import { createContext, useContext, useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "portal-ia-theme";

function getInitialDark() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) return stored === "dark";
  } catch {}
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
}

const ThemeContext = createContext({ dark: false, toggle: () => {} });

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(getInitialDark);

  useEffect(() => {
    const root = document.documentElement;
    dark ? root.classList.add("dark") : root.classList.remove("dark");
    try { localStorage.setItem(STORAGE_KEY, dark ? "dark" : "light"); } catch {}
  }, [dark]);

  const toggle = useCallback(() => setDark((d) => !d), []);

  return (
    <ThemeContext.Provider value={{ dark, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
