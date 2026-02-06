const CACHE_NAME = "chronomind-v2";
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/favicon.svg"
];

// INSTALL
self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
});

// ACTIVATE
self.addEventListener("activate", (event) => {
  self.clients.claim();
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
});

// FETCH
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // ⚡ Assets estáticos → cacheFirst
  if (STATIC_ASSETS.includes(url.pathname)) {
    event.respondWith(cacheFirst(event.request));
    return;
  }

  // ⚡ APIs ou requisições POST/PUT/DELETE → networkOnly
  if (!["GET"].includes(event.request.method)) {
    return; // deixa passar para rede, nada de cache
  }

  // ⚡ GET dinâmico (API) → networkFirst
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/auth/")) {
    event.respondWith(networkFirst(event.request));
  }
});

// ====================
// Estrategias de cache
// ====================

// Cache para assets estáticos
async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  cache.put(request, response.clone());
  return response;
}

// Requisições dinâmicas (API/auth) → tenta rede primeiro
async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const response = await fetch(request);
    cache.put(request, response.clone());
    return response;
  } catch {
    // se a rede falhar, retorna do cache (somente se tiver)
    const cached = await cache.match(request);
    if (cached) return cached;
    throw new Error("Network error e cache vazio");
  }
}