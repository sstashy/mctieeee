/* Basit SW: static + font + avatar cache (stale-while-revalidate) */
const STATIC_CACHE = "static-v1";
const RUNTIME_CACHE = "runtime-v1";
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/src/styles/index.css"
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(STATIC_CACHE).then(cache => cache.addAll(STATIC_ASSETS))
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== STATIC_CACHE && k !== RUNTIME_CACHE)
          .map(k => caches.delete(k))
      )
    )
  );
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);

  // API isteklerini cache'leme (dinamik) – opsiyonel
  if (url.pathname.startsWith("/api.php")) {
    return;
  }

  // Avatar veya font / static (stale-while-revalidate)
  if (
    url.origin === location.origin ||
    url.hostname.includes("minotar") ||
    url.pathname.endsWith(".woff2")
  ) {
    e.respondWith(
      caches.match(e.request).then(cached => {
        const fetchPromise = fetch(e.request)
          .then(res => {
            const clone = res.clone();
            caches.open(RUNTIME_CACHE).then(cache => cache.put(e.request, clone));
            return res;
          })
          .catch(() => cached);
        return cached || fetchPromise;
      })
    );
  }
});