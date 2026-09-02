import './i18n/index.js'
import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'
import ErrorBoundary from '@/components/ErrorBoundary'
import LoadingPage from '@/pages/LoadingPage'
import useAuthStore from '@/store/useAuthStore'
import { applySession, setupTokenRefresh, tryRefreshToken } from '@/utils/tokenRefresh'
import { clearRefreshToken, decodeJwtPayload, getRefreshToken, isRememberMe, takeQrTokens } from '@/utils/authSession'

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

const { setAuthenticated, setUser, setToken, setRefreshToken, setLoading, setError, reset } =
  useAuthStore.getState()

const endSession = () => {
  clearRefreshToken()
  reset()
}

async function restoreSession() {
  const qrTokens = takeQrTokens()
  if (qrTokens?.token) {
    applySession({
      access_token: qrTokens.token,
      refresh_token: qrTokens.refreshToken,
      user: decodeJwtPayload(qrTokens.token),
    }, true)
    setupTokenRefresh({ onRefreshFailed: endSession })
    setLoading(false)
    return
  }

  const storedRefresh = getRefreshToken()
  if (storedRefresh) {
    setRefreshToken(storedRefresh)
    const restored = await tryRefreshToken()
    if (restored) {
      setupTokenRefresh({ onRefreshFailed: endSession })
      setLoading(false)
      return
    }
    clearRefreshToken()
    setAuthenticated(false)
    setToken(null)
    setUser(null)
    setRefreshToken(null)
  } else {
    setAuthenticated(false)
  }

  setError(null)
  setLoading(false)
}

restoreSession().catch((err) => {
  console.error('Auth restore error', err)
  setError('No se pudo restaurar la sesión.')
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
