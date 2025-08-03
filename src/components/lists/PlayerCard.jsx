import React from "react";

export default function PlayerCard({ player, onClick }) {
  return (
    <li
      className="player-card flex items-center gap-1 py-[2px] px-[7px] border-[1.3px] border-[#2a2942] hover:bg-[#23243a] hover:border-indigo-500 transition cursor-pointer min-w-0"
      onClick={onClick}
      tabIndex={0}
      onKeyDown={e => (e.key === "Enter" || e.key === " ") && onClick()}
      aria-label={player.name}
      title={player.name}
      style={{
        minHeight: 24,
        fontSize: "13px",
        lineHeight: "1.07",
        marginBottom: "2px",
        borderRadius: "3px", // oval olmasın! daha köşeli
        boxShadow: "none",
        background: "transparent",
        color: "#e3e3ec"
      }}
    >
      {/* Çubuk: shrink-0 ve flex-none ile asla kaybolmaz */}
      <span
        className={`lh-bar ${player.tierType === "HT" ? "ht-bar" : "lt-bar"} flex-none shrink-0`}
        aria-label={player.tierType === "HT" ? "High Tier" : "Low Tier"}
        style={{
          width: 3,
          height: 20,
          borderRadius: 0, // oval olmasın!
          marginRight: 5
        }}
      />
      <img
        src={`https://minotar.net/avatar/${player.name}/32`}
        alt={player.name}
        className="shadow-sm mr-2 flex-none shrink-0"
        width={19}
        height={19}
        draggable={false}
        loading="lazy"
        style={{
          minWidth: 19,
          minHeight: 19,
          boxShadow: "0 1px 3px #0003",
          borderRadius: "2.5px" // oval olmasın!
        }}
      />
      <span className="player-name-ellipsis text-yellow-50 font-medium tracking-tight min-w-0 truncate block"
        style={{
          fontSize: "13px",
          fontWeight: 500,
          letterSpacing: ".01em"
        }}>
        {player.name}
      </span>
      <svg height="14" width="14" viewBox="0 0 20 20" className="ml-auto flex-none" aria-hidden="true" style={{opacity:0.7}}>
        <path d="M6 13l4-4 4 4" stroke="#bfc6ca" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </li>
  );
}