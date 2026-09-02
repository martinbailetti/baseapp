import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import LoadingPage from '@/pages/LoadingPage'

/**
 * Protege rutas verificando autenticación y roles requeridos.
 * @param {{ children: import('react').ReactNode }} props
 */
const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, isLoading, hasRequiredRoles, hasRole } = useAuth()

  if (isLoading) return <LoadingPage />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (!hasRequiredRoles) return <Navigate to="/unauthorized" replace />
  if (requiredRole) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
    if (!roles.some((r) => hasRole(r))) return <Navigate to="/unauthorized" replace />
  }

  return children
}

export default ProtectedRoute
