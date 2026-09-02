// BUILD_ID se reemplaza automáticamente en cada build por scripts/stamp-sw.js
const BUILD_ID = '__BUILD_ID__'
const CACHE_NAME = 'app-' + BUILD_ID

const STATIC_ASSETS = ['/', '/index.html', '/favicon.ico']

function normalizeNotificationPayload(raw) {
  const normalized = {
    type: 'INFO',
  }

  const input = raw && typeof raw === 'object' ? raw : {}
  const type = typeof input.type === 'string' ? input.type.toUpperCase() : ''

  if (type === 'APP_UPDATE') {
    normalized.type = 'APP_UPDATE'
    if (typeof input.version === 'string' && input.version.trim()) {
      normalized.version = input.version.trim()
    }
    return normalized
  }

  if (type === 'NAVIGATE') {
    normalized.type = 'NAVIGATE'
    if (typeof input.url === 'string' && input.url.trim()) {
      normalized.url = input.url.trim()
    } else {
      normalized.url = '/'
    }
    return normalized
  }

  if (type === 'INFO') {
    normalized.type = 'INFO'
  }

  if (typeof input.message === 'string' && input.message.trim()) {
    normalized.message = input.message.trim()
  }

  return normalized
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) =>
        Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
      )
      .then(() => {
        // Notificar a los clientes que hay una nueva versión
        self.clients.matchAll().then((clients) => {
          clients.forEach((client) => {
            client.postMessage({ type: 'SW_UPDATED', buildId: BUILD_ID })
          })
        })
        return self.clients.claim()
      })
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  if (url.origin !== location.origin) return
  if (url.pathname.startsWith('/api/') || url.pathname.includes('oauth')) return

  // Network First con fallback a caché
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.status === 200) {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
        }
        return response
      })
      .catch(() =>
        caches.match(request).then((cached) => {
          if (cached) return cached
          if (request.mode === 'navigate') return caches.match('/')
          return new Response('Offline', { status: 503 })
        })
      )
  )
})

self.addEventListener('push', (event) => {
  let data = {
    title: 'Notificacion',
    body: '',
    data: {
      type: 'INFO',
    },
  }

  try {
    if (event.data) {
      data = { ...data, ...(event.data.json() || {}) }
    }
  } catch (_) {
    // Si el payload no es JSON, usar fallback seguro
  }

  event.waitUntil(
    self.registration.showNotification(data.title || 'Notificacion', {
      body: data.body || '',
      icon: '/android-icon-192x192.png',
      badge: '/favicon-96x96.png',
      data: normalizeNotificationPayload(
        data.data || {
          type: data.type,
          url: data.url,
          version: data.version,
          message: data.message,
        }
      ),
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const payload = normalizeNotificationPayload(event.notification?.data)

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientsArr) => {
      if (!clientsArr.length) {
        const fallbackUrl = payload.type === 'NAVIGATE' ? payload.url || '/' : '/'
        if (self.clients.openWindow) {
          return self.clients.openWindow(fallbackUrl)
        }
        return undefined
      }

      clientsArr.forEach((client) => {
        client.postMessage({
          type: 'HANDLE_NOTIFICATION',
          payload,
        })
      })

      const preferred = clientsArr[0]
      if (preferred && 'focus' in preferred) {
        return preferred.focus()
      }

      return undefined
    })
  )
})
