const CACHE_NAME = "ar-bijoy-exam-center-v3";

const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];


// ==============================
// INSTALL
// ==============================

self.addEventListener("install", event => {

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );

});


// ==============================
// ACTIVATE
// ==============================

self.addEventListener("activate", event => {

  event.waitUntil(

    caches.keys().then(keys => {

      return Promise.all(

        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))

      );

    }).then(() => self.clients.claim())

  );

});


// ==============================
// FETCH
// ==============================

self.addEventListener("fetch", event => {

  if (event.request.method !== "GET") return;

  event.respondWith(

    fetch(event.request)

      .then(response => {

        // Network থেকে নতুন file পাওয়া গেছে
        if (
          response &&
          response.status === 200 &&
          response.type === "basic"
        ) {

          const copy = response.clone();

          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, copy);
            });

        }

        return response;

      })

      .catch(() => {

        // Internet না থাকলে cached version দেখাবে
        return caches.match(event.request)
          .then(cached => {

            return cached || caches.match("./index.html");

          });

      })

  );

});
