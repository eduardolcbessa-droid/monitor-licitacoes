const CACHE_NAME = 'monitor-licit-v1.1';
const STATIC_ASSETS = ['./index.html', './manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(STATIC_ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.url.includes('pncp.gov.br/api')) {
    e.respondWith(fetch(e.request).catch(() => new Response(JSON.stringify({data:[],totalPaginas:0}), {headers:{'Content-Type':'application/json'}})));
  } else {
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
  }
});
