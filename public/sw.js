const CACHE = "rf-analyzer-v1";
const PRECACHE = ["/", "/icon.svg", "/manifest.json"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

function remember(request, response) {
  if (!response || !response.ok) return response;
  const copy = response.clone();
  caches.open(CACHE).then((cache) => cache.put(request, copy));
  return response;
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  const isStatic = url.pathname.startsWith("/_next/static/") || PRECACHE.includes(url.pathname);

  if (isStatic && request.mode !== "navigate") {
    event.respondWith(
      caches.match(request).then((hit) => hit || fetch(request).then((response) => remember(request, response)))
    );
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => remember(request, response))
      .catch(() =>
        caches.match(request).then((hit) => hit || (request.mode === "navigate" ? caches.match("/") : undefined))
      )
  );
});
