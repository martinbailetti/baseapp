import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { LOCAL_STORAGE_KEYS } from '@/config/storageKeys'
import {
  clearRefreshToken,
  decodeJwtPayload,
  getRefreshToken,
  isRememberMe,
  setRefreshToken,
  takeQrTokens,
  tokenExpiresSoon,
} from '@/utils/authSession'

function makeJwt(payload) {
  const encode = (value) => {
    const json = JSON.stringify(value)
    return btoa(json)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/g, '')
  }

  return `header.${encode(payload)}.signature`
}

describe('authSession', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
    vi.restoreAllMocks()
  })

  afterEach(() => {
    localStorage.clear()
    sessionStorage.clear()
  })

  it('devuelve el refresh token desde localStorage o sessionStorage', () => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN, 'local-refresh')
    sessionStorage.setItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN, 'session-refresh')

    expect(getRefreshToken()).toBe('local-refresh')

    localStorage.removeItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN)
    expect(getRefreshToken()).toBe('session-refresh')

    sessionStorage.removeItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN)
    expect(getRefreshToken()).toBeNull()
  })

  it('guarda el refresh token según la opción de recordarme', () => {
    setRefreshToken('refresh-123', true)

    expect(localStorage.getItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN)).toBe('refresh-123')
    expect(localStorage.getItem(LOCAL_STORAGE_KEYS.REMEMBER_ME)).toBe('true')
    expect(sessionStorage.getItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN)).toBeNull()

    setRefreshToken('session-token', false)
    expect(sessionStorage.getItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN)).toBe('session-token')
    expect(localStorage.getItem(LOCAL_STORAGE_KEYS.REMEMBER_ME)).toBe('false')
  })

  it('limpia los tokens de sesión y los QR', () => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN, 'refresh-1')
    localStorage.setItem(LOCAL_STORAGE_KEYS.REMEMBER_ME, 'true')
    localStorage.setItem('qr_access_token', 'qr-access')
    localStorage.setItem('qr_refresh_token', 'qr-refresh')
    sessionStorage.setItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN, 'refresh-2')

    clearRefreshToken()

    expect(localStorage.getItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN)).toBeNull()
    expect(sessionStorage.getItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN)).toBeNull()
    expect(localStorage.getItem(LOCAL_STORAGE_KEYS.REMEMBER_ME)).toBeNull()
    expect(localStorage.getItem('qr_access_token')).toBeNull()
    expect(localStorage.getItem('qr_refresh_token')).toBeNull()
  })

  it('lee la opción de recordarme y toma los tokens QR', () => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.REMEMBER_ME, 'true')
    localStorage.setItem('qr_access_token', 'access-qr')
    localStorage.setItem('qr_refresh_token', 'refresh-qr')

    expect(isRememberMe()).toBe(true)
    expect(takeQrTokens()).toEqual({ token: 'access-qr', refreshToken: 'refresh-qr' })
    expect(localStorage.getItem('qr_access_token')).toBeNull()
    expect(localStorage.getItem('qr_refresh_token')).toBeNull()
  })

  it('decodifica un JWT válido y devuelve null con payload inválido', () => {
    const payload = { sub: 'user-42', role: 'admin', exp: 9999999999 }
    const token = makeJwt(payload)

    expect(decodeJwtPayload(token)).toEqual(payload)
    expect(decodeJwtPayload('no-valid')).toBeNull()
    expect(decodeJwtPayload(null)).toBeNull()
  })

  it('detecta si un token expira pronto', () => {
    vi.spyOn(Date, 'now').mockReturnValue(1_700_000_000_000)

    const soonToken = makeJwt({ exp: Math.floor(Date.now() / 1000) + 10 })
    const safeToken = makeJwt({ exp: Math.floor(Date.now() / 1000) + 3600 })

    expect(tokenExpiresSoon(soonToken, 60)).toBe(true)
    expect(tokenExpiresSoon(safeToken, 60)).toBe(false)
    expect(tokenExpiresSoon('bad-token', 60)).toBe(true)
  })
})
