// Ronch Production Floor · offline cache (network first, cache as fallback)
const CACHE = "ronch-floor-v5";
const SHELL = ["./", "index.html", "manifest.json", "icons/icon-192.png", "icons/icon-512.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET") return;
  // never cache Firebase data or auth traffic
  if (/googleapis\.com$/.test(u.hostname) && !/fonts\.googleapis\.com$/.test(u.hostname)) return;
  e.respondWith(fetch(e.request).then(r => {
    if (r.ok && (u.origin === location.origin || /gstatic\.com|cdnjs\.cloudflare\.com|fonts\.googleapis\.com/.test(u.hostname))) {
      const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy));
    }
    return r;
  }).catch(() => caches.match(e.request).then(m => m || caches.match("index.html"))));
});
