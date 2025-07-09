import React, { useState, useRef } from "react";
import Navbar from "../components/Navbar";
import TierList from "../components/TierList";
import PlayerProfileModal from "../components/PlayerProfileModal";
import Signature from "../components/Signature";
import tiersData from "../data/tiers.json";

const modes = Object.keys(tiersData);

export default function Main() {
  const [activeMode, setActiveMode] = useState(modes[0]);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [search, setSearch] = useState("");
  const containerRef = useRef();

  const filteredTierLists = Object.entries(tiersData[activeMode])
    .map(([tier, players], idx) => {
      const filteredPlayers = search.trim().length > 0
        ? players.filter(player =>
            player.name.toLowerCase().includes(search.trim().toLowerCase())
          )
        : players;
      return { tier, players: filteredPlayers, idx };
    })
    .filter(({ players }) => players.length > 0);

  const handlePlayerClick = (player, tier) =>
    setSelectedPlayer({ ...player, tier });

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#181c2a] to-[#23263a] relative">
      <Navbar
        currentMode={activeMode}
        onModeChange={mode => {
          setActiveMode(mode);
          setSearch("");
        }}
        modes={modes}
        onSearch={setSearch}
      />
      <div className="flex flex-col items-center w-full max-w-7xl mx-auto px-2">
        <div
          className="relative w-full mt-4"
          onMouseEnter={() => containerRef.current.classList.add("show-scrollbar")}
          onMouseLeave={() => containerRef.current.classList.remove("show-scrollbar")}
        >
          <div className="custom-scrollbar-top absolute top-0 left-0 w-full h-3 pointer-events-none z-20" />
          <div
            ref={containerRef}
            className="flex flex-row flex-nowrap gap-7 justify-start w-full overflow-x-auto pb-3 pt-3 box-border scrollbar-hide custom-scrollbar-container"
            style={{ scrollBehavior: "smooth", minHeight: 370 }}
          >
            {filteredTierLists.length > 0 ? (
              filteredTierLists.map(({ tier, players, idx }) => (
                <TierList
                  key={tier}
                  title={tier}
                  players={players}
                  idx={idx}
                  onPlayerClick={player => handlePlayerClick(player, tier)}
                />
              ))
            ) : (
              <div className="text-yellow-100 py-16 text-lg">No player found.</div>
            )}
          </div>
        </div>
        <PlayerProfileModal
          player={selectedPlayer}
          onClose={() => setSelectedPlayer(null)}
        />
      </div>
      <Signature />
    </div>
  );
}