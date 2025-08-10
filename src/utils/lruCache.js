// tiny-lru v11+ => named export: { lru }
// Docs: https://github.com/avoidwork/tiny-lru
import { lru } from 'tiny-lru';

/**
 * createLRU
 * Basit sarmalayıcı: API benzerliğini koruyor ve
 * ileride kolayca değiştirilebilir hale getiriyor.
 */
export function createLRU({ max = 100, ttl = 60_000 } = {}) {
  const cache = lru(max, ttl);

  return {
    get(key) {
      return cache.get(key);
    },
    set(key, value) {
      cache.set(key, value);
      return value;
    },
    has(key) {
      return cache.has(key);
    },
    delete(key) {
      return cache.delete(key);
    },
    clear() {
      cache.clear();
    },
    // Gerekirse orijinal nesne
    raw: cache,
  };
}
