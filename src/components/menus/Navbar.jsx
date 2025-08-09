import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect
} from "react";
import AuthModal from "../modals/AuthModal";
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
  FaSun
} from "react-icons/fa";
import clsx from "clsx";

/* Debounce + raf combine (daha stabil input hissi) */
function useRafDebounce(fn, delay) {
  const ref = useRef({ fn, timer: null, frame: null });
  ref.current.fn = fn;

  const clear = () => {
    if (ref.current.timer) clearTimeout(ref.current.timer);
    if (ref.current.frame) cancelAnimationFrame(ref.current.frame);
  };

  useEffect(() => clear, []);
  return useCallback(
    (...args) => {
      clear();
      ref.current.timer = setTimeout(() => {
        ref.current.frame = requestAnimationFrame(() => ref.current.fn(...args));
      }, delay);
    },
    [delay]
  );
}

const NAV_LINKS = Object.freeze([
  { href: "/", icon: FaHome, label: "Home" },
  { href: "/clans", icon: FaUsers, label: "Klanlar" },
  { href: "/tournaments", icon: FaTrophy, label: "Turnuvalar" },
  { href: "/resourcepacks", icon: FaBoxOpen, label: "Resource Packs" }
]);

export default function Navbar({ onSearch }) {
  const { user, logout } = useAuth();
  const { mode, toggleTheme } = useTheme();

  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const debouncedSearch = useRafDebounce(val => {
    onSearch?.(val);
  }, 250);

  const handleSearchChange = e => {
    const val = e.target.value;
    setSearchValue(val);
    debouncedSearch(val);
  };

  const handleLoginSuccess = () => setShowLogin(false);
  const handleRegisterSuccess = () => setShowRegister(false);

  const linkItems = useMemo(
    () =>
      NAV_LINKS.map(link => {
        const Icon = link.icon;
        return (
          <li key={link.href} role="none">
            <a
              href={link.href}
              className="menu-link focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5ea4ff]"
              role="menuitem"
            >
              <Icon className="opacity-80 shrink-0" />
              <span className="hidden sm:inline">{link.label}</span>
            </a>
          </li>
        );
      }),
    []
  );

  return (
    <nav
      className={clsx(
        "navbar-bg beautiful-navbar flex items-center justify-between gap-4 py-2 px-4",
        "animate-fade-in"
      )}
      aria-label="Ana navigasyon"
    >
      {/* Logo & Title */}
      <div className="flex items-center gap-3 min-w-40">
        <a
          href="/"
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5ea4ff] rounded-lg"
        >
          <img
            src="https://tier.sstashy.io/6faeb9b56bbc7622eadf32975f7d82f9.png"
            alt="Site logosu"
            className="navbar-logo"
            width={42}
            height={42}
            decoding="async"
            loading="eager"
            fetchPriority="high"
            draggable={false}
          />
        </a>
        <div className="navbar-title">
          <span className="font-semibold tracking-tight text-base sm:text-lg">
            Galaxy{" "}
            <span className="navbar-title-highlight font-bold">Tier</span>
          </span>
          <span className="navbar-subtitle text-[11px] uppercase tracking-wider text-gray-300 dark:text-gray-400 mt-[1px]">
            NethPOT Community
          </span>
        </div>
      </div>

      {/* Center Menu */}
      <ul
        className="flex-1 flex justify-center gap-2 mx-2 flex-wrap"
        role="menubar"
        aria-label="Site bölümleri"
      >
        {linkItems}
      </ul>

      {/* Right cluster */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="relative w-[150px] sm:w-[210px]">
          <FaSearch className="navbar-search-icon" aria-hidden="true" />
          <input
            type="text"
            placeholder="Oyuncu ara..."
            value={searchValue}
            onChange={handleSearchChange}
            className="navbar-search pl-8"
            aria-label="Oyuncu ara"
            spellCheck={false}
            autoComplete="off"
            enterKeyHint="search"
          />
        </div>

        {/* Theme toggle */}
        <button
          type="button"
          onClick={toggleTheme}
            aria-label={`Tema değiştir (Şu an: ${mode === "dark" ? "koyu" : "açık"})`}
          className="login-btn flex items-center justify-center w-10 h-10 p-0 rounded-lg !bg-transparent !text-[#82cfff] hover:!text-white hover:scale-105 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5ea4ff]"
          style={{ background: "none" }}
        >
          {mode === "dark" ? <FaSun /> : <FaMoon />}
        </button>

        {/* Discord */}
        <a
          href="https://discord.gg/trneth"
          target="_blank"
          rel="noopener noreferrer"
          className="discord-btn flex items-center gap-2"
        >
          <FaDiscord />
          <span className="hidden sm:inline">Discord</span>
        </a>

        {!user && (
          <>
            <button
              className="login-btn"
              onClick={() => setShowLogin(true)}
              type="button"
            >
              Giriş Yap
            </button>
            <button
              className="register-btn"
              onClick={() => setShowRegister(true)}
              type="button"
            >
              Kayıt Ol
            </button>
          </>
        )}

        {user && <UserMenu user={user} onLogout={logout} />}
      </div>

      {/* Auth Modals */}
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