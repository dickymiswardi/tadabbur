self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('tadabbur-cache').then(cache => {
      return cache.addAll([
        '/',
        '/index.html',
        '/quran.json',
        '/indonesian_complex_v1.0.xml',
        '/quran.xml',
        '/TerjemahID.xml',
        '/id.jalalayn.xml',
        '/manifest.json',
        // tambahkan font, css, gambar dll jika ada
      ]);
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      // cache first, fallback to network
      return response || fetch(event.request).then(fetchRes => {
        // optionally cache new fetch
        return caches.open('tadabbur-cache').then(cache => {
          cache.put(event.request, fetchRes.clone());
          return fetchRes;
        });
      });
    })
  );
});
