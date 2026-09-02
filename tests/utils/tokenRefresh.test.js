import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const mockSetToken = vi.fn()
const mockSetUser = vi.fn()

vi.mock('@/store/useAuthStore', () => ({
  default: {
    getState: vi.fn(() => ({
      isAuthenticated: true,
      setToken: mockSetToken,
      setUser: mockSetUser,
    })),
  },
}))

vi.mock('@/utils/keycloak', () => ({
  default: {
    updateToken: vi.fn(),
    token: 'new-token',
    tokenParsed: { sub: 'user-1' },
    onTokenExpired: null,
  },
}))

import keycloak from '@/utils/keycloak'
import {
  syncTokenToStore,
  tryRefreshToken,
  ensureFreshToken,
  setupTokenRefresh,
} from '@/utils/tokenRefresh'
import useAuthStore from '@/store/useAuthStore'

describe('tokenRefresh', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    keycloak.updateToken.mockResolvedValue(false)
    useAuthStore.getState.mockReturnValue({
      isAuthenticated: true,
      setToken: mockSetToken,
      setUser: mockSetUser,
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('syncTokenToStore actualiza token y usuario', () => {
    syncTokenToStore()

    expect(mockSetToken).toHaveBeenCalledWith('new-token')
    expect(mockSetUser).toHaveBeenCalledWith({ sub: 'user-1' })
  })

  it('tryRefreshToken sincroniza el store cuando hay token nuevo', async () => {
    keycloak.updateToken.mockResolvedValue(true)

    await expect(tryRefreshToken(60)).resolves.toBe(true)

    expect(keycloak.updateToken).toHaveBeenCalledWith(60)
    expect(mockSetToken).toHaveBeenCalledWith('new-token')
  })

  it('tryRefreshToken devuelve false si falla el refresh', async () => {
    keycloak.updateToken.mockRejectedValue(new Error('expired'))

    await expect(tryRefreshToken()).resolves.toBe(false)
  })

  it('ensureFreshToken no refresca sin sesión activa', async () => {
    useAuthStore.getState.mockReturnValue({
      isAuthenticated: false,
      setToken: mockSetToken,
      setUser: mockSetUser,
    })

    await ensureFreshToken()

    expect(keycloak.updateToken).not.toHaveBeenCalled()
  })

  it('setupTokenRefresh renueva al volver a la pestaña', async () => {
    const onRefreshFailed = vi.fn()
    setupTokenRefresh({ onRefreshFailed })

    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      value: 'visible',
    })
    document.dispatchEvent(new Event('visibilitychange'))

    await vi.waitFor(() => {
      expect(keycloak.updateToken).toHaveBeenCalledWith(60)
    })
    expect(onRefreshFailed).not.toHaveBeenCalled()
  })

  it('setupTokenRefresh ejecuta refresh periódico', async () => {
    setupTokenRefresh()

    await vi.advanceTimersByTimeAsync(30_000)

    expect(keycloak.updateToken).toHaveBeenCalledWith(60)
  })

  it('setupTokenRefresh llama onRefreshFailed si el refresh falla', async () => {
    const onRefreshFailed = vi.fn()
    keycloak.updateToken.mockRejectedValue(new Error('session ended'))

    setupTokenRefresh({ onRefreshFailed })
    keycloak.onTokenExpired()

    await vi.waitFor(() => {
      expect(onRefreshFailed).toHaveBeenCalled()
    })
  })
})
