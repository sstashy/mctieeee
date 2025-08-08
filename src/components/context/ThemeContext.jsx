import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback
} from "react";

/**
 * Kullanıcı sistem tercihine göre başlangıç teması:
 * localStorage override varsa onu kullan.
 * Tailwind genelde sadece 'dark' class'ını bekliyor; light için ek class gerekmez.
 */
function resolveInitialTheme() {
  try {
    const stored = localStorage.getItem("theme-pref"); // 'dark' | 'light' | 'system'
    if (stored) {
      if (stored === "system") return systemTheme();
      return stored;
    }
    return systemTheme();
  } catch {
    return "dark";
  }
}

function systemTheme() {
  if (
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: light)").matches
  ) {
    return "light";
  }
  return "dark";
}

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(() => resolveInitialTheme()); // 'dark' | 'light'
  const [preference, setPreference] = useState(() => {
    try {
      return localStorage.getItem("theme-pref") || "system";
    } catch {
      return "system";
    }
  }); // 'system' | 'light' | 'dark'

  // DOM apply
  useEffect(() => {
    // Sadece 'dark' class toggle
    const root = document.documentElement;
    if (mode === "dark") root.classList.add("dark");
    else root.classList.remove("dark");

    // CSS color-scheme yardımı (scrollbar, form controls)
    root.style.colorScheme = mode;
  }, [mode]);

  // Sistem teması değişirse (preference = system)
  useEffect(() => {
    if (preference !== "system") return;
    const media = window.matchMedia("(prefers-color-scheme: light)");
    const handler = () => setMode(systemTheme());
    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, [preference]);

  // Persist preference
  useEffect(() => {
    try {
      localStorage.setItem("theme-pref", preference);
    } catch {}
  }, [preference]);

  // Sekmeler arasında senkronizasyon
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "theme-pref") {
        const newPref = e.newValue || "system";
        setPreference(newPref);
        setMode(newPref === "system" ? systemTheme() : newPref);
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const setTheme = useCallback((next) => {
    // next: 'dark' | 'light' | 'system'
    setPreference(next);
    setMode(next === "system" ? systemTheme() : next);
  }, []);

  const toggleTheme = useCallback(() => {
    // kullanıcı manual override yapmış olur
    setPreference((prev) => {
      const currentEffective = prev === "system" ? systemTheme() : prev;
      const nextEffective = currentEffective === "dark" ? "light" : "dark";
      // system yerine direkt explicit kaydet
      setMode(nextEffective);
      return nextEffective;
    });
  }, []);

  const value = {
    mode,            // efektif tema
    preference,      // kullanıcı seçimi
    setTheme,        // explicit seçim
    toggleTheme,     // dark <-> light
    isDark: mode === "dark"
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme ThemeProvider içinde kullanılmalı.");
  }
  return ctx;
}