
const CACHE_NAME = "ar-bijoy-exam-center-v4";

const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

const STATIC_EXTENSIONS = [
  ".css",
  ".js",
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".svg",
  ".ico",
  ".woff",
  ".woff2",
  ".ttf"
];

// ==============================
// INSTALL
// ==============================

self.addEventListener("install", event => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);

      // One missing file should not break the entire installation.
      await Promise.allSettled(
        APP_SHELL.map(async path => {
          try {
            const response = await fetch(path, {
              cache: "reload"
            });

            if (response.ok && response.type === "basic") {
              await cache.put(path, response);
            }
          } catch (error) {
            console.warn("Could not cache:", path, error);
          }
        })
      );

      await self.skipWaiting();
    })()
  );
});

// ==============================
// ACTIVATE
// ==============================

self.addEventListener("activate", event => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();

      await Promise.all(
        keys
          .filter(key =>
            key.startsWith("ar-bijoy-exam-center-") &&
            key !== CACHE_NAME
          )
          .map(key => caches.delete(key))
      );

      await self.clients.claim();
    })()
  );
});

// ==============================
// FETCH
// ==============================

self.addEventListener("fetch", event => {
  const request = event.request;

  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Never intercept third-party requests, including Supabase.
  if (url.origin !== self.location.origin) return;

  // Never cache API, authentication, storage or realtime requests.
  const excludedPaths = [
    "/rest/v1/",
    "/auth/v1/",
    "/storage/v1/",
    "/functions/v1/",
    "/realtime/v1/"
  ];

  if (excludedPaths.some(path => url.pathname.includes(path))) {
    return;
  }

  // ==============================
  // PAGE NAVIGATION: NETWORK FIRST
  // ==============================

  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const response = await fetch(request);

          if (response.ok && response.type === "basic") {
            const cache = await caches.open(CACHE_NAME);
            await cache.put(request, response.clone());
          }

          return response;
        } catch (error) {
          const cached =
            await caches.match(request) ||
            await caches.match("./index.html") ||
            await caches.match("./");

          if (cached) return cached;

          return new Response("You are offline. Please reconnect.", {
            status: 503,
            headers: {
              "Content-Type": "text/plain; charset=utf-8"
            }
          });
        }
      })()
    );

    return;
  }

  // ==============================
  // STATIC ASSETS ONLY
  // ==============================

  const isStaticAsset = STATIC_EXTENSIONS.some(ext =>
    url.pathname.toLowerCase().endsWith(ext)
  );

  if (!isStaticAsset) return;

  event.respondWith(
    (async () => {
      try {
        const response = await fetch(request);

        if (response.ok && response.type === "basic") {
          const cache = await caches.open(CACHE_NAME);
          await cache.put(request, response.clone());
        }

        return response;
      } catch (error) {
        const cached = await caches.match(request);

        if (cached) return cached;

        return new Response("Asset unavailable offline.", {
          status: 503,
          headers: {
            "Content-Type": "text/plain; charset=utf-8"
          }
        });
      }
    })()
  );
});
