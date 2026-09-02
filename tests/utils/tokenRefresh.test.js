import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const mockSetToken = vi.fn()
const mockSetUser = vi.fn()
const mockSetAuthenticated = vi.fn()
const mockSetRefreshToken = vi.fn()
const mockSetError = vi.fn()
const mockFetch = vi.fn()

vi.mock('@/store/useAuthStore', () => ({
  default: {
    getState: vi.fn(() => ({
      isAuthenticated: true,
      token: 'old-token',
      refreshToken: 'stored-refresh',
      setToken: mockSetToken,
      setUser: mockSetUser,
      setAuthenticated: mockSetAuthenticated,
      setRefreshToken: mockSetRefreshToken,
      setError: mockSetError,
    })),
  },
}))

vi.mock('@/utils/authSession', () => ({
  getRefreshToken: vi.fn(() => 'stored-refresh'),
  setRefreshToken: vi.fn(),
  isRememberMe: vi.fn(() => true),
  decodeJwtPayload: vi.fn(() => ({ sub: 'user-1' })),
  tokenExpiresSoon: vi.fn(() => true),
}))

import useAuthStore from '@/store/useAuthStore'
import { setRefreshToken as persistRefreshToken, tokenExpiresSoon } from '@/utils/authSession'
import {
  applySession,
  tryRefreshToken,
  ensureFreshToken,
  setupTokenRefresh,
} from '@/utils/tokenRefresh'

describe('tokenRefresh', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    global.fetch = mockFetch
    useAuthStore.getState.mockReturnValue({
      isAuthenticated: true,
      token: 'old-token',
      refreshToken: 'stored-refresh',
      setToken: mockSetToken,
      setUser: mockSetUser,
      setAuthenticated: mockSetAuthenticated,
      setRefreshToken: mockSetRefreshToken,
      setError: mockSetError,
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('applySession actualiza token y usuario', () => {
    applySession({
      access_token: 'new-token',
      refresh_token: 'new-refresh',
      user: { sub: 'user-1' },
    }, true)

    expect(mockSetToken).toHaveBeenCalledWith('new-token')
    expect(mockSetUser).toHaveBeenCalledWith({ sub: 'user-1' })
    expect(persistRefreshToken).toHaveBeenCalledWith('new-refresh', true)
  })

  it('tryRefreshToken sincroniza el store cuando hay token nuevo', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: { access_token: 'new-token', refresh_token: 'new-refresh', user: { sub: 'user-1' } },
      }),
    })

    await expect(tryRefreshToken()).resolves.toBe(true)
    expect(mockSetToken).toHaveBeenCalledWith('new-token')
  })

  it('tryRefreshToken devuelve false si falla el refresh', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: async () => ({ success: false }),
    })

    await expect(tryRefreshToken()).resolves.toBe(false)
  })

  it('ensureFreshToken no refresca si el token sigue vigente', async () => {
    tokenExpiresSoon.mockReturnValue(false)

    await ensureFreshToken()

    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('setupTokenRefresh renueva al volver a la pestaña', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: { access_token: 'new-token', user: { sub: 'user-1' } },
      }),
    })
    const onRefreshFailed = vi.fn()
    setupTokenRefresh({ onRefreshFailed })

    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      value: 'visible',
    })
    document.dispatchEvent(new Event('visibilitychange'))

    await vi.waitFor(() => {
      expect(mockFetch).toHaveBeenCalled()
    })
    expect(onRefreshFailed).not.toHaveBeenCalled()
  })

  it('setupTokenRefresh ejecuta refresh periódico', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: { access_token: 'new-token', user: { sub: 'user-1' } },
      }),
    })
    setupTokenRefresh()

    await vi.advanceTimersByTimeAsync(30_000)

    expect(mockFetch).toHaveBeenCalled()
  })

  it('setupTokenRefresh llama onRefreshFailed si el refresh falla', async () => {
    const onRefreshFailed = vi.fn()
    mockFetch.mockResolvedValue({
      ok: false,
      json: async () => ({ success: false }),
    })

    setupTokenRefresh({ onRefreshFailed })
    await vi.advanceTimersByTimeAsync(30_000)

    await vi.waitFor(() => {
      expect(onRefreshFailed).toHaveBeenCalled()
    })
  })
})
