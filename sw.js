// sw.js
self.addEventListener('install', (e) => {
  console.log('Service Worker installed');
});
self.addEventListener('fetch', (e) => {
  // optional cache strategy here
});
