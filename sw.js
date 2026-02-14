// ============================================================
// LicitaMonitor v3.0 — Service Worker
// ============================================================

const CACHE_NAME = 'licitamonitor-v3.1';

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

  if (url.includes('pncp.gov.br/api') || url.includes('corsproxy.io')) {
    // API PNCP e proxies: não interceptar, deixar o código principal tratar erros
    return;
  } else if (url.includes('fonts.googleapis.com') || url.includes('fonts.gstatic.com')) {
    // Fontes Google: cache-first com fallback para rede
    evento.respondWith(
      caches.match(evento.request).then((cached) =>
        cached || fetch(evento.request).then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(evento.request, clone));
          return response;
        })
      )
    );
  } else {
    // Assets estáticos: cache-first
    evento.respondWith(
      caches.match(evento.request).then((cached) => cached || fetch(evento.request))
    );
  }
});
