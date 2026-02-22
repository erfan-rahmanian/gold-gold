const CACHE_NAME = 'gold-accounting-v1';
const OFFLINE_URL = '/index.html';

const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/gold-accounting.html',
  '/manifest.json',
  '/icons/icon-192.svg',
  '/icons/icon-512.svg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE_ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;
  // navigation requests -> try network first, fallback to cache
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).then(res => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(request, copy)).catch(()=>{});
        return res;
      }).catch(() => caches.match(OFFLINE_URL))
    );
    return;
  }

  // for other requests, try cache first then network
  event.respondWith(
    caches.match(request).then(cached => cached || fetch(request).then(res => {
      const r = res.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(request, r)).catch(()=>{});
      return res;
    })).catch(() => {})
  );
});
