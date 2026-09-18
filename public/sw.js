// B-Tracker Service Worker for PWA Support
const CACHE_NAME = "btracker-cache-v1";
const STATIC_ASSETS = [
  "/",
  "/login",
  "/manifest.webmanifest",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  "/icons/icon-maskable-512x512.png",
  "/icons/apple-touch-icon.png"
];

// Install Event
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn("[SW] Cache addAll warning:", err);
      });
    })
  );
  self.skipWaiting();
});

// Activate Event
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event
self.addEventListener("fetch", (event) => {
  // Only handle GET requests
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // Don't intercept API routes, Next.js server actions, auth, or cross-origin requests
  if (
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/_next/data/") ||
    url.origin !== self.location.origin
  ) {
    return;
  }

  // Network-first with cache fallback for HTML documents and static assets
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Cache successful responses for icons and static files
        if (
          networkResponse &&
          networkResponse.status === 200 &&
          (url.pathname.startsWith("/icons/") || url.pathname === "/favicon.ico")
        ) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(async () => {
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }
        // Fallback for navigation requests
        if (event.request.mode === "navigate") {
          const rootCached = await caches.match("/");
          if (rootCached) return rootCached;
        }
        return new Response("Offline - B-Tracker", {
          status: 503,
          headers: { "Content-Type": "text/plain" },
        });
      })
  );
});
