/* BijakLearn Junior PWA — static assets only. Do NOT cache student data, tokens, Sheets calls or third-party requests. */
const VERSION = 'bijaklearn-static-v5';
const CORE = ['/', '/index.html', '/manifest.webmanifest', '/icons/icon.svg'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(VERSION).then(cache => cache.addAll(CORE)));
  self.skipWaiting();
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('bijaklearn-static-') && k !== VERSION).map(k => caches.delete(k))));
  self.clients.claim();
});
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  // Any future API or account data must always reach the server.
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/auth/') || url.pathname.startsWith('/private/')) return;
  if (req.mode === 'navigate') {
    event.respondWith(fetch(req).catch(async () => (await caches.match('/index.html')) || Response.error()));
    return;
  }
  if (!(/\.(?:js|css|png|jpg|jpeg|svg|webp|woff2?|webmanifest)$/.test(url.pathname))) return;
  event.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => {
    if (res.ok && res.type === 'basic') { const clone=res.clone(); caches.open(VERSION).then(c=>c.put(req,clone)); }
    return res;
  })));
});
