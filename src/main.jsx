/**
 * main.jsx – Performans Odaklı Bootstrap
 *
 * Amaçlar:
 *  - Mümkün olan en erken sürede (blocking olmadan) lisans handshake + integrity
 *  - App bundle render'ını (App) handshake sonrası çalıştırma
 *  - Ağır işler için requestIdleCallback / setTimeout fallback
 *  - Hata sınırı (RootErrorBoundary) + kill switch ekranı
 *  - Prod'da StrictMode devre dışı (gerekirse açılabilir)
 *  - Lazy import (App) => İlk JS parse süresini azaltır
 *  - Web Vitals raporu (isteğe bağlı, varsa perf/webVitals)
 *  - Ölçüm işaretleri (performance.mark)
 */

import React, { Suspense } from "react";
import { createRoot } from "react-dom/client";
import "./styles/index.css";

// Lazy App (App içinde büyük bağımlılıklar varsa parse geciktirilir)
const App = React.lazy(() => import("./App.jsx"));

// License utilities (dynamic import ile de ayrılabilir fakat lisans kritik => direkt import)
import { verifyLicenseIntegrity } from "./license";
import {
  ensureLicenseBoot,
  setOnKill
} from "./components/services/apiClient";

// (Opsiyonel) Web vitals (fail silently)
let reportWebVitals = null;
try {
  // Dinamik import; başarısız olursa ignore
  import("./perf/webVitals.js").then(m => {
    reportWebVitals = m.reportWebVitals;
    reportWebVitals?.((metric) => {
      // console.debug("[Vitals]", metric.name, metric.value);
      // navigator.sendBeacon('/vitals', JSON.stringify(metric));
    });
  }).catch(()=>{});
} catch {}

/* -------------------------------------------
   Error Boundary
------------------------------------------- */
class RootErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.error("[RootErrorBoundary]", error, info);
    }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={styles.errScreen}>
          <h1 style={styles.errTitle}>Bir şeyler ters gitti</h1>
          <p style={styles.errP}>
            Uygulama beklenmeyen bir hata ile karşılaştı. Lütfen sayfayı yenileyin.
          </p>
          <button onClick={() => window.location.reload()} style={styles.errBtn}>
            Yenile
          </button>
          {import.meta.env.DEV && this.state.error && (
            <pre style={styles.errPre}>
{String(this.state.error?.message || this.state.error)}
            </pre>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}

/* -------------------------------------------
   Stil objeleri (kritik olmayan -> inline)
------------------------------------------- */
const styles = {
  loading: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg,#181c2a,#23263a)",
    color: "#cbd5e1",
    fontFamily: "system-ui, sans-serif",
    flexDirection: "column",
    gap: "12px",
    fontSize: "0.95rem",
    letterSpacing: "0.5px"
  },
  errScreen: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg,#181c2a,#23263a)",
    color: "#f5f5f5",
    fontFamily: "system-ui, sans-serif",
    padding: "1.5rem",
    textAlign: "center"
  },
  errTitle: { fontSize: "1.9rem", marginBottom: ".75rem" },
  errP: { maxWidth: 460, lineHeight: 1.5, fontSize: ".95rem", opacity: 0.85 },
  errBtn: {
    marginTop: "1.25rem",
    background: "#2563eb",
    border: "none",
    color: "#fff",
    padding: ".65rem 1.25rem",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: 600
  },
  errPre: {
    maxWidth: 560,
    textAlign: "left",
    background: "#101624",
    padding: "12px 14px",
    fontSize: "12px",
    borderRadius: "8px",
    overflowX: "auto",
    lineHeight: 1.4
  }
};

