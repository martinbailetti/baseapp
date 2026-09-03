import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockReset = vi.fn()
const mockFetch = vi.fn()

vi.mock('@/store/useAuthStore', () => {
  const state = {
    isAuthenticated: true,
    isLoading: false,
    user: {
      name: 'Test User',
      email: 'test@example.com',
      roles: ['admin'],
    },
    token: 'mock-token',
    error: null,
    reset: (...args) => mockReset(...args),
  }
  const store = (selector) => selector(state)
  store.getState = () => state
  return { default: store }
})

vi.mock('@/utils/tokenRefresh', () => ({
  applySession: vi.fn(),
  setupTokenRefresh: vi.fn(),
}))

vi.mock('@/utils/authSession', () => ({
  clearRefreshToken: vi.fn(),
  getRefreshToken: vi.fn(() => 'stored-refresh'),
}))

import { useAuth } from '@/hooks/useAuth'
import { applySession } from '@/utils/tokenRefresh'
import { clearRefreshToken } from '@/utils/authSession'

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = mockFetch
  })

  it('devuelve el estado del store', () => {
    const { result } = renderHook(() => useAuth())
    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.isLoading).toBe(false)
    expect(result.current.user.name).toBe('Test User')
    expect(result.current.token).toBe('mock-token')
  })

  it('login llama a la API y aplica la sesión', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: { access_token: 'a', refresh_token: 'r', user: { sub: '1' } },
      }),
    })

    const { result } = renderHook(() => useAuth())
    await act(async () => {
      await result.current.login('admin', 'password', true)
    })

    expect(mockFetch).toHaveBeenCalledWith('/api/auth/login', expect.objectContaining({
      method: 'POST',
    }))
    expect(applySession).toHaveBeenCalled()
  })

  it('logout llama a la API y limpia la sesión', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => ({ success: true }) })

    const { result } = renderHook(() => useAuth())
    await act(async () => {
      await result.current.logout()
    })

    expect(mockFetch).toHaveBeenCalledWith('/api/auth/logout', expect.objectContaining({
      method: 'POST',
    }))
    expect(clearRefreshToken).toHaveBeenCalled()
    expect(mockReset).toHaveBeenCalled()
  })

  it('hasRole usa los roles del usuario', () => {
    const { result } = renderHook(() => useAuth())
    expect(result.current.hasRole('admin')).toBe(true)
    expect(result.current.hasRole('super')).toBe(false)
  })

  it('getTokenParsed retorna el usuario del store', () => {
    const { result } = renderHook(() => useAuth())
    expect(result.current.getTokenParsed().email).toBe('test@example.com')
  })
})
