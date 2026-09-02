import { useCallback } from 'react'
import keycloak from '@/utils/keycloak'
import useAuthStore from '@/store/useAuthStore'

const REQUIRED_ROLES = import.meta.env.VITE_REQUIRED_ROLES
  ? import.meta.env.VITE_REQUIRED_ROLES.split(',').map((r) => r.trim()).filter(Boolean)
  : []

/**
 * Hook principal de autenticación con Keycloak.
 */
export function useAuth() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const isLoading = useAuthStore((state) => state.isLoading)
  const user = useAuthStore((state) => state.user)
  const token = useAuthStore((state) => state.token)
  const error = useAuthStore((state) => state.error)

  const hasRole = useCallback(
    (role) => {
      if (typeof keycloak.hasRealmRole === 'function' && keycloak.hasRealmRole(role)) {
        return true
      }
      if (typeof keycloak.hasResourceRole === 'function' && keycloak.hasResourceRole(role, keycloak.clientId)) {
        return true
      }
      if (!keycloak.tokenParsed) return false
      const realmRoles = keycloak.tokenParsed.realm_access?.roles ?? []
      const clientRoles =
        keycloak.tokenParsed.resource_access?.[keycloak.clientId]?.roles ?? []
      return realmRoles.includes(role) || clientRoles.includes(role)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [token]
  )

  const hasRequiredRoles =
    REQUIRED_ROLES.length === 0 || REQUIRED_ROLES.some((role) => hasRole(role))

  const login = useCallback((rememberMe = false) => {
    localStorage.setItem('kc_remember_me', String(rememberMe))
    keycloak.login({
      redirectUri: window.location.origin + '/',
      scope: rememberMe ? 'openid offline_access' : 'openid',
    })
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('kc_remember_me')
    localStorage.removeItem('kc_tokens')
    sessionStorage.removeItem('kc_session_active')
    keycloak.logout({ redirectUri: window.location.origin + '/' })
  }, [])

  const getTokenParsed = useCallback(() => keycloak.tokenParsed ?? null, [])

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
