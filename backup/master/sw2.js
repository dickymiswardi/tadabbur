const CACHE_NAME = 'alquran-v1';

// Semua file yang harus tersedia offline
const ASSETS_TO_CACHE = [
  '/', // penting untuk start_url "/"
  '/index.html',
  '/manifest.json',
  '/madina.woff2',

  // Data dari GitHub
  'https://raw.githubusercontent.com/dickymiswardi/tadabbur/refs/heads/main/quran.json',
  'https://raw.githubusercontent.com/dickymiswardi/tadabbur/refs/heads/main/quran.xml',
  'https://raw.githubusercontent.com/dickymiswardi/tadabbur/refs/heads/main/indonesian_complex_v1.0.xml',
  'https://raw.githubusercontent.com/dickymiswardi/tadabbur/refs/heads/main/TerjemahID.xml'
];

// Saat install → cache semua asset
self.addEventListener('install', event => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      // Tambah file lokal
      await cache.addAll(ASSETS_TO_CACHE);

      console.log('✅ Semua aset berhasil dicache.');
    })()
  );
  self.skipWaiting();
});

// Saat activate → langsung ambil alih halaman
self.addEventListener('activate', event => {
  event.waitUntil(clients.claim());
});

// Saat fetch → layani dari cache jika tersedia
self.addEventListener('fetch', event => {
  const reqUrl = new URL(event.request.url);

  // Biarkan fetch langsung untuk audio atau URL eksternal selain 4 file di atas
  if (
    reqUrl.hostname.includes('ksu.edu.sa') || // Audio Qur'an
    (reqUrl.hostname.includes('githubusercontent.com') &&
     !ASSETS_TO_CACHE.includes(reqUrl.href)) // Bukan file yang kita izinkan cache
  ) {
    return;
  }

  // Coba ambil dari cache, jika tidak ada → ambil online
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
