import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import useFocusTrap from '../hooks/useFocusTrap';
import useLockBodyScroll from '../hooks/useLockBodyScroll';
import { useAuth } from '../context/AuthContext';
import CommentsModal from './CommentsModal';

export default function PlayerProfileModal({ player, onClose }) {
  const panelRef = useRef(null);
  const { user } = useAuth(); // (Şu an kullanılmıyor ama ileride yetki kontrolü için kalsın)
  const [showComments, setShowComments] = useState(false);

  const open = !!player;

  useFocusTrap(panelRef, open);
  useLockBodyScroll(open);

  useEffect(() => {
    if (!open) return;
    const esc = (e) => {
      if (e.key === 'Escape') {
        if (showComments) setShowComments(false);
        else onClose?.();
      }
    };
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [open, showComments, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="player-modal-heading"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div
        ref={panelRef}
        className="relative w-full max-w-md rounded-2xl border border-[#28304a] bg-[#23263af2] shadow-xl px-8 py-10 flex flex-col focus:outline-none transition-transform translate-y-0 animate-slide-down"
      >
        <button
          type="button"
          onClick={() => onClose?.()}
          className="absolute top-3 right-3 text-gray-300 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
          aria-label="Kapat"
        >
          &times;
        </button>

        <h2
          id="player-modal-heading"
          className="text-xl font-bold text-blue-300 tracking-wide mb-4"
        >
          {player.name} Profili
        </h2>

        <div className="flex flex-col items-center">
          <div className="relative w-[110px] h-[110px] mb-3">
            <img
              src={`https://minotar.net/avatar/${player.name}/110`}
              alt={`${player.name} avatarı`}
              className="rounded-full w-[110px] h-[110px] shadow-lg border-2 border-gray-700 object-cover"
              width={110}
              height={110}
              draggable={false}
              decoding="async"
            />
            {player.id && (
              <span
                className="absolute top-2 right-2 w-7 h-7 bg-green-500 text-white text-[15px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-md"
                title={`ID: ${player.id}`}
                aria-label={`Oyuncu ID: ${player.id}`}
              >
                {player.id}
              </span>
            )}
          </div>
          <div className="text-lg font-semibold text-gray-100 mb-3">{player.name}</div>

          <InfoRow label="Tier">
            <span className="bg-gray-800 px-2 rounded text-gray-200 font-mono">
              {player.tier ?? 'Bilinmiyor'}
            </span>
          </InfoRow>

          <InfoRow label="Tür">
            {player.tierType === 'HT' ? (
              <span className="text-green-400 font-bold">HT</span>
            ) : (
              <span className="text-red-400 font-bold">LT</span>
            )}
          </InfoRow>

          <InfoRow label="Test Tarihi">
            <span className="text-gray-100 font-mono">{player.lastTested || '—'}</span>
          </InfoRow>

          <div className="flex gap-3 mt-4 justify-center">
            <a
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
              href={`https://namemc.com/profile/${player.name}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${player.name} NameMC profili (yeni sekme)`}
            >
              NameMC
            </a>
            <button
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
              onClick={() => setShowComments(true)}
              type="button"
            >
              Yorumlar
            </button>
          </div>
        </div>

        {showComments && (
          <CommentsModal
            playerId={player.id}
            playerName={player.name}
            onClose={() => setShowComments(false)}
          />
        )}
      </div>
    </div>
  );
}

PlayerProfileModal.propTypes = {
  player: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string.isRequired,
    tier: PropTypes.string,
    tierType: PropTypes.string,
    lastTested: PropTypes.string,
  }),
  onClose: PropTypes.func,
};

function InfoRow({ label, children }) {
  return (
    <div className="flex items-center gap-2 mb-2 w-full justify-center">
      <span className="text-gray-400 text-sm">{label}:</span>
      {children}
    </div>
  );
}

InfoRow.propTypes = {
  label: PropTypes.string.isRequired,
  children: PropTypes.node,
};
