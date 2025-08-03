import React from "react";

export default function PlayerProfileModal({ player, onClose }) {
  if (!player) return null;

  return (
    <div className="profile-modal-bg fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="profile-modal bg-[#23263ad9] rounded-xl shadow-2xl border border-[#23263a] backdrop-blur-md px-8 py-10 min-w-[340px] relative flex flex-col items-center"
        onClick={e => e.stopPropagation()}
      >
        <button
          className="profile-modal-x absolute top-4 right-4 text-gray-300 hover:text-gray-100 text-2xl font-bold"
          onClick={onClose}
          aria-label="Close"
        >&times;</button>
        <div className="relative w-[110px] h-[110px] mb-3">
          {/* Avatar */}
          <img
            src={`https://minotar.net/avatar/${player.name}/110`}
            alt={player.name}
            className="rounded-full w-[110px] h-[110px] shadow-lg border-2 border-gray-700 object-cover"
          />
          {/* Küçük yeşil rozet: sağ üst köşede, avatarı kapatmadan */}
          {player.id && (
            <span
              className="absolute top-2 right-2 w-7 h-7 bg-green-500 text-white text-[15px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-md"
              style={{
                fontFamily: "Inter, sans-serif",
                boxShadow: "0 2px 8px #0003",
              }}
              title={`ID: ${player.id}`}
              aria-label={`Oyuncu ID: ${player.id}`}
            >
              {player.id}
            </span>
          )}
        </div>
        <div className="profile-username text-lg font-semibold text-gray-100 mb-4">{player.name}</div>
        {/* Diğer bilgiler */}
        <div className="profile-position-box flex items-center gap-2 mb-2">
          <span className="profile-pos-label text-gray-400">Tier:</span>
          <span className="bg-gray-800 px-2 rounded text-gray-200">{player.tier}</span>
        </div>
        <div className="profile-position-box flex items-center gap-2 mb-2">
          <span className="profile-pos-label text-gray-400">Tür:</span>
          {player.tierType === "HT"
            ? <span className="text-green-400 font-bold">HT</span>
            : <span className="text-red-400 font-bold">LT</span>}
        </div>
        <div className="profile-position-box flex items-center gap-2 mb-4">
          <span className="profile-pos-label text-gray-400">Test Tarihi:</span>
          <span className="text-gray-100">{player.lastTested}</span>
        </div>
        <a
          className="profile-namemc mt-2 px-4 py-2 rounded-lg bg-blue-700 text-white font-medium hover:bg-blue-600 transition"
          href={`https://namemc.com/profile/${player.name}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          NameMC'de Gör
        </a>
      </div>
    </div>
  );
}