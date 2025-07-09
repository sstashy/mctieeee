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
  return (
    <div className={`tier-card border-t-4 ${tierBorderColors[idx % tierBorderColors.length]} bg-gray-800/60`}>
      <h2 className="tier-title">{title}</h2>
      <ul>
        {players.map((player) => (
          <PlayerCard key={player.name} player={player} onClick={() => onPlayerClick(player)} />
        ))}
      </ul>
    </div>
  );
}