import { LOCAL_STORAGE_KEYS } from '@/config/storageKeys'

export function getRefreshToken() {
  try {
    return (
      localStorage.getItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN)
      || sessionStorage.getItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN)
      || null
    )
  } catch {
    return null
  }
}

export function setRefreshToken(token, rememberMe) {
  clearRefreshToken()
  if (!token) return
  try {
    const store = rememberMe ? localStorage : sessionStorage
    store.setItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN, token)
    localStorage.setItem(LOCAL_STORAGE_KEYS.REMEMBER_ME, String(Boolean(rememberMe)))
  } catch {
    /* noop */
  }
}

export function clearRefreshToken() {
  try {
    localStorage.removeItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN)
    sessionStorage.removeItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN)
    localStorage.removeItem(LOCAL_STORAGE_KEYS.REMEMBER_ME)
    localStorage.removeItem('qr_access_token')
    localStorage.removeItem('qr_refresh_token')
  } catch {
    /* noop */
  }
}

export function isRememberMe() {
  try {
    return localStorage.getItem(LOCAL_STORAGE_KEYS.REMEMBER_ME) === 'true'
  } catch {
    return false
  }
}

export function takeQrTokens() {
  try {
    const token = localStorage.getItem('qr_access_token')
    const refreshToken = localStorage.getItem('qr_refresh_token')
    if (token) {
      localStorage.removeItem('qr_access_token')
      localStorage.removeItem('qr_refresh_token')
    }
    return token ? { token, refreshToken: refreshToken || null } : null
  } catch {
    return null
  }
}

export function decodeJwtPayload(token) {
  if (!token || typeof token !== 'string') return null
  const parts = token.split('.')
  if (parts.length !== 3) return null
  try {
    const padded = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const padLen = (4 - (padded.length % 4)) % 4
    const json = atob(padded + '='.repeat(padLen))
    return JSON.parse(json)
  } catch {
    return null
  }
}

export function tokenExpiresSoon(token, minValiditySeconds) {
  const payload = decodeJwtPayload(token)
  if (!payload || !payload.exp) return true
  return payload.exp * 1000 - Date.now() < minValiditySeconds * 1000
}
