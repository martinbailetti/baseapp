import useAuthStore from '@/store/useAuthStore'
import { API_URL, TOKEN_MIN_VALIDITY_SECONDS, TOKEN_REFRESH_INTERVAL_MS } from '@/config/defaults'
import {
  getRefreshToken,
  setRefreshToken as persistRefreshToken,
  isRememberMe,
  decodeJwtPayload,
  tokenExpiresSoon,
} from '@/utils/authSession'

export function applySession(data, rememberMe) {
  const { setAuthenticated, setToken, setUser, setRefreshToken, setError } = useAuthStore.getState()
  const accessToken = data?.access_token || null
  const refreshToken = data?.refresh_token || null
  const user = data?.user || decodeJwtPayload(accessToken)

  setToken(accessToken)
  setUser(user)
  if (refreshToken) {
    setRefreshToken(refreshToken)
    persistRefreshToken(refreshToken, rememberMe ?? isRememberMe())
  }
  setAuthenticated(Boolean(accessToken))
  setError(null)
}

/**
 * Renueva el access token con el refresh token almacenado.
 * @returns {Promise<boolean>}
 */
export async function tryRefreshToken() {
  const refreshToken = useAuthStore.getState().refreshToken || getRefreshToken()
  if (!refreshToken) return false

  try {
    const res = await fetch(`${API_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    })
    const json = await res.json().catch(() => null)
    if (!res.ok || !json?.success || !json?.data?.access_token) {
      return false
    }
    applySession(json.data)
    return true
  } catch {
    return false
  }
}

/**
 * Renueva el token si está a punto de expirar, antes de una petición API.
 */
export async function ensureFreshToken(minValidity = TOKEN_MIN_VALIDITY_SECONDS) {
  const token = useAuthStore.getState().token
  const hasRefresh = Boolean(useAuthStore.getState().refreshToken || getRefreshToken())
  if (!token && !hasRefresh) return
  if (!token || tokenExpiresSoon(token, minValidity)) {
    if (!hasRefresh) return
    await tryRefreshToken()
  }
}

let stopTokenRefresh = null

/**
 * Mantiene la sesión activa aunque la pestaña quede inactiva mucho tiempo.
 */
export function setupTokenRefresh({ onRefreshFailed } = {}) {
  if (stopTokenRefresh) {
    stopTokenRefresh()
    stopTokenRefresh = null
  }

  const refresh = () => {
    const hadRefresh = Boolean(useAuthStore.getState().refreshToken || getRefreshToken())
    if (!hadRefresh) return Promise.resolve()
    return tryRefreshToken().then((ok) => {
      if (!ok && onRefreshFailed) {
        onRefreshFailed()
      }
    })
  }

  const intervalId = setInterval(refresh, TOKEN_REFRESH_INTERVAL_MS)

  const onVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      refresh()
    }
  }
  document.addEventListener('visibilitychange', onVisibilityChange)

  stopTokenRefresh = () => {
    clearInterval(intervalId)
    document.removeEventListener('visibilitychange', onVisibilityChange)
  }

  return stopTokenRefresh
}
