const CACHE_NAME = 'mg-pwa-cache-v1'
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/src/main.jsx',
  '/src/App.jsx',
  '/src/App.css',
  '/src/index.css',
  '/favicon.svg',
  '/manifest.json',
]

// Install service worker and cache static assets
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Cache pre-cargado con recursos estáticos')
        return cache.addAll(ASSETS_TO_CACHE)
      })
      .then(() => self.skipWaiting())
  )
})

// Activate service worker and clear old caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) => {
        return Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME) {
              console.log('[Service Worker] Limpiando cache antigua:', key)
              return caches.delete(key)
            }
          })
        )
      })
      .then(() => self.clients.claim())
  )
})

// Fetch event handler
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url)

  // Separate API requests from static files
  if (url.pathname.startsWith('/api')) {
    e.respondWith(
      fetch(e.request).catch(() => {
        // Fallback for API operations when offline
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Offline',
            message:
              'No tienes conexión a internet para realizar operaciones en tiempo real en la base de datos.',
          }),
          {
            status: 503,
            headers: { 'Content-Type': 'application/json' },
          }
        )
      })
    )
  } else {
    // Stale-While-Revalidate strategy for static resources
    e.respondWith(
      caches.match(e.request).then((cachedResponse) => {
        if (cachedResponse) {
          // Update cache in the background
          fetch(e.request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                caches.open(CACHE_NAME).then((cache) => cache.put(e.request, networkResponse))
              }
            })
            .catch(() => {
              /* Ignore network update errors when offline */
            })
          return cachedResponse
        }
        return fetch(e.request)
      })
    )
  }
})
