import React, { useState } from "react";

export default function Navbar({
  currentMode = "Galaxy TierList",
  onModeChange,
  modes = ["NethOP"],
  onSearch,
}) {
  const [search, setSearch] = useState("");

  const handleSearch = (e) => {
    setSearch(e.target.value);
    if (onSearch) onSearch(e.target.value);
  };

  return (
    <nav className="bg-[#191d2a] px-4 py-3 flex items-center w-full border-b border-yellow-400/10 mb-6 gap-2">
      {/* Sol tarafta Logo ve başlık */}
      <div className="flex items-center gap-3">
        <img
          src="src/components/6faeb9b56bbc7622eadf32975f7d82f9.png"
          alt="Logo"
          className="h-9 w-9 rounded bg-yellow-300/80 border border-yellow-400"
        />
        <span className="font-black text-2xl text-yellow-200 tracking-wide select-none">
          Galaxy Tier
        </span>
      </div>

      {/* Ortada Mod/Kategori butonları */}
      <div className="flex-1 flex justify-center gap-2">
        {modes.map((mode) => (
          <button
            key={mode}
            className={`px-3 py-1.5 rounded text-sm font-bold border border-yellow-400/30 ${
              currentMode === mode
                ? "bg-yellow-300 text-[#181a2f]"
                : "bg-gray-700 text-yellow-100 hover:bg-yellow-200/10"
            } transition`}
            onClick={() => onModeChange(mode)}
          >
            {mode}
          </button>
        ))}
      </div>

      {/* Sağ tarafta Search ve Discord butonu */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <input
            type="text"
            placeholder="Search player..."
            value={search}
            onChange={handleSearch}
            className="pl-8 pr-2 py-1.5 rounded bg-gray-800 text-yellow-100 border border-yellow-400/20 focus:border-yellow-300 transition text-sm outline-none w-36 focus:w-48 duration-200"
          />
          <span className="absolute left-2 top-2 text-yellow-300 pointer-events-none">
            <svg
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="7" />
              <line x1="18" y1="18" x2="15.7" y2="15.7" />
            </svg>
          </span>
        </div>

        {/* Discord butonu */}
        <a
          href="https://discord.gg/trneth" // kendi Discord davet linkinle değiştir
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-1.5 bg-yellow-400 text-[#181a2f] font-bold rounded hover:bg-yellow-500 transition select-none"
        >
          Discord
        </a>
      </div>
    </nav>
  );
}
