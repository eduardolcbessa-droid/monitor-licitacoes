const CACHE_NAME='licitamonitor-v2';
const ASSETS=['./index.html','./manifest.json'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(ASSETS)));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(n=>n!==CACHE_NAME).map(n=>caches.delete(n)))));self.clients.claim()});
self.addEventListener('fetch',e=>{if(e.request.url.includes('pncp.gov.br/api')){e.respondWith(fetch(e.request).catch(()=>new Response(JSON.stringify({data:[],totalPaginas:0}),{headers:{'Content-Type':'application/json'}})))}else{e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)))}});
