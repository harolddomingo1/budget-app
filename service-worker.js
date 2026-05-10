const CACHE_NAME = "budget-app-v2-9-3-pwa-v1";
const APP_SHELL = [
  "./",
  "./budget_app_v2_9_3.html",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    ))
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  const request = event.request;
  const url = new URL(request.url);

  // Never cache Google Apps Script / Google requests. Those need live network.
  if (url.hostname.includes("google.com") || url.hostname.includes("googleusercontent.com") || url.hostname.includes("script.google.com")) {
    return;
  }

  // For page navigations: network first, cache fallback.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put("./budget_app_v2_9_3.html", copy));
          return response;
        })
        .catch(() => caches.match("./budget_app_v2_9_3.html"))
    );
    return;
  }

  // For app assets: cache first, network fallback.
  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;
      return fetch(request).then(response => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
        return response;
      });
    })
  );
});
