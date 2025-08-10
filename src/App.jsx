import React, { useState, useCallback, Suspense, lazy, useTransition, useMemo } from 'react';

import { AuthProvider } from './components/context/AuthContext';
import { ThemeProvider } from './components/context/ThemeContext';

// Lisans guard
import { useLicenseGuard } from './license/useLicenseGuard';
import { hasLicensedFeature } from './license';

// Hooks
import useSiteStatus from './components/hooks/useSiteStatus';

// Küçük bileşen (önemsiz boyut)
import LoadingSpinner from './components/common/LoadingSpinner';

// Lazy yüklenenler
const Main = lazy(() => import('./pages/Main'));
const AuthModal = lazy(() => import('./components/modals/AuthModal.jsx'));
const LoginForm = lazy(() => import('./components/forms/LoginForm.jsx'));
const SiteStatusBadge = lazy(() => import('./components/status/SiteStatusBadge.jsx'));
const Signature = lazy(() => import('./components/common/Signature.jsx'));

/* ---------------- Presentational ---------------- */

const LoadingScreen = React.memo(function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#181c2a] to-[#23263a]">
      <div className="flex flex-col items-center gap-4">
        <LoadingSpinner />
        <p className="text-xs text-gray-400 tracking-wide">Yükleniyor...</p>
      </div>
    </div>
  );
});

const MaintenanceScreen = React.memo(function MaintenanceScreen({ retry, isError }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#181c2a] to-[#23263a] text-center px-4">
      <h1
        className={`text-4xl font-bold mb-4 drop-shadow ${
          isError ? 'text-red-400' : 'text-yellow-400'
        }`}
      >
        {isError ? 'Durum Alınamadı' : 'Bakımdayız'}
      </h1>
      <p className="text-gray-300 mb-5 max-w-md leading-relaxed">
        {isError
          ? 'Site durumu alınırken bir sorun oluştu. Lütfen bağlantınızı kontrol edip tekrar deneyin.'
          : 'Sistemde geçici bakım çalışması var. Lütfen biraz sonra tekrar deneyin.'}
      </p>
      <div className="flex gap-3">
        <a
          href="https://discord.gg/trneth"
          target="_blank"
          rel="noopener noreferrer"
          className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
        >
          Discord
        </a>
        <button
          type="button"
          onClick={retry}
          className="px-5 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-100 font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
        >
          Yeniden Dene
        </button>
      </div>
      <p className="mt-6 text-[11px] tracking-wider uppercase text-gray-500">
        &copy; {new Date().getFullYear()} Galaxy Tier
      </p>
      <Suspense fallback={null}>
        <Signature />
      </Suspense>
    </div>
  );
});
MaintenanceScreen.displayName = 'MaintenanceScreen';

const DebugPanel = React.memo(function DebugPanel({ phase, data, error }) {
  if (import.meta.env.PROD) return null;
  return (
    <div className="fixed bottom-2 left-2 z-50 text-[11px] font-mono bg-black/70 backdrop-blur-sm text-gray-200 px-3 py-2 rounded shadow">
      <div>phase: {phase}</div>
      <div>active: {String(data?.active)}</div>
      <div>message: {data?.message}</div>
      <div style={{ color: 'tomato' }}>{error}</div>
    </div>
  );
});

/* ---------------- AppInner (Tüm hook'lar üstte) ---------------- */

function AppInner() {
  // 1. Her render’da sabit sırayla hook çağır
  useLicenseGuard();

  const [showLogin, setShowLogin] = useState(false);
  const [isPending, startTransition] = useTransition();

  const { data, phase, isError, isLoading, isSuccess, reload } = useSiteStatus({
    immediate: true,
    failOpenAfterMs: 1200,
    refreshInterval: 0,
    debug: import.meta.env.DEV,
  });

  // Hook: retry callback (her zaman çalışır)
  const retry = useCallback(() => {
    startTransition(() => {
      reload();
    });
  }, [reload, startTransition]);

  // Hook: lisans feature kontrolü
  const allowCore = useMemo(() => hasLicensedFeature('core'), [data]);

  // Hook: login modal kontrol callback’leri (ERKEN RETURN'lardan önce!)
  const openLogin = useCallback(() => setShowLogin(true), []);
  const closeLogin = useCallback(() => setShowLogin(false), []);

  // 2. Hook SONRASI koşullu render (sorun yok)
  const siteActive = data?.active !== false;

  if (isLoading && !data) return <LoadingScreen />;
  if ((isError && !siteActive) || (isSuccess && !siteActive))
    return <MaintenanceScreen retry={retry} isError={isError} />;
  if (!allowCore) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#151a27] text-gray-300">
        <div className="text-center px-6">
          <h1 className="text-2xl font-semibold mb-3">Lisans Gerekli</h1>
          <p className="text-sm opacity-80">Bu içeriğe erişmek için lisans gerekiyor.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Suspense fallback={null}>
        <div className="fixed top-2 right-2 z-50 pointer-events-none">
          <div className="pointer-events-auto">
            <SiteStatusBadge
              data={data}
              phase={phase}
              isLoading={isLoading}
              isRefreshing={phase === 'refreshing' || isPending}
              isError={isError}
              reload={retry}
            />
          </div>
        </div>
      </Suspense>

      <Suspense fallback={<LoadingScreen />}>
        <Main openLogin={openLogin} />
      </Suspense>

      <Suspense fallback={null}>
        <AuthModal
          show={showLogin}
          onClose={closeLogin}
          title="Giriş"
          description="Hesabınıza giriş yapın"
        >
          <LoginForm onSuccess={closeLogin} />
        </AuthModal>
      </Suspense>

      <DebugPanel phase={phase} data={data} error={isError ? 'ERR' : ''} />
    </>
  );
}

/* ---------------- Provider Wrapper ---------------- */

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppInner />
      </AuthProvider>
    </ThemeProvider>
  );
}
