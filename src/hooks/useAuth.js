import { useCallback } from 'react'
import useAuthStore from '@/store/useAuthStore'
import { API_URL } from '@/config/defaults'
import { applySession, setupTokenRefresh } from '@/utils/tokenRefresh'
import { clearRefreshToken, getRefreshToken } from '@/utils/authSession'

const REQUIRED_ROLES = import.meta.env.VITE_REQUIRED_ROLES
  ? import.meta.env.VITE_REQUIRED_ROLES.split(',').map((r) => r.trim()).filter(Boolean)
  : []

function rolesFromUser(user) {
  if (!user) return []
  return Array.isArray(user.roles) ? user.roles : []
}

/**
 * Hook principal de autenticación contra la API.
 */
export function useAuth() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const isLoading = useAuthStore((state) => state.isLoading)
  const user = useAuthStore((state) => state.user)
  const token = useAuthStore((state) => state.token)
  const error = useAuthStore((state) => state.error)

  const hasRole = useCallback(
    (role) => rolesFromUser(user).includes(role),
    [user]
  )

  const hasRequiredRoles =
    REQUIRED_ROLES.length === 0 || REQUIRED_ROLES.some((role) => hasRole(role))

  const login = useCallback(async (username, password, rememberMe = false) => {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username,
        password,
        remember_me: Boolean(rememberMe),
      }),
    })

    const json = await res.json().catch(() => null)
    if (!res.ok || !json?.success || !json?.data?.access_token) {
      const message = json?.message || (res.status === 401 ? 'Credenciales inválidas' : `Error ${res.status}`)
      throw new Error(message)
    }

    applySession(json.data, rememberMe)
    setupTokenRefresh({
      onRefreshFailed: () => {
        clearRefreshToken()
        useAuthStore.getState().reset()
      },
    })
  }, [])

  const logout = useCallback(async () => {
    const refreshToken = useAuthStore.getState().refreshToken || getRefreshToken()
    const accessToken = useAuthStore.getState().token
    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify(refreshToken ? { refresh_token: refreshToken } : {}),
      })
    } catch {
      /* noop — se limpia la sesión local de todos modos */
    }
    clearRefreshToken()
    useAuthStore.getState().reset()
  }, [])

  const getTokenParsed = useCallback(() => user ?? null, [user])

  return {
    isAuthenticated,
    isLoading,
    user,
    token,
    error,
    hasRequiredRoles,
    requiredRoles: REQUIRED_ROLES,
    login,
    logout,
    hasRole,
    getTokenParsed,
  }
}

export { REQUIRED_ROLES }
export default useAuth
