// src/pages/Main.jsx
import React, { useState, useRef, useEffect, useMemo, useCallback, useDeferredValue } from 'react';

import Navbar from '../components/menus/Navbar';
import TierList from '../components/lists/TierList';
import PlayerProfileModal from '../components/modals/PlayerProfileModal';
import Signature from '../components/common/Signature';
import ErrorMessage from '../components/common/ErrorMessage';
import usePlayerSearch from '../components/hooks/usePlayerSearch';
import { getPlayers } from '../components/services/apiClient';

// Modlar ve sabit tier listesi
const modes = ['NethOP'];
const fixedTiers = [
  { key: 'Tier 1', number: '1' },
  { key: 'Tier 2', number: '2' },
  { key: 'Tier 3', number: '3' },
  { key: 'Tier 4', number: '4' },
  { key: 'Tier 5', number: '5' },
];

// Basit skeleton component
function TierSkeleton() {
  return (
    <div className="rounded-xl bg-gray-800/50 border border-gray-700/40 p-3 animate-pulse flex flex-col gap-3 min-h-[260px]">
      <div className="h-5 w-24 bg-gray-600/40 rounded" />
      <div className="flex-1 flex flex-col gap-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-8 bg-gray-700/30 rounded" />
        ))}
      </div>
    </div>
  );
}

// Özel hook: oyuncu verisi yönetimi
function usePlayersByMode(mode) {
  const [rawPlayers, setRawPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const abortRef = useRef(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');

    // Önceki isteği iptal
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    const res = await getPlayers(mode, {
      signal: abortRef.current.signal,
      // wrapper üzerinde abortPrevious = true varsa oradan da iptal olur
      force: true,
    });

    if (res.aborted) return;
    if (!res.ok) {
      setErrorMsg(res.error || 'Veri alınırken hata oluştu.');
      setRawPlayers([]);
      setLoading(false);
      return;
    }

    // res.data yapısı: backend yeni formata göre
    // Örn: { mode: "...", tiers: [ { tier: "1", players:[...] }, ... ] }
    const payload = res.data;
    let flat = [];

    if (Array.isArray(payload)) {
      // Eski biçim: doğrudan object (geriye dönük)
      // Bu branch pek gerekli değil ama emniyet için:
      Object.entries(payload).forEach(([tierKey, arr]) => {
        if (Array.isArray(arr)) {
          arr.forEach((p) => flat.push({ ...p, tier: tierKey }));
        }
      });
    } else if (payload?.tiers && Array.isArray(payload.tiers)) {
      payload.tiers.forEach((group) => {
        if (Array.isArray(group.players)) {
          group.players.forEach((p) => {
            flat.push({ ...p, tier: String(group.tier) });
          });
        }
      });
    } else if (payload && typeof payload === 'object') {
      // Eski associative: {"1":[...], "2":[...]}
      Object.entries(payload).forEach(([tierKey, arr]) => {
        if (Array.isArray(arr)) {
          arr.forEach((p) => flat.push({ ...p, tier: tierKey }));
        }
      });
    }

    setRawPlayers(flat);
    setLoading(false);
  }, [mode]);

  useEffect(() => {
    load();
    return () => abortRef.current?.abort();
  }, [load]);

  return { rawPlayers, loading, errorMsg, reload: load };
}

export default function Main() {
  const [activeMode, setActiveMode] = useState(modes[0]);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [search, setSearch] = useState('');

  const { rawPlayers, loading, errorMsg, reload } = usePlayersByMode(activeMode);

  // Deferred search (taper latency)
  const deferredSearch = useDeferredValue(search);

  // Arama
  const searchedPlayers = usePlayerSearch(rawPlayers, deferredSearch);

  // Tier bazlı gruplama + uniq + HT öncelik (tek pass)
  const tierMap = useMemo(() => {
    // { '1': [player,...], ... }
    const map = new Map();
    for (const fp of searchedPlayers) {
      const normalizedTier = normalizeTier(fp.tier);
      if (!map.has(normalizedTier)) map.set(normalizedTier, []);
      map.get(normalizedTier).push(fp);
    }
    return map;
  }, [searchedPlayers]);

  const filteredTierLists = useMemo(() => {
    return fixedTiers.map(({ key, number }, idx) => {
      const all = tierMap.get(number) || [];

      // HT öncelikli uniq filtre
      const uniq = [];
      const seen = new Set();
      // Önce HT, sonra diğer
      for (const pass of [true, false]) {
        for (const p of all) {
          const isHT = p.tierType === 'HT';
          if (isHT !== pass) continue;
          if (!seen.has(p.name)) {
            seen.add(p.name);
            uniq.push(p);
          }
        }
      }

      return {
        tier: key,
        players: uniq,
        idx,
      };
    });
  }, [tierMap]);

  const handlePlayerClick = useCallback(
    (player, tier) => setSelectedPlayer({ ...player, tier }),
    [],
  );

  const handleModeChange = (mode) => {
    if (mode === activeMode) return;
    setActiveMode(mode);
    setSearch('');
  };

  const hasAnyResult = filteredTierLists.some((t) => t.players.length > 0);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#181c2a] to-[#23263a] flex flex-col">
      {/* Navbar */}
      <div className="w-full bg-[#1c2030] shadow-lg mb-2">
        <Navbar
          currentMode={activeMode}
          onModeChange={handleModeChange}
          modes={modes}
          onSearch={setSearch}
        />
      </div>

      {/* İçerik */}
      <main className="flex flex-col items-center w-full max-w-7xl mx-auto px-2 flex-1">
        <section className="relative w-full mt-6">
          {errorMsg && (
            <div className="mb-4">
              <ErrorMessage message={errorMsg} variant="error" dismissible onClose={reload} />
            </div>
          )}

          {/* Skeleton veya grid */}
          <div
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-7 w-full pb-6 pt-3 transition-opacity"
            style={{ minHeight: 390 }}
          >
            {loading
              ? fixedTiers.map((t) => <TierSkeleton key={t.key} />)
              : filteredTierLists.map(({ tier, players, idx }) => (
                  <TierList
                    key={tier}
                    title={tier}
                    players={players}
                    idx={idx}
                    onPlayerClick={(player) => handlePlayerClick(player, tier)}
                    showCount
                  />
                ))}
          </div>

          {!loading && !errorMsg && search && !hasAnyResult && (
            <div className="text-center text-sm text-gray-400 mt-4">Arama sonucu bulunamadı.</div>
          )}
        </section>

        <PlayerProfileModal player={selectedPlayer} onClose={() => setSelectedPlayer(null)} />
      </main>
      <Signature />
    </div>
  );
}

/* ---------- Helpers ---------- */
function normalizeTier(tierValue) {
  if (tierValue == null) return '';
  const raw = String(tierValue).toLowerCase();
  // Örn: "Tier 1" -> "1"
  return raw.replace('tier', '').trim();
}
