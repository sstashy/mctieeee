import React from "react";

export default function UserMenu({ user, onLogout }) {
  if (!user) return null;
  return (
    <div className="flex items-center gap-4 ml-3 bg-gradient-to-r from-[#23263a] via-[#28304a] to-[#181c2a] border border-[#5ea4ff] rounded-xl px-5 py-3 shadow-xl animate-fade-in backdrop-blur-xl ring-2 ring-[#82cfff]/20">
      <span className="text-[#5ea4ff] font-semibold text-lg drop-shadow flex items-center gap-2">
        <svg className="w-5 h-5 text-[#82cfff]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
        {user.username}
      </span>
      <button
        onClick={onLogout}
        className="bg-gradient-to-r from-[#5ea4ff] to-[#82cfff] text-[#23263a] font-bold px-4 py-2 rounded-lg hover:from-[#82cfff] hover:to-[#5ea4ff] hover:text-[#181c2a] hover:scale-110 hover:shadow-neon transition-all duration-200 shadow"
      >
        <svg className="w-4 h-4 inline-block mr-1 text-[#23263a]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M17 16l4-4m0 0l-4-4m4 4H7"></path></svg>
        Çıkış Yap
      </button>
    </div>
  );
}