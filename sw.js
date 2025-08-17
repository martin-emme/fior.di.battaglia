const CACHE_NAME = 'fior-di-battaglia-v1';
const urlsToCache = [
  '/fior-di-battaglia/',
  '/fior-di-battaglia/fior-di-battaglia.html',
  '/fior-di-battaglia/gioco.js',
  '/fior-di-battaglia/stile.css',
  '/fior-di-battaglia/broders.png',
  '/fior-di-battaglia/titolo1.jpg',
  '/fior-di-battaglia/icon-192.png',
  '/fior-di-battaglia/icon-512.png'
];

// Installa il service worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache aperta');
        return cache.addAll(urlsToCache);
      })
  );
});

// Intercetta le richieste
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Restituisci dalla cache se disponibile
        if (response) {
          return response;
        }
        // Altrimenti fai la richiesta alla rete
        return fetch(event.request);
      }
    )
  );
});
