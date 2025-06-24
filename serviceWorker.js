self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('tadabbur-cache').then(cache => {
      return cache.addAll([
        './',
        './index.html',
        './manifest.json',
        './madina.woff2'
      ]);
    })
  );
});

self.addEventListener('fetch', event => {
  const dataFiles = [
    './quran.json',
    './indonesian_complex_v1.0.xml',
    './quran.xml',
    './TerjemahID.xml',
    './id.jalalayn.xml'
  ];

  const reqPath = new URL(event.request.url).pathname.replace(location.pathname.replace(/\/$/, ''), '.');

  if (dataFiles.includes(reqPath)) {
    // network-first untuk file data
    event.respondWith(
      fetch(event.request).then(networkResponse => {
        caches.open('tadabbur-cache').then(cache => {
          cache.put(event.request, networkResponse.clone());
        });
        return networkResponse;
      }).catch(() => {
        return caches.match(event.request);
      })
    );
    return;
  }

  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match('./index.html').then(cachedResponse => {
        return cachedResponse || fetch('./index.html');
      })
    );
    return;
  }

  // cache first untuk lainnya
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      return cachedResponse || fetch(event.request).then(networkResponse => {
        caches.open('tadabbur-cache').then(cache => {
          cache.put(event.request, networkResponse.clone());
        });
        return networkResponse;
      });
    })
  );
});
