import React from "react";

export default function PlayerCard({ player, onClick }) {
  return (
    <li
      className="player-card flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-gray-800/70 transition cursor-pointer min-w-0"
      onClick={onClick}
      tabIndex={0}
      onKeyDown={e => (e.key === "Enter" || e.key === " ") && onClick()}
      aria-label={player.name}
      title={player.name}
    >
      {/* Çubuk: shrink-0 ve flex-none ile asla kaybolmaz */}
      <span
        className={`lh-bar ${player.tierType === "HT" ? "ht-bar" : "lt-bar"} flex-none shrink-0`}
        aria-label={player.tierType === "HT" ? "High Tier" : "Low Tier"}
      />
      <img
        src={`https://minotar.net/avatar/${player.name}/32`}
        alt={player.name}
        className="rounded shadow-sm mr-2 flex-none shrink-0"
        width={28}
        height={28}
        draggable={false}
        loading="lazy"
      />
      {/* İsim: min-w-0 ve truncate ile taşarsa ... olur, çubuk ve resim asla kaybolmaz */}
      <span className="player-name-ellipsis text-yellow-50 font-medium text-base tracking-tight min-w-0 truncate block">
        {player.name}
      </span>
    </li>
  );
}