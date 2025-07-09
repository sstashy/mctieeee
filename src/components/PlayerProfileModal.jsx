import React from "react";

export default function PlayerProfileModal({ player, onClose }) {
  if (!player) return null;
  return (
    <div className="profile-modal-bg" onClick={onClose}>
      <div className="profile-modal" onClick={e => e.stopPropagation()}>
        <button className="profile-modal-x" onClick={onClose} aria-label="Close">&times;</button>
        <img
          src={`https://minotar.net/avatar/${player.name}/110`}
          alt={player.name}
          className="profile-avatar"
        />
        <div className="profile-username">{player.name}</div>
        <div className="profile-position-box">
          <span className="profile-pos-label">Tier:</span>
          <span className="bg-gray-800 px-2 rounded">{player.tier}</span>
        </div>
        <div className="profile-position-box">
          <span className="profile-pos-label">Tür:</span>
          {player.tierType === "HT"
            ? <span className="text-green-400 font-bold">HT</span>
            : <span className="text-red-400 font-bold">LT</span>}
        </div>
        <div className="profile-position-box">
          <span className="profile-pos-label">Test Tarihi:</span>
          <span className="text-gray-100">{player.lastTested}</span>
        </div>
        <a className="profile-namemc" href={`https://namemc.com/profile/${player.name}`} target="_blank" rel="noopener noreferrer">
          NameMC'de Gör
        </a>
      </div>
    </div>
  );
}