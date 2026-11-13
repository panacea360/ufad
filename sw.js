const CACHE_NAME = 'ufad-app-v1';
const ASSETS_TO_CACHE = [
  './login.html',
  './donor-dashboard.html',
  './member-dashboard.html',
  './admin-dashboard.html',
  './manifest.json',
  'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Playfair+Display:wght@600;700;800&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',
  'https://i.ibb.co/h1smPWMH/UFAD.png'
];

// Install Event - Cache the files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate Event - Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event - Serve cached content, then fetch from network
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests (POST to Supabase must always go to the network)
  if (event.request.method !== 'GET') return;
  
  // Skip Supabase API calls (Don't cache database data)
  if (event.request.url.includes('supabase.co')) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        // Cache the new response for next time
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, networkResponse.clone());
        });
        return networkResponse;
      }).catch(() => {
        // If offline, fall back to cache
        return cachedResponse;
      });

      return cachedResponse || fetchPromise;
    })
  );
});
