import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';

/*
  Gelişmiş Tema Mantığı:
  - preference: 'system' | 'light' | 'dark'
  - mode: efektif ('light' veya 'dark')
  - HTML'e hem Tailwind dark class'ı hem de değişken bazlı .theme-light uygulanır (isteğe bağlı)
  - localStorage key: theme-pref
*/

const STORAGE_KEY = 'theme-pref';

function systemPrefersLight() {
  return (
    typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: light)').matches
  );
}

function resolveInitial() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return { preference: stored, mode: stored };
    if (stored === 'system' || !stored) {
      const sys = systemPrefersLight() ? 'light' : 'dark';
      return { preference: stored || 'system', mode: sys };
    }
  } catch {}
  return { preference: 'system', mode: systemPrefersLight() ? 'light' : 'dark' };
}

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [{ preference, mode }, setThemeState] = useState(resolveInitial);

  // DOM apply
  useEffect(() => {
    const root = document.documentElement;
    // Tailwind dark class
    if (mode === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
    // Variable light toggler
    root.classList.toggle('theme-light', mode === 'light');
    root.style.colorScheme = mode;
  }, [mode]);

  // Watch system changes if preference === system
  useEffect(() => {
    if (preference !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: light)');
    const handler = () => {
      setThemeState((s) => ({
        preference: s.preference,
        mode: systemPrefersLight() ? 'light' : 'dark',
      }));
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [preference]);

  // Persist preference
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, preference);
    } catch {}
  }, [preference]);

  // Cross-tab sync
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === STORAGE_KEY) {
        const pref = e.newValue || 'system';
        setThemeState({
          preference: pref,
          mode: pref === 'system' ? (systemPrefersLight() ? 'light' : 'dark') : pref,
        });
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const setTheme = useCallback((nextPref) => {
    setThemeState({
      preference: nextPref,
      mode: nextPref === 'system' ? (systemPrefersLight() ? 'light' : 'dark') : nextPref,
    });
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((s) => {
      const current = s.mode;
      const next = current === 'dark' ? 'light' : 'dark';
      return { preference: next, mode: next };
    });
  }, []);

  const value = {
    mode,
    preference,
    isDark: mode === 'dark',
    setTheme,
    toggleTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme ThemeProvider içinde çağrılmalı.');
  return ctx;
}
