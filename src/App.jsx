import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useEffect, useState, Suspense } from 'react'
import { AlertTriangle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/hooks/useAuth'
import { useDarkMode } from '@/hooks/useDarkMode'
import { useLanguage } from '@/hooks/useLanguage'
import { getHomeForRoles } from '@/utils/roleHome'
import ProtectedRoute from '@/components/ProtectedRoute'
import Navbar from '@/components/Navbar'
import LoadingPage from '@/pages/LoadingPage'
import LoginPage from '@/pages/LoginPage'
import UnauthorizedPage from '@/pages/UnauthorizedPage'
import PwaInstallBanner from '@/components/PwaInstallBanner'
import ErrorBoundary from '@/components/ErrorBoundary'
import Spinner from '@/components/ui/Spinner'
import { routes } from '@/config/routes'
import { INFO_MESSAGE_MS } from '@/config/defaults'

function OfflineBanner({ isOffline }) {
  const { t } = useTranslation()

  if (!isOffline) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-offline bg-amber-500 text-amber-950 shadow-sm">
      <div className="mx-auto flex h-9 w-full max-w-screen-2xl items-center justify-center gap-2 px-4 text-sm font-medium">
        <AlertTriangle className="h-4 w-4" />
        <span>{t('common.offlineWarning', 'Sin conexion. La aplicacion esta offline.')}</span>
      </div>
    </div>
  )
}

const AppLayout = ({ children }) => {
  const [isOffline, setIsOffline] = useState(() => !navigator.onLine)

  useEffect(() => {
    const onOnline = () => setIsOffline(false)
    const onOffline = () => setIsOffline(true)

    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)

    return () => {
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
    }
  }, [])

  return (
    <div className={`flex h-screen flex-col overflow-hidden bg-gray-50 [height:100dvh] dark:bg-slate-900 ${isOffline ? 'pt-9' : ''}`}>
      <OfflineBanner isOffline={isOffline} />
      <Navbar />
      <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <ErrorBoundary>{children}</ErrorBoundary>
      </main>
      <PwaInstallBanner />
    </div>
  )
}

function NotificationActionBridge() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [infoMessage, setInfoMessage] = useState('')

  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      return undefined
    }

    const handler = (event) => {
      if (event?.data?.type !== 'HANDLE_NOTIFICATION') {
        return
      }

      const payload = event.data.payload || {}
      const type = typeof payload.type === 'string' ? payload.type.toUpperCase() : ''

      if (type === 'APP_UPDATE') {
        window.location.reload()
        return
      }

      if (type === 'NAVIGATE') {
        navigate(payload.url || '/')
        return
      }

      if (type === 'INFO') {
        const message = (payload.message || t('pushSend.infoFallback', 'Tienes una nueva notificacion')).toString()
        setInfoMessage(message)
        window.setTimeout(() => setInfoMessage(''), INFO_MESSAGE_MS)
      }
    }

    navigator.serviceWorker.addEventListener('message', handler)

    return () => {
      navigator.serviceWorker.removeEventListener('message', handler)
    }
  }, [navigate, t])

  if (!infoMessage) {
    return null
  }

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-info-toast max-w-sm rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-medium text-sky-900 shadow-lg dark:border-sky-800 dark:bg-sky-900/30 dark:text-sky-100">
      {infoMessage}
    </div>
  )
}

const PageLoading = () => (
  <div className="flex h-[50vh] w-full items-center justify-center">
    <Spinner size="lg" />
  </div>
)

const App = () => {
  const { isLoading, isAuthenticated, hasRequiredRoles, hasRole } = useAuth()
  useDarkMode()
  useLanguage()

  if (isLoading) return <LoadingPage />

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <NotificationActionBridge />
      <Routes>
        <Route
          path="/login"
          element={
            isAuthenticated && hasRequiredRoles
              ? <Navigate to={getHomeForRoles(hasRole)} replace />
              : <LoginPage />
          }
        />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Navigate to={getHomeForRoles(hasRole)} replace />
            </ProtectedRoute>
          }
        />

        {routes.map((route) => {
          const PageComponent = route.element
          
          let element = (
            <Suspense fallback={<PageLoading />}>
              <PageComponent />
            </Suspense>
          )

          if (route.layout) {
            element = <AppLayout>{element}</AppLayout>
          }

          if (route.protected) {
            element = (
              <ProtectedRoute requiredRole={route.requiredRole}>
                {element}
              </ProtectedRoute>
            )
          }

          return <Route key={route.path} path={route.path} element={element} />
        })}

        <Route path="*" element={<Navigate to={getHomeForRoles(hasRole)} replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
