// ============================================================
// LicitaMonitor v3.2 — Service Worker
// ============================================================

const CACHE_NAME = 'licitamonitor-v3.2';

const ASSETS_TO_CACHE = [
  './index.html',
  './manifest.json',
];

// Instalação: pré-cachear arquivos essenciais
self.addEventListener('install', (evento) => {
  evento.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

// Ativação: limpar caches antigos
self.addEventListener('activate', (evento) => {
  evento.waitUntil(
    caches.keys().then((nomes) =>
      Promise.all(
        nomes
          .filter((nome) => nome !== CACHE_NAME)
          .map((nome) => caches.delete(nome))
      )
    )
  );
  self.clients.claim();
});

// Fetch: estratégias diferentes por tipo de requisição
self.addEventListener('fetch', (evento) => {
  const url = evento.request.url;

  // API PNCP e proxies CORS: NUNCA interceptar
  if (url.includes('pncp.gov.br/api') ||
      url.includes('corsproxy.io') ||
      url.includes('allorigins.win') ||
      url.includes('corsproxy.org')) {
    return;
  }

  // HTML: network-first (garante código atualizado)
  if (evento.request.mode === 'navigate' || url.endsWith('.html') || url.endsWith('/')) {
    evento.respondWith(
      fetch(evento.request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(evento.request, clone));
          return response;
        })
        .catch(() => caches.match(evento.request))
    );
    return;
  }

  // Fontes Google: cache-first
  if (url.includes('fonts.googleapis.com') || url.includes('fonts.gstatic.com')) {
    evento.respondWith(
      caches.match(evento.request).then((cached) =>
        cached || fetch(evento.request).then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(evento.request, clone));
          return response;
        })
      )
    );
    return;
  }

  // Outros assets: cache-first
  evento.respondWith(
    caches.match(evento.request).then((cached) => cached || fetch(evento.request))
  );
});
