import React, { useState, useRef, useEffect } from "react";
import Navbar from "../components/Navbar";
import TierList from "../components/TierList";
import PlayerProfileModal from "../components/PlayerProfileModal";
import Signature from "../components/Signature";

const modes = ["NethOP"];

export default function Main() {
  const [activeMode, setActiveMode] = useState(modes[0]);
  const [tiersData, setTiersData] = useState({});
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [search, setSearch] = useState("");
  const containerRef = useRef();

  // Fetch player list from backend
  useEffect(() => {
    async function fetchTiers() {
      try {
        const response = await fetch(
          `https://api.sstashy.io/api.php?route=tiers&mode=${encodeURIComponent(activeMode)}`
        );
        const data = await response.json();
        setTiersData(data);
      } catch (err) {
        setTiersData({});
      }
    }
    fetchTiers();
  }, [activeMode]);

  const filteredTierLists = Object.entries(tiersData)
    .map(([tier, players], idx) => {
      const filteredPlayers =
        search.trim().length > 0
          ? players.filter((player) =>
              player.name.toLowerCase().includes(search.trim().toLowerCase())
            )
          : players;
      return { tier, players: filteredPlayers, idx };
    })
    .filter(({ players }) => players.length > 0);

  const handlePlayerClick = (player, tier) =>
    setSelectedPlayer({ ...player, tier });

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#181c2a] to-[#23263a] relative flex flex-col">
      <Navbar
        currentMode={activeMode}
        onModeChange={(mode) => {
          setActiveMode(mode);
          setSearch("");
        }}
        modes={modes}
        onSearch={setSearch}
      />
      <main className="flex flex-col items-center w-full max-w-7xl mx-auto px-2 flex-1">
        <section
          className="relative w-full mt-6"
          onMouseEnter={() =>
            containerRef.current && containerRef.current.classList.add("show-scrollbar")
          }
          onMouseLeave={() =>
            containerRef.current && containerRef.current.classList.remove("show-scrollbar")
          }
        >
          <div className="custom-scrollbar-top absolute top-0 left-0 w-full h-3 pointer-events-none z-20" />
          <div
            ref={containerRef}
            className="tier-row-container custom-scrollbar-container flex flex-row flex-nowrap gap-7 justify-start w-full overflow-x-auto pb-3 pt-3 box-border"
            style={{ scrollBehavior: "smooth", minHeight: 370 }}
          >
            {filteredTierLists.length > 0 ? (
              filteredTierLists.map(({ tier, players, idx }) => (
                <TierList
                  key={tier}
                  title={tier}
                  players={players}
                  idx={idx}
                  onPlayerClick={(player) => handlePlayerClick(player, tier)}
                />
              ))
            ) : (
              <div className="text-yellow-100 py-16 text-lg w-full text-center">
                Oyuncu bulunamadı.
              </div>
            )}
          </div>
        </section>
        <PlayerProfileModal player={selectedPlayer} onClose={() => setSelectedPlayer(null)} />
      </main>
      <Signature />
    </div>
  );
}