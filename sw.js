const CACHE_NAME = 'bonde-das-maravilhas-v1'

const STATIC_ASSETS = [
  '/bonde-das-maravilhas/',
  '/bonde-das-maravilhas/index.html',
  '/bonde-das-maravilhas/manifest.json',
  '/bonde-das-maravilhas/icon-192x192.png',
  '/bonde-das-maravilhas/icon-512x512.png',
]

// Install — cacheia assets estáticos
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS)
    })
  )
  self.skipWaiting()
})

// Activate — limpa caches antigos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  )
  self.clients.claim()
})

// Fetch — network first, fallback pro cache
self.addEventListener('fetch', (event) => {
  // Ignora requests não-GET e do Supabase (sempre precisa de rede)
  if (
    event.request.method !== 'GET' ||
    event.request.url.includes('supabase.co')
  ) {
    return
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cacheia resposta bem-sucedida
        if (response && response.status === 200) {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone)
          })
        }
        return response
      })
      .catch(() => {
        // Offline: tenta servir do cache
        return caches.match(event.request).then((cached) => {
          return cached || caches.match('/bonde-das-maravilhas/')
        })
      })
  )
})
