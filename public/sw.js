/* Public offline shell only — never cache auth, API responses, personal data or private content. */
const VERSION = 'bijaklearn-static-v9'; // replaced by scripts/stamp-release.mjs on build
const BASE = new URL(self.registration.scope).pathname;
const BUNDLED_ASSETS = []; // populated by scripts/stamp-release.mjs
const CORE = ['index.html', 'manifest.webmanifest', 'icons/icon.svg', ...BUNDLED_ASSETS].map(path => BASE + path);
self.addEventListener('install', event => {
 event.waitUntil((async () => {
  const cache = await caches.open(VERSION);
  await cache.addAll(CORE.map(path => new Request(path, {cache: 'reload'})));
  await self.skipWaiting();
 })());
});
self.addEventListener('activate', event => {
 event.waitUntil((async () => {
  const keys = await caches.keys();
  await Promise.all(keys.filter(k => k.startsWith('bijaklearn-static-') && k !== VERSION).map(k => caches.delete(k)));
  await self.clients.claim();
  const clients=await self.clients.matchAll({type:'window',includeUncontrolled:true});
  clients.forEach(client=>client.postMessage({type:'BIJAK_RELEASE_ACTIVATED',version:VERSION}));
 })());
});
self.addEventListener('fetch', event => {
 const req=event.request;
 if(req.method !== 'GET')return;
 const url=new URL(req.url);
 if(url.origin !== self.location.origin || !url.pathname.startsWith(BASE))return;
 const pathWithinApp='/'+url.pathname.slice(BASE.length);
 if(pathWithinApp.startsWith('/api/') || pathWithinApp.startsWith('/auth/') || pathWithinApp.startsWith('/private/'))return;
 // Any navigation first requests the newest HTML. The cache is an offline fallback only.
 if(req.mode==='navigate'){
  event.respondWith(fetch(req,{cache:'no-store'}).catch(async()=>{
   const cache=await caches.open(VERSION);
   return await cache.match(BASE+'index.html')||Response.error();
  }));
  return;
 }
 if(!(/\.(?:js|css|png|jpg|jpeg|svg|webp|woff2?|webmanifest)$/.test(url.pathname)))return;
 const isImmutable=/\/assets\/[^/]+-[A-Za-z0-9_-]{8,}\.(?:js|css)$/.test(pathWithinApp);
 if(isImmutable){
  event.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(res=>{
   if(res.ok&&res.type==='basic'){const clone=res.clone();event.waitUntil(caches.open(VERSION).then(c=>c.put(req,clone)))}
   return res;
  })));
  return;
 }
 // Brand icons, fonts and manifest are network first: updates don't remain stuck in an old app cache.
 event.respondWith(fetch(req,{cache:'no-store'}).then(res=>{
  if(res.ok&&res.type==='basic'){const clone=res.clone();event.waitUntil(caches.open(VERSION).then(c=>c.put(req,clone)))}
  return res;
 }).catch(async()=>await caches.match(req)||Response.error()));
});
