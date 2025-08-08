// src/components/sidebar/PlayerSidebar.jsx
import React, { useEffect, useRef } from "react";

// PlayerSidebar: Oyuncu detaylarını sağdan açılan bir yan panelde gösterir.
// player: Oyuncu objesi
// onClose: Paneli kapatan fonksiyon
export default function PlayerSidebar({ player, onClose }) {
  const sidebarRef = useRef(null);

  // Escape tuşu ile kapama ve panel açıldığında odağı panel içerisine verme
  useEffect(() => {
    if (!player) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", handleKeyDown);
    if (sidebarRef.current) sidebarRef.current.focus();
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [player, onClose]);

  // Oyuncu yoksa hiçbir şey render etme
  if (!player) return null;
  return (
    <div
      className="sidebar-bg fixed inset-0 bg-black/50 flex items-stretch justify-end z-50 animate-fade-in"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
      tabIndex={-1}
    >
      <aside
        ref={sidebarRef}
        className="sidebar-panel bg-gradient-to-br from-[#23263a] via-[#28304a] to-[#181c2a] rounded-l-2xl shadow-2xl border-l-4 border-[#28304a] backdrop-blur-lg px-8 py-10 w-[340px] max-w-full relative flex flex-col items-center outline-none"
        onClick={e => e.stopPropagation()}
        tabIndex={0}
        aria-label={`${player.name} yan paneli`}
      >
        {/* Kapatma butonu */}
        <button
          className="close-btn absolute top-4 right-4 text-gray-300 hover:text-blue-300 text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
          onClick={onClose}
          aria-label="Kapat"
          type="button"
        >&times;</button>
        {/* Oyuncu avatarı */}
        <img
          src={`https://minotar.net/avatar/${player.name}/80`}
          alt={`${player.name} avatarı`}
          className="mx-auto rounded-xl mb-4 shadow-lg border-2 border-gray-700"
          width={80}
          height={80}
          draggable={false}
        />
        {/* Oyuncu adı */}
        <h2 className="text-2xl font-bold mb-1 text-blue-100 text-center">{player.name}</h2>
        {/* Tier bilgisi */}
        <div className="flex justify-center items-center gap-2 mb-3 text-base">
          <span className="font-semibold text-gray-300">Tier:</span>
          <span className="bg-gray-800 px-2 rounded text-yellow-200 font-mono">{player.tier}</span>
        </div>
        {/* Tür bilgisi */}
        <div className="flex justify-center items-center gap-2 mb-3 text-base">
          <span className="font-semibold text-gray-300">Tür:</span>
          {player.tierType === "HT"
            ? <span className="text-green-400 font-bold">HT</span>
            : <span className="text-red-400 font-bold">LT</span>}
        </div>
        {/* Test tarihi */}
        <div className="mb-2 text-base text-center">
          <span className="font-semibold text-gray-300">Test Tarihi:</span>{" "}
          <span className="font-mono text-gray-100">{player.lastTested || "?"}</span>
        </div>
      </aside>
    </div>
  );
}