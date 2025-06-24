const CACHE_NAME = 'delete-cache';
const FILES_TO_CACHE = [
  './',
  './index.html',
  './quran.json',
  './indonesian_complex_v1.0.xml',
  './quran.xml',
  './TerjemahID.xml',
  './id.jalalayn.xml',
  './manifest.json',
  './update-flag.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(FILES_TO_CACHE))
  );
});

self.addEventListener('fetch', event => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match('./index.html').then(cached => cached || fetch('./index.html'))
    );
    return;
  }

  const reqUrl = new URL(event.request.url);
  if (FILES_TO_CACHE.includes(`.${reqUrl.pathname}`)) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        const fetchPromise = fetch(event.request).then(networkRes => {
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, networkRes.clone()));
          return networkRes;
        }).catch(() => cached);
        return cached || fetchPromise;
      })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request).then(networkRes => {
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, networkRes.clone()));
        return networkRes;
      }).catch(() => {
        return new Response("Konten tidak tersedia offline.", { status: 503 });
      });
    })
  );
});
