import React, { useState, useRef, useEffect } from "react";
import Navbar from "../components/Navbar";
import TierList from "../components/TierList";
import PlayerProfileModal from "../components/PlayerProfileModal";
import Signature from "../components/Signature";

const modes = ["NethOP"];
const fixedTiers = [
  { key: "Tier 1", number: "1" },
  { key: "Tier 2", number: "2" },
  { key: "Tier 3", number: "3" },
  { key: "Tier 4", number: "4" },
  { key: "Tier 5", number: "5" },
];

export default function Main() {
  const [activeMode, setActiveMode] = useState(modes[0]);
  const [players, setPlayers] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [search, setSearch] = useState("");
  const containerRef = useRef();

  // Fetch player list from backend
  useEffect(() => {
    async function fetchPlayers() {
      try {
        const response = await fetch(
          `https://api.sstashy.io/api.php?route=tiers&mode=${encodeURIComponent(activeMode)}`
        );
        const data = await response.json();
        // Normalize: { "Tier 1": [oyuncular], ... } → dizi
        let normalized = [];
        if (Array.isArray(data)) {
          normalized = data;
        } else {
          Object.entries(data).forEach(([tierKey, arr]) => {
            arr.forEach((player) => {
              normalized.push({ ...player, tier: tierKey });
            });
          });
        }
        setPlayers(normalized);
      } catch (err) {
        setPlayers([]);
      }
    }
    fetchPlayers();
  }, [activeMode]);

  // Her tier için oyuncuları eşleştir ve HT'leri öne al
  const filteredTierLists = fixedTiers.map(({ key, number }, idx) => {
  let tierPlayers = players.filter(player => {
    const dbTier = String(player.tier).toLowerCase().replace("tier", "").trim();
    return dbTier === number;
  });

  // Benzersizleştir: önce HT, sonra LT
  const uniqPlayers = [];
  const namesSet = new Set();
  [
    ...tierPlayers.filter(player => player.tierType === "HT"),
    ...tierPlayers.filter(player => player.tierType !== "HT"),
  ].forEach(player => {
    if (!namesSet.has(player.name)) {
      namesSet.add(player.name);
      uniqPlayers.push(player);
    }
  });

  const filteredPlayers =
    search.trim().length > 0
      ? uniqPlayers.filter((player) =>
          player.name.toLowerCase().includes(search.trim().toLowerCase())
        )
      : uniqPlayers;

  return { tier: key, players: filteredPlayers, idx };
});

  const handlePlayerClick = (player, tier) =>
    setSelectedPlayer({ ...player, tier });

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#181c2a] to-[#23263a] relative flex flex-col">
      <div className="w-full bg-[#1c2030] shadow-lg mb-2">
        <Navbar
          currentMode={activeMode}
          onModeChange={(mode) => {
            setActiveMode(mode);
            setSearch("");
          }}
          modes={modes}
          onSearch={setSearch}
        />
      </div>
      <main className="flex flex-col items-center w-full max-w-7xl mx-auto px-2 flex-1">
        <section className="relative w-full mt-6">
          <div
            ref={containerRef}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-7 w-full pb-3 pt-3 box-border"
            style={{ minHeight: 370 }}
          >
            {filteredTierLists.map(({ tier, players, idx }) => (
              <TierList
                key={tier}
                title={tier}
                players={players}
                idx={idx}
                onPlayerClick={(player) => handlePlayerClick(player, tier)}
              />
            ))}
          </div>
        </section>
        <PlayerProfileModal player={selectedPlayer} onClose={() => setSelectedPlayer(null)} />
      </main>
      <Signature />
    </div>
  );
}