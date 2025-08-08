import React, { useState, useCallback, useMemo } from "react";
import AuthModal from "./AuthModal";
import LoginForm from "../forms/LoginForm";
import RegisterForm from "../forms/RegisterForm";
import UserMenu from "./UserMenu";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import {
  FaDiscord,
  FaSearch,
  FaHome,
  FaUsers,
  FaTrophy,
  FaBoxOpen,
  FaMoon,
  FaSun,
} from "react-icons/fa";

// Basit debounce hook (isteğe göre ayrı dosyaya çıkarılabilir)
function useDebouncedCallback(fn, delay, deps = []) {
  const memo = React.useRef({ fn, timer: null });
  memo.current.fn = fn;
  return useCallback((...args) => {
    if (memo.current.timer) clearTimeout(memo.current.timer);
    memo.current.timer = setTimeout(() => memo.current.fn(...args), delay);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [delay, ...deps]);
}

export default function Navbar({ onSearch }) {
  const { user, logout } = useAuth();
  const { mode, toggleTheme } = useTheme();

  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const handleLoginSuccess = () => setShowLogin(false);
  const handleRegisterSuccess = () => setShowRegister(false);

  const debouncedSearch = useDebouncedCallback((val) => {
    onSearch?.(val);
  }, 250, []);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchValue(val);
    debouncedSearch(val);
  };

  const navLinks = useMemo(() => ([
    { href: "/", icon: FaHome, label: "Home" },
    { href: "/clans", icon: FaUsers, label: "Klanlar" },
    { href: "/tournaments", icon: FaTrophy, label: "Turnuvalar" },
    { href: "/resourcepacks", icon: FaBoxOpen, label: "Resource Packs" },
  ]), []);

  return (
    <nav
      className="navbar-bg beautiful-navbar navbar-elevated flex items-center justify-between gap-4 py-2 px-4"
      aria-label="Ana Navigasyon"
    >
      {/* Sol Logo */}
      <div className="flex items-center gap-3 min-w-36">
        <a href="/" className="navbar-logo-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5ea4ff] rounded">
          <img
            src="https://tier.sstashy.io/6faeb9b56bbc7622eadf32975f7d82f9.png"
            alt="Site logosu"
            className="navbar-logo"
            width={46}
            height={46}
            draggable={false}
          />
        </a>
        <div className="navbar-title flex flex-col leading-tight">
          <span className="font-semibold tracking-tight text-lg">
            Galaxy <span className="navbar-title-highlight font-bold">Tier</span>
          </span>
          <span className="navbar-subtitle text-[11px] uppercase tracking-wider text-gray-300 mt-[1px]">
            NethPOT Community
          </span>
        </div>
      </div>

      {/* Orta Menü */}
      <ul className="flex-1 flex justify-center gap-2 mx-2 flex-wrap navbar-menu-blur" role="menubar" aria-label="Site bölümleri">
        {navLinks.map(link => {
          const Icon = link.icon;
          return (
            <li key={link.href} role="none">
              <a
                href={link.href}
                className="menu-link menu-link-elevated inline-flex items-center gap-1 px-3 py-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5ea4ff]"
                role="menuitem"
              >
                <Icon className="opacity-80" />
                <span className="hidden sm:inline">{link.label}</span>
              </a>
            </li>
          );
        })}
      </ul>

      {/* Sağ blok */}
      <div className="flex items-center gap-2">
        {/* Arama */}
        <div className="relative w-[160px] sm:w-[220px]">
          <FaSearch className="navbar-search-icon" aria-hidden="true" />
            <input
              type="text"
              placeholder="Oyuncu ara..."
              value={searchValue}
              onChange={handleSearchChange}
              className="navbar-search pl-8 navbar-search-elevated"
              aria-label="Oyuncu ara"
              spellCheck={false}
            />
        </div>

        {/* Tema toggle */}
        {/* <button
          type="button"
          onClick={toggleTheme}
          aria-label={`Tema değiştir (Şu an: ${mode === "dark" ? "koyu" : "açık"})`}
          className="nav-btn-elevated flex items-center justify-center w-10 h-10 rounded-lg text-[#82cfff] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5ea4ff] transition"
        >
          {mode === "dark" ? <FaSun /> : <FaMoon />}
        </button> */}

        {/* Discord */}
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

        {user && <UserMenu user={user} onLogout={logout} />}
      </div>

      {/* Modallar */}
      <AuthModal
        show={showLogin}
        onClose={() => setShowLogin(false)}
        title="Giriş"
        description="Hesabınıza giriş yapın."
      >
        <LoginForm onSuccess={handleLoginSuccess} />
      </AuthModal>
      <AuthModal
        show={showRegister}
        onClose={() => setShowRegister(false)}
        title="Kayıt"
        description="Yeni bir hesap oluşturun."
      >
        <RegisterForm onSuccess={handleRegisterSuccess} />
      </AuthModal>
    </nav>
  );
}