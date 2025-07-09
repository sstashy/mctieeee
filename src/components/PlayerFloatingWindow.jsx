import React from "react";

export default function PlayerFloatingWindow({ player, onClose }) {
  if (!player) return null;
  return (
    <div className="floating-window-bg" onClick={onClose}>
      <div className="floating-window" onClick={e => e.stopPropagation()}>
        <div className="floating-window-header">
          <span className="floating-window-title">
            Oyuncu Detayları
          </span>
          <span className="floating-window-close" onClick={onClose}>&times;</span>
        </div>
        <div className="floating-window-content">
          <img
            src={`https://minotar.net/avatar/${player.name}/80`}
            alt={player.name}
            className="mx-auto rounded-xl mb-4 shadow-lg border-2 border-gray-700"
          />
          <h2 className="text-2xl font-bold mb-1 text-gray-100">{player.name}</h2>
          <div className="flex justify-center items-center gap-2 mb-3 text-base">
            <span className="font-semibold">Tier:</span>
            <span className="bg-gray-800 px-2 rounded">{player.tier}</span>
          </div>
          <div className="flex justify-center items-center gap-2 mb-3 text-base">
            <span className="font-semibold">Tür:</span>
            {player.tierType === "HT"
              ? <span className="text-green-400 font-bold">HT</span>
              : <span className="text-red-400 font-bold">LT</span>}
          </div>
          <div className="mb-2 text-base">
            <span className="font-semibold">Test Tarihi:</span> {player.lastTested}
          </div>
        </div>
      </div>
    </div>
  );
}