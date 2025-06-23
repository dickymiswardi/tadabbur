
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('tadabbur-cache').then(cache => {
      return cache.addAll([
        './',
        './index.html',
        './quran.json',
        './indonesian_complex_v1.0.xml',
        './quran.xml',
        './TerjemahID.xml',
        './id.jalalayn.xml',
        './manifest.json'
        // Tambah font/css/gambar jika ada
      ]);
    })
  );
});

self.addEventListener('fetch', event => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match('./index.html').then(cachedResponse => {
        return cachedResponse || fetch('./index.html');
      })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then(networkResponse => {
        return caches.open('tadabbur-cache').then(cache => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      }).catch(() => {
        return new Response("Konten tidak tersedia offline.", {
          status: 503,
          statusText: "Offline"
        });
      });
    })
  );
});
