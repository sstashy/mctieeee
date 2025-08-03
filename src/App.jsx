import React, { useState, useEffect } from "react";
import Main from "./pages/Main";
import AuthModal from "./components/menus/AuthModal.jsx";
import LoginForm from "./components/forms/LoginForm";
import Signature from "./components/common/Signature";

function App() {
  const [showLogin, setShowLogin] = useState(false);
  const [siteActive, setSiteActive] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://api.sstashy.io/site-status.php")
      .then((res) => res.json())
      .then((data) => {
        setSiteActive(data?.active === true);
        setLoading(false);
      })
      .catch(() => {
        setSiteActive(false);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div style={{ textAlign: "center", marginTop: "100px" }}>Yükleniyor...</div>;
  }

  if (!siteActive) {
    return (
      <div style={{ textAlign: "center", marginTop: "100px", color: "#ff4d4f" }}>
        <h1>Bakımda</h1>
        <p>
          <a
            href="https://discord.gg/trneth"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#4a90e2", textDecoration: "underline" }}
          >
            Discord
          </a>
        </p>
                <Signature />
      </div>
    );
  }

  return (
    <>
      <Main openLogin={() => setShowLogin(true)} />
      <AuthModal show={showLogin} onClose={() => setShowLogin(false)}>
        <LoginForm onSuccess={() => setShowLogin(false)} />
      </AuthModal>
    </>
  );
}

export default App;
