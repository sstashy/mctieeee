import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/index.css";

// Basit Global Error Boundary (gerekirse ayrı dosyada tut)
class RootErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    // Burada log servisine gönderebilirsin (Sentry vb.)
    if (import.meta.env.DEV) {
      console.error("[RootErrorBoundary]", error, info);
    }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg,#181c2a,#23263a)",
          color: "#f5f5f5",
          fontFamily: "system-ui, sans-serif",
          padding: "1.5rem",
          textAlign: "center"
        }}>
          <h1 style={{ fontSize: "1.75rem", marginBottom: ".75rem" }}>Bir şeyler ters gitti</h1>
          <p style={{ maxWidth: 420, lineHeight: 1.5, fontSize: ".95rem", opacity: .85 }}>
            Uygulama beklenmeyen bir hata ile karşılaştı. Lütfen sayfayı yenilemeyi deneyin.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: "1.25rem",
              background: "#2563eb",
              border: "none",
              color: "#fff",
              padding: ".65rem 1.25rem",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: 600
            }}
          >
            Yenile
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const rootElem = document.getElementById("root");
if (!rootElem) {
  console.error("root element not found");
} else {
  const root = ReactDOM.createRoot(rootElem);
  const isDev = import.meta.env.DEV;

  const content = (
    <RootErrorBoundary>
      <React.Suspense fallback={<div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg,#181c2a,#23263a)",
        color: "#cbd5e1",
        fontFamily: "system-ui, sans-serif"
      }}>
        Yükleniyor...
      </div>}>
        <App />
      </React.Suspense>
    </RootErrorBoundary>
  );

  if (isDev) {
    root.render(
      <React.StrictMode>
        {content}
      </React.StrictMode>
    );
  } else {
    root.render(content);
  }
}

// (Opsiyonel) Web Vitals raporlama (örn. sendToAnalytics)
// import reportWebVitals from './reportWebVitals';
// reportWebVitals(console.log);