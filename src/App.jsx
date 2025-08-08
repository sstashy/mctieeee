import React, { useState, useEffect, Suspense } from "react";

import AuthModal from "./components/menus/AuthModal.jsx";
import LoginForm from "./components/forms/LoginForm";
import { AuthProvider } from "./components/context/AuthContext";
import { ThemeProvider } from "./components/context/ThemeContext";

import SiteStatusBadge from "./components/status/SiteStatusBadge";
import useSiteStatus from "./components/hooks/useSiteStatus";
import LoadingSpinner from "./components/common/LoadingSpinner";
import Signature from "./components/common/Signature.jsx"
const Main = React.lazy(() => import("./pages/Main"));

/* ----------------- Presentational ----------------- */
function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#181c2a] to-[#23263a]">
      <div className="flex flex-col items-center gap-4">
        <LoadingSpinner />
      </div>
    </div>
  );
}


function MaintenanceScreen({ retry, isError }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#181c2a] to-[#23263a] text-center px-4">
      <h1
        className={`text-4xl font-bold mb-4 drop-shadow ${
          isError ? "text-red-400" : "text-yellow-400"
        }`}
      >
        {isError ? "Durum Alınamadı" : "Bakımdayız"}
      </h1>
      <p className="text-gray-300 mb-5 max-w-md leading-relaxed">
        {isError
          ? "Site durumu alınırken bir sorun oluştu. Lütfen bağlantınızı kontrol edip tekrar deneyin."
          : "Sistemde geçici bakım çalışması var. Lütfen biraz sonra tekrar deneyin."}
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
            <Signature />
    </div>
  );
}

function DebugPanel({ phase, data, error }) {
  if (import.meta.env.PROD) return null;
  return (
    <div className="fixed bottom-2 left-2 z-50 text-[11px] font-mono bg-black/70 text-gray-200 px-3 py-2 rounded shadow">
      <div>phase: {phase}</div>
      <div>active: {String(data?.active)}</div>
      <div>message: {data?.message}</div>
      <div style={{ color: "tomato" }}>{error}</div>
    </div>
  );
}

function App() {
  const [showLogin, setShowLogin] = useState(false);

  const {
    data,
    phase,
    isError,
    isLoading,
    isSuccess,
    reload
  } = useSiteStatus({
    immediate: true,
    failOpenAfterMs: 1200,
    refreshInterval: 0,
    debug: true
  });

  const siteActive = data?.active !== false;

  // Kısayol / query param aynı (kodu kesmedim)

  if (isLoading && !data) {
    return <LoadingScreen />;
  }
  if (isError && !siteActive) {
    return <MaintenanceScreen retry={reload} isError />;
  }
  if (isSuccess && !siteActive) {
    return <MaintenanceScreen retry={reload} isError={false} />;
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="fixed top-2 right-2 z-50">
          <SiteStatusBadge
            data={data}
            phase={phase}
            isLoading={isLoading}
            isRefreshing={phase === "refreshing"}
            isError={isError}
            reload={reload}
          />
        </div>
        <Suspense fallback={<LoadingScreen />}>
          <Main openLogin={() => setShowLogin(true)} />
          <AuthModal
            show={showLogin}
            onClose={() => setShowLogin(false)}
            title="Giriş"
            description="Hesabınıza giriş yapın"
          >
            <LoginForm onSuccess={() => setShowLogin(false)} />
          </AuthModal>
        </Suspense>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;