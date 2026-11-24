const CACHE_NAME = 'health-map-v7';
const ASSETS = [
    './',
    './index.html',
    './style.css',
    './script.js',
    './privacy.html',
    './forest.webp',
    './bedroom.webp',
    './water.webp',
    './food.webp',
    './running.webp',
    './meditation.webp',
    './mountain.webp',
    './consultation.webp'
];


self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(ASSETS))
            .then(() => self.skipWaiting())
    );
});


self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
        ).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', e => {
    if (e.request.method !== 'GET') return;
    e.respondWith(
        caches.match(e.request).then(cached => {
            if (cached) return cached;
            return fetch(e.request).then(res => {
                if (res.ok && e.request.url.startsWith(self.location.origin)) {
                    const copy = res.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(e.request, copy));
                }
                return res;
            });
        })
    );
});