/* -------------------------------------------
   Kill switch ekranı
------------------------------------------- */
function renderKill(reason) {
  document.body.innerHTML = `
    <div style="font-family:system-ui, sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;background:#0f1117;color:#f87171;text-align:center;padding:28px">
      <h1 style="font-size:32px;margin:0 0 14px;">Lisans Devre Dışı</h1>
      <p style="font-size:14px;line-height:1.5;max-width:520px;margin:0 0 18px;opacity:.85">
        Bu kurulum için lisans iptal edildi veya kill switch tetiklendi. (${reason || "revoked"})
      </p>
      <button onclick="location.reload()" style="background:#2563eb;color:#fff;border:none;padding:10px 18px;border-radius:8px;font-weight:600;cursor:pointer">
        Yeniden Dene
      </button>
    </div>
  `;
}

/* -------------------------------------------
   Kill callback kaydet
------------------------------------------- */
setOnKill((reason) => {
  console.warn("[main] KILL tetik:", reason);
  performance.mark("kill_switch");
  renderKill(reason);
});

/* -------------------------------------------
   Root element & render hazırlığı
------------------------------------------- */
const rootElem = document.getElementById("root");
if (!rootElem) {
  // eslint-disable-next-line no-console
  console.error("[bootstrap] #root bulunamadı");
  throw new Error("Root element not found");
}
const root = createRoot(rootElem);
const isDev = import.meta.env.DEV;

/* -------------------------------------------
   Suspense fallback (kritik minimal)
------------------------------------------- */
const suspenseFallback = (
  <div style={styles.loading}>
    <div>Yükleniyor...</div>
  </div>
);

const appTree = (
  <RootErrorBoundary>
    <Suspense fallback={suspenseFallback}>
      <App />
    </Suspense>
  </RootErrorBoundary>
);

/* -------------------------------------------
   License Guard kontrol
------------------------------------------- */
if (!window.__LICENSE_GUARD_ACTIVE) {
  document.body.innerHTML = "<h1 style='color:#f55;font-family:sans-serif;text-align:center;margin-top:15vh'>Lisans Guard Yok</h1>";
  throw new Error("License guard missing at startup.");
}

/* -------------------------------------------
   Performans işaretleri
------------------------------------------- */
performance.mark("bootstrap_start");

/* -------------------------------------------
   Bootstrap Akışı
------------------------------------------- */
(async () => {
  // 1) Lisans handshake (kritik)
  performance.mark("license_handshake_start");
  const info = await ensureLicenseBoot();
  performance.mark("license_handshake_end");
  if (!info.valid) {
    renderKill("handshake_fail");
    return;
  }

  // 2) Integrity (kritik ama paralel işaretle)
  performance.mark("integrity_start");
  await verifyLicenseIntegrity();
  performance.mark("integrity_end");

  // 3) App render
  performance.mark("app_render_start");
  if (isDev) {
    root.render(<React.StrictMode>{appTree}</React.StrictMode>);
  } else {
    root.render(appTree);
  }
  performance.mark("app_render_committed");

  // 4) Idle görevleri (prefetch, hafif temizlik)
  queueIdleTask(() => {
    // Örnek: ileride ek prefetch vs.
    // import('./components/services/apiClient').then(m => m.prefetchPlayersIdle?.());
  });

  logPerfMarks();

})().catch(e => {
  console.error("Bootstrap hata:", e);
  renderKill("bootstrap_error");
});

/* -------------------------------------------
   Yardımcı Fonksiyonlar
------------------------------------------- */
function queueIdleTask(fn, timeout = 2000) {
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(() => {
      try { fn(); } catch (e) { console.warn("idle task error", e); }
    }, { timeout });
  } else {
    setTimeout(() => {
      try { fn(); } catch (e) { console.warn("idle task error", e); }
    }, timeout);
  }
}

function logPerfMarks() {
  try {
    const marks = performance.getEntriesByType("mark");
    const map = {};
    marks.forEach(m => { map[m.name] = m.startTime.toFixed(1) + "ms"; });
    if (isDev) {
      // eslint-disable-next-line no-console
      console.table(map);
    }
    performance.clearMarks();
  } catch {}
}

// Hot Module Replacement (isteğe bağlı)
if (import.meta.hot) {
  import.meta.hot.accept();
}