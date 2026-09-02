import { useState } from 'react'
import { LogIn, LogOut, ShieldAlert } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/hooks/useAuth'
import keycloak from '@/utils/keycloak'
import { APP_NAME } from '@/utils/appConfig'
import Button from '@/components/ui/Button'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'

const LoginPage = () => {
  const { t } = useTranslation()
  const [rememberMe, setRememberMe] = useState(
    () => localStorage.getItem('kc_remember_me') === 'true'
  )
  const { login, logout, isLoading, isAuthenticated, hasRequiredRoles } = useAuth()

  const handleLogin = () => login(rememberMe)

  // Cierra sesión independientemente del estado del store:
  // cubre el caso en que check-sso falla (iframe bloqueado) y
  // isAuthenticated queda false aunque la sesión exista en Keycloak.
  const handleForceLogout = () => {
    localStorage.removeItem('kc_remember_me')
    localStorage.removeItem('kc_tokens')
    sessionStorage.removeItem('kc_session_active')
    keycloak.logout({ redirectUri: window.location.origin + '/login' })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 to-gray-100 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <div className="flex flex-col items-center gap-2 py-2">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-white text-2xl font-bold select-none">
              O
            </div>
            <h1 className="text-xl font-bold text-gray-800">{APP_NAME}</h1>
            <p className="text-sm text-gray-500 text-center">{t('auth.appSubtitle')}</p>
          </div>
        </CardHeader>
        <CardBody className="flex flex-col gap-5">
          <div className="rounded-lg bg-gray-50 px-4 py-3 text-xs text-gray-500 space-y-1">
            <p>
              <span className="font-medium">{t('auth.realm')}:</span>{' '}
              {import.meta.env.VITE_KEYCLOAK_REALM || '—'}
            </p>
            <p>
              <span className="font-medium">{t('auth.client')}:</span>{' '}
              {import.meta.env.VITE_KEYCLOAK_CLIENT_ID || '—'}
            </p>
            <p>
              <span className="font-medium">{t('auth.url')}:</span>{' '}
              {import.meta.env.VITE_KEYCLOAK_URL || '—'}
            </p>
          </div>

          {/* Aviso si el store detectó sesión pero sin los roles necesarios */}
          {isAuthenticated && !hasRequiredRoles && (
            <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-xs text-amber-700">
              <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
              <span>
                {t('auth.noPermissions')}
              </span>
            </div>
          )}

          {isAuthenticated ? (
            <Button variant="danger" onClick={logout} className="w-full gap-2">
              <LogOut className="h-4 w-4" />
              {t('auth.signOut')}
            </Button>
          ) : (
            <>
              <label htmlFor="remember-me" className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-600">{t('auth.rememberMe')}</span>
              </label>

              <Button onClick={handleLogin} disabled={isLoading} className="w-full gap-2">
                <LogIn className="h-4 w-4" />
                {t('auth.signIn')}
              </Button>

              {/* Escape para sesiones parciales no detectadas por check-sso */}
              <button
                type="button"
                onClick={handleForceLogout}
                className="flex items-center justify-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors mx-auto"
              >
                <LogOut className="h-3 w-3" />
                {t('auth.forceSignOut')}
              </button>
            </>
          )}
        </CardBody>
      </Card>
    </div>
  )
}

export default LoginPage
