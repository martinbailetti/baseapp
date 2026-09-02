import './i18n/index.js'
import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'
import ErrorBoundary from '@/components/ErrorBoundary'
import LoadingPage from '@/pages/LoadingPage'
import keycloak from '@/utils/keycloak'
import useAuthStore from '@/store/useAuthStore'
import { setupTokenRefresh } from '@/utils/tokenRefresh'

// ── Service Worker ─────────────────────────────────────────────────────────
if ('serviceWorker' in navigator && import.meta.env.DEV) {
  // En desarrollo, desregistrar cualquier SW previo para evitar interferencias con Vite HMR
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((r) => r.unregister())
  })
}

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  let reloading = false
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data?.type === 'SW_UPDATED' && !reloading) {
      reloading = true
      window.location.reload()
    }
  })
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!reloading) {
      reloading = true
      window.location.reload()
    }
  })
  navigator.serviceWorker.register('/sw.js').catch((err) => {
    console.error('[SW] Error al registrar el Service Worker:', err)
  })
}

// ── Inicialización de Keycloak ─────────────────────────────────────────────
const { setAuthenticated, setUser, setToken, setLoading, setError, reset } =
  useAuthStore.getState()

// Comprobar si hay tokens provenientes de un login por QR
const _qrTokens = (() => {
  try {
    const a = localStorage.getItem('qr_access_token')
    const r = localStorage.getItem('qr_refresh_token')
    if (a) {
      localStorage.removeItem('qr_access_token')
      localStorage.removeItem('qr_refresh_token')
    }
    return a ? { token: a, refreshToken: r || undefined } : null
  } catch { return null }
})()

keycloak
  .init({
    onLoad: _qrTokens ? 'check-sso' : 'login-required',
    checkLoginIframe: false,
    pkceMethod: 'S256',
    enableLogging: true, // Debug: ver logs de keycloak-js en consola
    ...(_qrTokens ?? {}),
  })
  .then((authenticated) => {
    if (authenticated) {
      setAuthenticated(true)
      setToken(keycloak.token ?? null)
      setUser(keycloak.tokenParsed ?? null)

      setupTokenRefresh({ onRefreshFailed: reset })
    } else {
      setAuthenticated(false)
    }
    setLoading(false)
  })
  .catch((err) => {
    console.error('Keycloak init error', err)
    setError('No se pudo conectar con el servidor de autenticación.')
    setLoading(false)
  })

const root = ReactDOM.createRoot(document.getElementById('root'))

let rendered = false
useAuthStore.subscribe((state) => {
  if (!state.isLoading && !rendered) {
    rendered = true
    root.render(
      <React.StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </React.StrictMode>
    )
  }
})

root.render(<LoadingPage />)
