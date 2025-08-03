import React from "react";
import PlayerCard from "./PlayerCard";

const tierBorderColors = [
  "border-yellow-400",
  "border-gray-400",
  "border-orange-400",
  "border-blue-400",
  "border-green-400",
];

export default function TierList({ title, players, idx, onPlayerClick }) {
  const borderColor = tierBorderColors[idx % tierBorderColors.length];

  return (
    <div
      className={`tier-card border-t-4 ${borderColor} bg-gray-800/60 flex-shrink-0`}
      style={{ minWidth: 180, maxWidth: 260, flex: "1 1 0px" }}
    >
      <h2 className="tier-title text-center font-bold text-lg py-2">{title}</h2>
      <ul className="player-list w-full flex flex-col gap-1 px-2 pb-2">
        {players.map((player) => (
          <li key={player.name}>
            <PlayerCard player={player} onClick={() => onPlayerClick(player)} />
          </li>
        ))}
      </ul>
    </div>
  );
}
