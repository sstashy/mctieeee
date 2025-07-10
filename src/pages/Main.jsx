import React, { useState, useRef, useEffect } from "react";
import Navbar from "../components/Navbar";
import TierList from "../components/TierList";
import PlayerProfileModal from "../components/PlayerProfileModal";
import Signature from "../components/Signature";

// Artık tiersData'yı kaldırıyoruz ve mod listesini sabit tanımlıyoruz
const modes = ["NethOP"]; // Gerekirse backend'den /api/modes çekebilirsin

export default function Main() {
  const [activeMode, setActiveMode] = useState(modes[0]);
  const [tiersData, setTiersData] = useState({});
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [search, setSearch] = useState("");
  const containerRef = useRef();

  // Backend'den oyuncu listesini çek
  useEffect(() => {
async function fetchTiers() {
  try {
    const response = await fetch(`https://api.sstashy.io/api.php?route=tiers&mode=${encodeURIComponent(activeMode)}`);
    const data = await response.json();
    console.log("API'den gelen data:", data); // ← bunu ekle
    setTiersData(data);
  } catch (err) {
    console.error("Veri çekilemedi:", err); // ← hata detayını yazdır
    setTiersData({});
  }
}

    fetchTiers();
  }, [activeMode]);

  const filteredTierLists = Object.entries(tiersData)
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