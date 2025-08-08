import { useMemo } from "react";

/**
 * Basit accent temizleyici (locale bağımsız).
 */
function normalize(str) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim();
}

/**
 * @param {Array} players - { name: string, ... } öğeleri
 * @param {string} search - arama terimi
 * @param {object} options
 *   - minLength: arama başlaması için gereken minimum karakter
 *   - returnAllIfEmpty: true => search boşken tüm liste döner
 *   - fields: ["name"] gibi aranacak alan listesi (ileri kullanım)
 *   - fuzzy: (boolean) basit subsequence
 *   - limit: sonuç sayısını sınırla (perf)
 */
export default function usePlayerSearch(
  players,
  search,
  {
    minLength = 0,
    returnAllIfEmpty = true,
    fields = ["name"],
    fuzzy = false,
    limit = Infinity
  } = {}
) {
  const normalizedTerm = normalize(search || "");

  return useMemo(() => {
    if (!players || !Array.isArray(players)) return [];
    if (!normalizedTerm) {
      return returnAllIfEmpty ? players : [];
    }
    if (normalizedTerm.length < minLength) {
      return [];
    }

    const out = [];
    for (let i = 0; i < players.length; i++) {
      const p = players[i];
      // Çoklu alan desteği
      let haystack = "";
      for (const f of fields) {
        if (p[f]) haystack += " " + normalize(String(p[f]));
      }
      if (!haystack) continue;

      let match = false;
      if (fuzzy) {
        // basit subsequence fuzzy
        let ti = 0, hi = 0;
        while (ti < normalizedTerm.length && hi < haystack.length) {
          if (haystack[hi] === normalizedTerm[ti]) ti++;
          hi++;
        }
        match = ti === normalizedTerm.length;
      } else {
        match = haystack.includes(normalizedTerm);
      }

      if (match) {
        out.push(p);
        if (out.length >= limit) break;
      }
    }
    return out;
  }, [players, normalizedTerm, minLength, returnAllIfEmpty, fields, fuzzy, limit]);
}