import { Bell, BellOff } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'

/**
 * @param {{
 *   supported: boolean,
 *   enabled: boolean,
 *   permission: NotificationPermission,
 *   subscribed: boolean,
 *   loading: boolean,
 *   error: string|null,
 *   subscribe: () => void,
 *   unsubscribe: () => void
 * }} props
 */
const NotificationsCard = ({
  supported,
  enabled,
  permission,
  subscribed,
  loading,
  error,
  subscribe,
  unsubscribe,
}) => {
  const { t } = useTranslation()

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
            {subscribed ? <Bell className="h-6 w-6" /> : <BellOff className="h-6 w-6" />}
          </div>
          <div>
            <p className="font-semibold text-gray-800 dark:text-slate-100">{t('notifications.title', 'Notificaciones push')}</p>
            <p className="text-sm text-gray-500 dark:text-slate-400">{t('notifications.subtitle', 'Recibe avisos aunque la app no este en primer plano')}</p>
          </div>
        </div>
      </CardHeader>
      <CardBody>
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={supported ? 'success' : 'warning'}>
              {supported
                ? t('notifications.supported', 'Compatible')
                : t('notifications.notSupported', 'No compatible')}
            </Badge>
            <Badge variant={enabled ? 'success' : 'warning'}>
              {enabled
                ? t('notifications.serverEnabled', 'Servidor habilitado')
                : t('notifications.serverDisabled', 'Servidor deshabilitado')}
            </Badge>
            <Badge variant={permission === 'granted' ? 'success' : 'warning'}>
              {permission === 'granted'
                ? t('notifications.permissionGranted', 'Permiso concedido')
                : t('notifications.permissionNotGranted', 'Permiso pendiente/denegado')}
            </Badge>
          </div>

          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

          <div className="flex items-center gap-2">
            {!subscribed ? (
              <button
                onClick={subscribe}
                disabled={!supported || !enabled || loading}
                className="rounded-md px-4 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 transition-colors"
              >
                {loading
                  ? t('notifications.working', 'Procesando...')
                  : t('notifications.enable', 'Activar notificaciones')}
              </button>
            ) : (
              <button
                onClick={unsubscribe}
                disabled={loading}
                className="rounded-md px-4 py-2 text-sm font-medium bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 transition-colors"
              >
                {loading
                  ? t('notifications.working', 'Procesando...')
                  : t('notifications.disable', 'Desactivar notificaciones')}
              </button>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  )
}

export default NotificationsCard