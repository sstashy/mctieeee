import React from 'react';

/**
 * Basit kullanıcı barı – role="menu" yerine daha sade semantik.
 * onLogout: çıkış callback
 */
export default function UserMenu({ user, onLogout }) {
  if (!user) return null;
  return (
    <div
      className="flex items-center gap-3 ml-2 bg-gradient-to-r from-[#23263a] via-[#28304a] to-[#181c2a] border border-[#5ea4ff]/70 rounded-xl px-4 py-2.5 shadow-xl animate-fade-in backdrop-blur-xl"
      aria-label={`${user.username} oturum bilgisi`}
    >
      <span className="flex items-center gap-2 text-[#5ea4ff] font-semibold text-sm">
        <svg
          className="w-5 h-5 text-[#82cfff]"
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
        </svg>
        <span className="tracking-tight">{user.username}</span>
      </span>
      <button
        onClick={onLogout}
        className="bg-gradient-to-r from-[#5ea4ff] to-[#82cfff] text-[#23263a] font-semibold px-3 py-1.5 rounded-lg hover:from-[#82cfff] hover:to-[#5ea4ff] hover:text-[#181c2a] hover:scale-105 transition-all duration-150 shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#82cfff]"
        aria-label="Çıkış Yap"
        type="button"
      >
        <span className="inline-flex items-center gap-1">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M17 16l4-4m0 0l-4-4m4 4H7" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 20H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h7" strokeLinecap="round" />
          </svg>
          <span>Çıkış</span>
        </span>
      </button>
    </div>
  );
}
