// src/components/sidebar/PlayerFloatingWindow.jsx
import React, { useEffect, useRef } from 'react';

// PlayerFloatingWindow: Oyuncu detaylarını küçük bir "floating window" (modal) olarak gösterir.
// player: Oyuncu objesi
// onClose: Pencereyi kapatacak fonksiyon
export default function PlayerFloatingWindow({ player, onClose }) {
  const windowRef = useRef(null);

  // Escape tuşu ile kapama ve pencere açıldığında odağı pencereye verme
  useEffect(() => {
    if (!player) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', handleKeyDown);
    if (windowRef.current) windowRef.current.focus();
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [player, onClose]);

  // Oyuncu yoksa hiçbir şey render etme
  if (!player) return null;
  return (
    <div
      className="floating-window-bg fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fade-in"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
      tabIndex={-1}
    >
      <div
        ref={windowRef}
        className="floating-window bg-[#23263ad9] rounded-2xl shadow-2xl border border-[#23263a] backdrop-blur-md px-8 py-9 min-w-[320px] max-w-md w-full relative flex flex-col items-center outline-none"
        onClick={(e) => e.stopPropagation()}
        tabIndex={0}
        aria-label={`${player.name} detayları`}
      >
        {/* Header: başlık ve kapama butonu */}
        <div className="floating-window-header w-full flex justify-between items-center mb-4">
          <span className="floating-window-title text-lg font-bold text-blue-200 tracking-tight">
            Oyuncu Detayları
          </span>
          <button
            className="floating-window-close text-gray-300 hover:text-blue-300 text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-400"
            onClick={onClose}
            aria-label="Kapat"
            type="button"
          >
            &times;
          </button>
        </div>
        {/* İçerik: Avatar, isim, tier, tür, test tarihi */}
        <div className="floating-window-content w-full flex flex-col items-center">
          <img
            src={`https://minotar.net/avatar/${player.name}/80`}
            alt={`${player.name} avatarı`}
            className="mx-auto rounded-xl mb-4 shadow-lg border-2 border-gray-700"
            width={80}
            height={80}
            draggable={false}
          />
          <h2 className="text-2xl font-bold mb-1 text-gray-100 text-center">{player.name}</h2>
          <div className="flex justify-center items-center gap-2 mb-3 text-base">
            <span className="font-semibold text-gray-300">Tier:</span>
            <span className="bg-gray-800 px-2 rounded text-yellow-200 font-mono">
              {player.tier}
            </span>
          </div>
          <div className="flex justify-center items-center gap-2 mb-3 text-base">
            <span className="font-semibold text-gray-300">Tür:</span>
            {player.tierType === 'HT' ? (
              <span className="text-green-400 font-bold">HT</span>
            ) : (
              <span className="text-red-400 font-bold">LT</span>
            )}
          </div>
          <div className="mb-2 text-base text-center">
            <span className="font-semibold text-gray-300">Test Tarihi:</span>{' '}
            <span className="font-mono text-gray-100">{player.lastTested || '?'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
