import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef
} from "react";

/**
 * Basit doğrulama – user objesinde en azından id veya name olduğundan emin ol.
 */
function normalizeUser(raw) {
  if (!raw) return null;
  if (typeof raw !== "object") return null;
  if (!raw.name && !raw.username) return null;
  return raw;
}

/**
 * Güvenli storage erişimi (SSR veya erişim kısıtı durumunda patlamaması için)
 */
const safeStorage = {
  get(key) {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch {}
  },
  remove(key) {
    try {
      window.localStorage.removeItem(key);
    } catch {}
  }
};

const STORAGE_KEY = "user";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const refreshTimerRef = useRef(null);

  // İlk yükleme
  useEffect(() => {
    const cached = safeStorage.get(STORAGE_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        const normalized = normalizeUser(parsed);
        if (normalized) setUser(normalized);
      } catch {
        // bozuk json -> yok say
      }
    }
    setInitializing(false);
  }, []);

  // Persist
  useEffect(() => {
    if (user) {
      safeStorage.set(STORAGE_KEY, JSON.stringify(user));
    } else {
      safeStorage.remove(STORAGE_KEY);
    }
  }, [user]);

  // Sekmeler arası senkronizasyon
  useEffect(() => {
    function handleStorage(e) {
      if (e.key === STORAGE_KEY) {
        if (!e.newValue) {
          setUser(null);
          return;
        }
        try {
          const parsed = JSON.parse(e.newValue);
          setUser(normalizeUser(parsed));
        } catch {
          setUser(null);
        }
      }
    }
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // (Opsiyonel) token süresi yaklaşınca silent refresh – kullanıcı objesinde exp varsa:
  const scheduleRefreshIfNeeded = useCallback((maybeUser) => {
    clearTimeout(refreshTimerRef.current);
    if (!maybeUser?.exp) return;
    const now = Date.now();
    const expMs = maybeUser.exp * 1000;
    const delta = expMs - now - 60_000; // 1 dk önce yenile
    if (delta > 0) {
      refreshTimerRef.current = setTimeout(() => {
        // refreshToken() çağırabilirsin; şimdi sadece logout fallback:
        // silentRefresh().catch(() => logout());
      }, delta);
    }
  }, []);

  useEffect(() => {
    scheduleRefreshIfNeeded(user);
    return () => clearTimeout(refreshTimerRef.current);
  }, [user, scheduleRefreshIfNeeded]);

  const login = useCallback(async (userData) => {
    // userData = { name, token, exp? ... }
    const normalized = normalizeUser(userData);
    if (!normalized) throw new Error("Geçersiz kullanıcı verisi");
    setUser(normalized);
    return normalized;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    // (Opsiyonel) active request abort, analytics, navigate vs.
  }, []);

  const isAuthenticated = !!user;

  const value = {
    user,
    isAuthenticated,
    initializing,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth AuthProvider içinde kullanılmalı.");
  }
  return ctx;
}