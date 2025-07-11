import React, { useState } from "react";
import Main from "./pages/Main";
import AuthModal from "./components/AuthModal";
import LoginForm from "./components/LoginForm";

function App() {
  const [showLogin, setShowLogin] = useState(false);

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