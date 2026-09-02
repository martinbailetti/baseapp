import { useState } from 'react'
import { LogIn, LogOut, ShieldAlert } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/hooks/useAuth'
import { APP_NAME } from '@/utils/appConfig'
import Button from '@/components/ui/Button'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'

const LoginPage = () => {
  const { t } = useTranslation()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(
    () => localStorage.getItem('auth_remember_me') === 'true'
  )
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const { login, logout, isAuthenticated, hasRequiredRoles } = useAuth()

  const handleSubmit = async (event) => {
    event.preventDefault()
    setFormError('')
    setSubmitting(true)
    try {
      await login(username, password, rememberMe)
    } catch (err) {
      setFormError(err?.message || t('auth.invalidCredentials'))
    } finally {
      setSubmitting(false)
    }
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
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {formError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
                  {formError}
                </div>
              )}

              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium text-gray-700">{t('auth.username')}</span>
                <input
                  type="text"
                  name="username"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium text-gray-700">{t('auth.password')}</span>
                <input
                  type="password"
                  name="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </label>

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

              <Button type="submit" disabled={submitting} className="w-full gap-2">
                <LogIn className="h-4 w-4" />
                {submitting ? t('auth.signingIn') : t('auth.signIn')}
              </Button>
            </form>
          )}
        </CardBody>
      </Card>
    </div>
  )
}

export default LoginPage
