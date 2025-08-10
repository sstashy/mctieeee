import { useMemo } from 'react';

// Tek bir boş referans (yeniden yaratma yok)
const EMPTY = Object.freeze([]);

/**
 * Accent / diakritik temizleme
 */
function normalize(str) {
  if (typeof str !== 'string') return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim();
}

/**
 * Index inşa
 */
function buildIndex(players, fields) {
  const idx = new Array(players.length);
  for (let i = 0; i < players.length; i++) {
    const p = players[i];
    let hay = '';
    for (let j = 0; j < fields.length; j++) {
      const f = fields[j];
      const v = p && p[f];
      if (v) {
        hay += ' ' + normalize(String(v));
      }
    }
    idx[i] = { ref: p, haystack: hay };
  }
  return idx;
}

/**
 * usePlayerSearch
 */
export default function usePlayerSearch(
  players,
  search,
  {
    minLength = 0,
    returnAllIfEmpty = true,
    fields = ['name'],
    fuzzy = false,
    limit = Infinity,
    index = true,
  } = {},
) {
  // Defansif normalizasyon
  const safePlayers = Array.isArray(players) ? players : EMPTY;
  const safeFields = Array.isArray(fields) && fields.length > 0 ? fields : ['name'];
  const term = normalize(search || '');

  // limit sayısal değilse Infinity
  const hardLimit = typeof limit === 'number' && limit > 0 ? limit : Infinity;

  // Index (players referansı değişirse yeniden)
  const indexed = useMemo(() => {
    if (safePlayers.length === 0) return EMPTY;
    if (!index) {
      // inline index
      return safePlayers.map((p) => ({
        ref: p,
        haystack: safeFields.map((f) => normalize(p && p[f] ? String(p[f]) : '')).join(' '),
      }));
    }
    return buildIndex(safePlayers, safeFields);
  }, [safePlayers, safeFields, index]);

  // Arama
  const results = useMemo(() => {
    // Boş index
    if (!indexed || indexed.length === 0) {
      return returnAllIfEmpty && term === '' ? safePlayers : EMPTY;
    }

    // Arama terimi boş
    if (term === '') {
      return returnAllIfEmpty ? safePlayers : EMPTY;
    }

    if (term.length < minLength) return EMPTY;

    const out = [];
    const termLen = term.length;
    const useFuzzy = !!fuzzy;

    // Döngü
    for (let i = 0; i < indexed.length; i++) {
      const node = indexed[i];
      if (!node) continue;
      const haystack = node.haystack;
      if (!haystack) continue;

      let match = false;

      if (useFuzzy) {
        // Basit subsequence fuzzy eşleşmesi
        let ti = 0;
        for (let hi = 0; hi < haystack.length && ti < termLen; hi++) {
          if (haystack[hi] === term[ti]) ti++;
        }
        match = ti === termLen;
      } else {
        if (haystack.includes(term)) match = true;
      }

      if (match) {
        out.push(node.ref);
        if (out.length >= hardLimit) break;
      }
    }

    return out.length ? out : EMPTY;
  }, [indexed, term, minLength, returnAllIfEmpty, fuzzy, hardLimit, safePlayers]);

  return results;
}
