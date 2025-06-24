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
        './madina.woff2',
        './manifest.json'
        // Tambahkan file lain jika ada (css, icon, dsb)
      ]);
    })
  );
});

self.addEventListener('fetch', event => {
  if (event.request.mode === 'navigate') {
    // Cache first untuk navigasi, update di background
    event.respondWith(
      caches.match('./index.html').then(cachedResponse => {
        const fetchPromise = fetch('./index.html').then(networkResponse => {
          caches.open('tadabbur-cache').then(cache => {
            cache.put('./index.html', networkResponse.clone());
          });
          return networkResponse;
        }).catch(() => cachedResponse);
        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  const dataFiles = [
    './quran.json',
    './indonesian_complex_v1.0.xml',
    './quran.xml',
    './TerjemahID.xml',
    './id.jalalayn.xml'
  ];

  const reqPath = new URL(event.request.url).pathname.replace(location.pathname.replace(/\/$/, ''), '.');

  if (dataFiles.includes(reqPath)) {
    event.respondWith(
      caches.match(event.request).then(cachedResponse => {
        const fetchPromise = fetch(event.request).then(networkResponse => {
          caches.open('tadabbur-cache').then(cache => {
            cache.put(event.request, networkResponse.clone());
          });
          return networkResponse;
        }).catch(() => cachedResponse);
        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // Default cache first untuk asset lain
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      return cachedResponse || fetch(event.request).then(networkResponse => {
        caches.open('tadabbur-cache').then(cache => {
          cache.put(event.request, networkResponse.clone());
        });
        return networkResponse;
      }).catch(() => {
        return new Response("Konten tidak tersedia offline.", {
          status: 503,
          statusText: "Offline"
        });
      });
    })
  );
});
