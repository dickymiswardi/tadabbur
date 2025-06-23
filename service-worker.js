const CACHE_NAME = "quran-pwa-v1";
const urlsToCache = [
  "/",
  "/index.html",
  "/manifest.json",
  "/madina.woff2",
  "/quran.json",
  "/indonesian_complex_v1.0.xml",
  "/quran.xml",
  "/TerjemahID.xml",
  "/id.jalalayn.xml"
];

// Pre-cache saat install
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

// Fetch handler
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) return response;

      // Jika bukan file statis, fallback ke index.html (untuk URL dinamis)
      if (event.request.mode === 'navigate') {
        return caches.match('/index.html');
      }

      // Atau ambil dari network jika belum ada di cache
      return fetch(event.request);
    })
  );
});
