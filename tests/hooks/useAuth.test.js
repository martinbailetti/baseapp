import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock keycloak — debe ir antes del import del hook
vi.mock('@/utils/keycloak', () => ({
  default: {
    login: vi.fn(),
    logout: vi.fn(),
    hasRealmRole: vi.fn(() => false),
    hasResourceRole: vi.fn(() => false),
    tokenParsed: { sub: 'abc', name: 'Test User' },
    token: 'mock-token',
  },
}))

// Mock store con estado inicial de sesión activa
vi.mock('@/store/useAuthStore', () => {
  const state = {
    isAuthenticated: true,
    isLoading: false,
    user: { name: 'Test User', email: 'test@example.com' },
    token: 'mock-token',
    error: null,
    hasRequiredRoles: true,
  }
  return {
    default: (selector) => selector(state),
  }
})

import { useAuth } from '@/hooks/useAuth'
import keycloak from '@/utils/keycloak'

describe('useAuth', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
    keycloak.hasRealmRole.mockReturnValue(false)
    keycloak.hasResourceRole.mockReturnValue(false)
  })

  it('devuelve el estado del store', () => {
    const { result } = renderHook(() => useAuth())
    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.isLoading).toBe(false)
    expect(result.current.user.name).toBe('Test User')
    expect(result.current.token).toBe('mock-token')
  })

  it('login llama keycloak.login con scope openid cuando rememberMe=false', () => {
    const { result } = renderHook(() => useAuth())
    act(() => result.current.login(false))
    expect(keycloak.login).toHaveBeenCalledWith(
      expect.objectContaining({ scope: 'openid' })
    )
    expect(localStorage.getItem('kc_remember_me')).toBe('false')
  })

  it('login llama keycloak.login con offline_access cuando rememberMe=true', () => {
    const { result } = renderHook(() => useAuth())
    act(() => result.current.login(true))
    expect(keycloak.login).toHaveBeenCalledWith(
      expect.objectContaining({ scope: 'openid offline_access' })
    )
    expect(localStorage.getItem('kc_remember_me')).toBe('true')
  })

  it('logout llama keycloak.logout y limpia el storage', () => {
    localStorage.setItem('kc_remember_me', 'true')
    localStorage.setItem('kc_tokens', 'abc')
    const { result } = renderHook(() => useAuth())
    act(() => result.current.logout())
    expect(keycloak.logout).toHaveBeenCalled()
    expect(localStorage.getItem('kc_remember_me')).toBeNull()
    expect(localStorage.getItem('kc_tokens')).toBeNull()
  })

  it('hasRole delega en keycloak.hasRealmRole', () => {
    keycloak.hasRealmRole.mockReturnValue(true)
    const { result } = renderHook(() => useAuth())
    expect(result.current.hasRole('admin')).toBe(true)
  })

  it('hasRole delega en keycloak.hasResourceRole si hasRealmRole es false', () => {
    keycloak.hasRealmRole.mockReturnValue(false)
    keycloak.hasResourceRole.mockReturnValue(true)
    const { result } = renderHook(() => useAuth())
    expect(result.current.hasRole('app-user')).toBe(true)
  })

  it('getTokenParsed retorna keycloak.tokenParsed', () => {
    const { result } = renderHook(() => useAuth())
    expect(result.current.getTokenParsed()).toEqual({ sub: 'abc', name: 'Test User' })
  })
})
