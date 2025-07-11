import React, { useState, useEffect } from "react";
import AuthModal from "./AuthModal";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import UserMenu from "./UserMenu";
import {
  FaDiscord,
  FaSearch,
  FaHome,
  FaUsers,
  FaTrophy,
  FaBoxOpen,
} from "react-icons/fa";

export default function Navbar({ onSearch }) {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (u) setUser(JSON.parse(u));
  }, []);

  const handleLogin = () => {
    const u = localStorage.getItem("user");
    if (u) setUser(JSON.parse(u));
    setShowLogin(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <nav className="navbar-bg beautiful-navbar navbar-elevated">
      {/* Sol: Logo ve başlık */}
      <div className="flex items-center gap-3 min-w-36">
        <div className="navbar-logo-glow">
  <img
    src="https://tier.sstashy.io/6faeb9b56bbc7622eadf32975f7d82f9.png"
    alt="Logo"
    className="navbar-logo"
  />
        </div>
        <span className="navbar-title flex flex-col leading-none">
          <span>
            Galaxy <span className="navbar-title-highlight">Tier</span>
          </span>
          <span className="navbar-subtitle">Competitive Minecraft</span>
        </span>
      </div>

      {/* Ortada: Menü */}
      <div className="flex-1 flex justify-center gap-2 mx-2 flex-wrap navbar-menu-blur">
        <a href="/" className="menu-link menu-link-elevated">
          <FaHome className="mr-1 opacity-80" />
          <span className="hidden sm:inline">Home</span>
        </a>
        <a href="/clans" className="menu-link menu-link-elevated">
          <FaUsers className="mr-1 opacity-80" />
          <span className="hidden sm:inline">Klanlar</span>
        </a>
        <a href="/tournaments" className="menu-link menu-link-elevated">
          <FaTrophy className="mr-1 opacity-80" />
          <span className="hidden sm:inline">Turnuvalar</span>
        </a>
        <a href="/resourcepacks" className="menu-link menu-link-elevated">
          <FaBoxOpen className="mr-1 opacity-80" />
          <span className="hidden sm:inline">Resource Packs</span>
        </a>
      </div>

      {/* Sağ: Arama, Discord, Auth */}
      <div className="flex items-center gap-2">
        <div className="relative w-[160px] sm:w-[220px]">
          <FaSearch className="navbar-search-icon" />
          <input
            type="text"
            placeholder="Oyuncu ara..."
            onChange={e => onSearch?.(e.target.value)}
            className="navbar-search pl-8 navbar-search-elevated"
          />
        </div>
        <a
          href="https://discord.gg/trneth"
          target="_blank"
          rel="noopener noreferrer"
          className="navbar-link discord-btn flex items-center gap-2 nav-btn-elevated"
        >
          <FaDiscord />
          <span className="hidden sm:inline">Discord</span>
        </a>
        {!user && (
          <>
            <button
              className="navbar-link login-btn nav-btn-elevated"
              onClick={() => setShowLogin(true)}
              type="button"
            >
              Giriş Yap
            </button>
            <button
              className="navbar-link register-btn nav-btn-elevated"
              onClick={() => setShowRegister(true)}
              type="button"
            >
              Kayıt Ol
            </button>
          </>
        )}
        {user && <UserMenu user={user} onLogout={handleLogout} />}
      </div>
      {/* Modal */}
      <AuthModal show={showLogin} onClose={() => setShowLogin(false)}>
        <LoginForm onLogin={handleLogin} />
      </AuthModal>
      <AuthModal show={showRegister} onClose={() => setShowRegister(false)}>
        <RegisterForm onSuccess={() => setShowRegister(false)} />
      </AuthModal>
    </nav>
  );
}