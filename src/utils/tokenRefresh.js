import keycloak from '@/utils/keycloak'
import useAuthStore from '@/store/useAuthStore'
import {
  TOKEN_REFRESH_INTERVAL_MS,
  TOKEN_MIN_VALIDITY_SECONDS,
} from '@/config/defaults'

export function syncTokenToStore() {
  const { setToken, setUser } = useAuthStore.getState()
  setToken(keycloak.token ?? null)
  setUser(keycloak.tokenParsed ?? null)
}

/**
 * Intenta renovar el token de Keycloak y sincroniza el store.
 * @param {number} minValidity Segundos de validez mínima restante (-1 = forzar si expiró).
 * @returns {Promise<boolean>} true si se obtuvo un token nuevo.
 */
export async function tryRefreshToken(minValidity = -1) {
  try {
    const refreshed = await keycloak.updateToken(minValidity)
    if (refreshed) {
      syncTokenToStore()
    }
    return refreshed
  } catch {
    return false
  }
}

/**
 * Renueva el token si está a punto de expirar, antes de una petición API.
 */
export async function ensureFreshToken(minValidity = TOKEN_MIN_VALIDITY_SECONDS) {
  if (!useAuthStore.getState().isAuthenticated) return
  await tryRefreshToken(minValidity)
}

/**
 * Mantiene la sesión activa aunque la pestaña quede inactiva mucho tiempo.
 * Los navegadores ralentizan setTimeout en pestañas en segundo plano, por lo que
 * onTokenExpired de Keycloak puede no dispararse a tiempo.
 */
export function setupTokenRefresh({ onRefreshFailed } = {}) {
  const refresh = () =>
    keycloak
      .updateToken(TOKEN_MIN_VALIDITY_SECONDS)
      .then((refreshed) => {
        if (refreshed) syncTokenToStore()
      })
      .catch(() => {
        if (onRefreshFailed) onRefreshFailed()
      })

  keycloak.onTokenExpired = refresh

  const intervalId = setInterval(refresh, TOKEN_REFRESH_INTERVAL_MS)

  const onVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      refresh()
    }
  }
  document.addEventListener('visibilitychange', onVisibilityChange)

  return () => {
    clearInterval(intervalId)
    document.removeEventListener('visibilitychange', onVisibilityChange)
  }
}
