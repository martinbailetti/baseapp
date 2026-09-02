import { useEffect, useMemo, useState } from 'react'
import { BellRing, Send, User, Users, UsersRound } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { apiFetch } from '@/utils/apiFetch'
import Spinner from '@/components/ui/Spinner'
import { usePushNotifications } from '@/hooks/usePushNotifications'

const PushNotificationsPage = () => {
  const { t } = useTranslation()

  const [users, setUsers] = useState([])
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [usersError, setUsersError] = useState('')
  const [pushEnabled, setPushEnabled] = useState(true)
  const [loadingPushConfig, setLoadingPushConfig] = useState(true)
  const [pushConfigError, setPushConfigError] = useState('')

  const [targetType, setTargetType] = useState('many')
  const [selectedOne, setSelectedOne] = useState('')
  const [selectedMany, setSelectedMany] = useState([])
  const [search, setSearch] = useState('')

  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [notificationType, setNotificationType] = useState('INFO')
  const [navigateUrl, setNavigateUrl] = useState('/')
  const [infoMessage, setInfoMessage] = useState('')

  const [sending, setSending] = useState(false)
  const [formError, setFormError] = useState('')
  const [warningMessage, setWarningMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [sendResult, setSendResult] = useState(null)
  const {
    supported,
    permission,
    subscribed,
    loading: subscriptionLoading,
    error: subscriptionError,
    subscribe,
    unsubscribe,
  } = usePushNotifications()

  useEffect(() => {
    const fetchPushConfig = async () => {
      try {
        setLoadingPushConfig(true)
        setPushConfigError('')

        const res = await apiFetch('/api/push/public-key')
        const json = await res.json()

        if (!res.ok || !json?.success || !json?.data) {
          throw new Error(json?.message || t('pushSend.errors.loadConfig', 'No se pudo validar la configuracion push'))
        }

        setPushEnabled(Boolean(json.data.enabled))
      } catch (error) {
        setPushEnabled(false)
        setPushConfigError(error?.message || t('pushSend.errors.loadConfig', 'No se pudo validar la configuracion push'))
      } finally {
        setLoadingPushConfig(false)
      }
    }

    fetchPushConfig()
  }, [t])

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoadingUsers(true)
        setUsersError('')

        const res = await apiFetch('/api/keycloak-users')
        const json = await res.json()

        if (!res.ok || !json?.success || !Array.isArray(json?.data)) {
          throw new Error(json?.message || t('pushSend.errors.loadUsers', 'No se pudo cargar la lista de usuarios'))
        }

        setUsers(json.data)
      } catch (error) {
        setUsersError(error?.message || t('pushSend.errors.loadUsers', 'No se pudo cargar la lista de usuarios'))
      } finally {
        setLoadingUsers(false)
      }
    }

    fetchUsers()
  }, [t])

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return users

    return users.filter((user) => {
      const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ').toLowerCase()
      const username = (user.username || '').toLowerCase()
      const email = (user.email || '').toLowerCase()
      return fullName.includes(q) || username.includes(q) || email.includes(q)
    })
  }, [users, search])

  const toggleMany = (userId) => {
    setSelectedMany((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]))
  }

  const selectAllFiltered = () => {
    const filteredIds = filteredUsers.map((user) => user.id).filter(Boolean)
    setSelectedMany((prev) => Array.from(new Set([...prev, ...filteredIds])))
  }

  const clearSelection = () => {
    setSelectedMany([])
    setSelectedOne('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    setFormError('')
    setWarningMessage('')
    setSuccessMessage('')
    setSendResult(null)

    const cleanTitle = title.trim()
    const cleanBody = body.trim()
    const cleanNavigateUrl = navigateUrl.trim() || '/'
    const cleanInfoMessage = infoMessage.trim()

    if (!pushEnabled) {
      setFormError(t('pushSend.errors.serverDisabled', 'Push esta deshabilitado en el servidor. Revisa PUSH_ENABLED en el .env de la API'))
      return
    }

    if (!cleanTitle || !cleanBody) {
      setFormError(t('pushSend.errors.requiredFields', 'Titulo y mensaje son obligatorios'))
      return
    }

    if (!['APP_UPDATE', 'NAVIGATE', 'INFO'].includes(notificationType)) {
      setFormError(t('pushSend.errors.invalidType', 'Tipo de notificacion invalido'))
      return
    }

    if (notificationType === 'INFO' && !cleanInfoMessage) {
      setFormError(t('pushSend.errors.requiredInfoMessage', 'Para INFO debes completar el mensaje interno'))
      return
    }

    if (targetType === 'one' && !selectedOne) {
      setFormError(t('pushSend.errors.selectOne', 'Selecciona un usuario'))
      return
    }

    if (targetType === 'many' && selectedMany.length === 0) {
      setFormError(t('pushSend.errors.selectMany', 'Selecciona al menos un usuario'))
      return
    }

    const payload = {
      target_type: targetType,
      title: cleanTitle,
      body: cleanBody,
      notification_type: notificationType,
      data: {
        type: notificationType,
      },
    }

    if (notificationType === 'NAVIGATE') {
      payload.data.url = cleanNavigateUrl
    }
    if (notificationType === 'INFO') {
      payload.data.message = cleanInfoMessage
    }

    if (targetType === 'one') payload.user_sub = selectedOne
    if (targetType === 'many') payload.user_subs = selectedMany

    try {
      setSending(true)

      const res = await apiFetch('/api/push/send', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
      const json = await res.json()

      if (!res.ok || !json?.success) {
        throw new Error(json?.message || t('pushSend.errors.sendFailed', 'No se pudo enviar la notificacion'))
      }

      const result = json?.data || null
      setSendResult(result)

      if (result && Number(result.requested || 0) === 0) {
        setWarningMessage(t('pushSend.warningNoSubscriptions', 'No hay suscripciones push activas para el objetivo. Activa notificaciones en al menos un navegador para guardar la suscripcion en BD.'))
        return
      }

      setSuccessMessage(t('pushSend.success.sent', 'Notificacion enviada correctamente'))
    } catch (error) {
      setFormError(error?.message || t('pushSend.errors.sendFailed', 'No se pudo enviar la notificacion'))
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto bg-gray-50 dark:bg-slate-900">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/40">
            <BellRing className="h-6 w-6 text-indigo-600 dark:text-indigo-300" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('pushSend.title', 'Enviar notificaciones push')}
            </h1>
            <p className="text-sm text-gray-500 dark:text-slate-400">
              {t('pushSend.subtitle', 'Selecciona uno, varios o todos los usuarios y envia un aviso')}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div className="rounded-md border border-gray-200 bg-gray-50 px-3 py-3 text-sm dark:border-slate-700 dark:bg-slate-900/40">
            <p className="font-medium text-gray-800 dark:text-slate-100">
              {t('pushSend.subscriptionStatus', 'Estado de suscripcion de este navegador')}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-full bg-slate-200 px-2 py-0.5 text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                {supported ? t('pushSend.browserSupported', 'Navegador compatible') : t('pushSend.browserUnsupported', 'Navegador no compatible')}
              </span>
              <span className="rounded-full bg-slate-200 px-2 py-0.5 text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                {permission === 'granted' ? t('pushSend.permissionGranted', 'Permiso concedido') : t('pushSend.permissionPending', 'Permiso pendiente/denegado')}
              </span>
              <span className="rounded-full bg-slate-200 px-2 py-0.5 text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                {subscribed ? t('pushSend.subscribedYes', 'Suscrito en BD') : t('pushSend.subscribedNo', 'Sin suscripcion activa')}
              </span>
            </div>
            <div className="mt-3 flex items-center gap-2">
              {!subscribed ? (
                <button
                  type="button"
                  onClick={subscribe}
                  disabled={!supported || !pushEnabled || subscriptionLoading}
                  className="rounded-md bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {subscriptionLoading ? t('pushSend.subscribing', 'Activando...') : t('pushSend.enableHere', 'Activar en este navegador')}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={unsubscribe}
                  disabled={subscriptionLoading}
                  className="rounded-md bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {subscriptionLoading ? t('pushSend.unsubscribing', 'Desactivando...') : t('pushSend.disableHere', 'Desactivar en este navegador')}
                </button>
              )}
            </div>
            {subscriptionError && (
              <p className="mt-2 text-xs text-red-600 dark:text-red-400">{subscriptionError}</p>
            )}
          </div>

          {!loadingPushConfig && !pushEnabled && (
            <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
              {t('pushSend.warningDisabled', 'Push esta deshabilitado en el servidor (PUSH_ENABLED=false). Activa la variable en el .env de la API para poder enviar notificaciones.')}
            </div>
          )}

          {!loadingPushConfig && pushConfigError && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
              {pushConfigError}
            </div>
          )}

          <div>
            <p className="mb-3 text-sm font-semibold text-gray-900 dark:text-slate-100">
              {t('pushSend.targetTypeLabel', 'Destinatarios')}
            </p>
            <div className="grid gap-2 sm:grid-cols-3">
              <label htmlFor="target-type-one" className="flex cursor-pointer items-center gap-2 rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-700 dark:border-slate-700 dark:text-slate-300">
                <input
                  id="target-type-one"
                  type="radio"
                  name="targetType"
                  value="one"
                  checked={targetType === 'one'}
                  onChange={() => setTargetType('one')}
                  className="h-4 w-4"
                />
                <User className="h-4 w-4" />
                {t('pushSend.targetOne', 'Un usuario')}
              </label>
              <label htmlFor="target-type-many" className="flex cursor-pointer items-center gap-2 rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-700 dark:border-slate-700 dark:text-slate-300">
                <input
                  id="target-type-many"
                  type="radio"
                  name="targetType"
                  value="many"
                  checked={targetType === 'many'}
                  onChange={() => setTargetType('many')}
                  className="h-4 w-4"
                />
                <Users className="h-4 w-4" />
                {t('pushSend.targetMany', 'Varios usuarios')}
              </label>
              <label htmlFor="target-type-all" className="flex cursor-pointer items-center gap-2 rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-700 dark:border-slate-700 dark:text-slate-300">
                <input
                  id="target-type-all"
                  type="radio"
                  name="targetType"
                  value="all"
                  checked={targetType === 'all'}
                  onChange={() => setTargetType('all')}
                  className="h-4 w-4"
                />
                <UsersRound className="h-4 w-4" />
                {t('pushSend.targetAll', 'Todos los usuarios')}
              </label>
            </div>
          </div>

          {targetType !== 'all' && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <input
                  id="push-user-search"
                  name="userSearch"
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t('pushSend.searchUsers', 'Buscar por nombre, usuario o email')}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 sm:max-w-sm"
                />
                {targetType === 'many' && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={selectAllFiltered}
                      className="rounded-md border border-gray-300 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
                    >
                      {t('pushSend.selectFiltered', 'Seleccionar filtrados')}
                    </button>
                    <button
                      type="button"
                      onClick={clearSelection}
                      className="rounded-md border border-gray-300 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
                    >
                      {t('pushSend.clearSelection', 'Limpiar seleccion')}
                    </button>
                  </div>
                )}
              </div>

              {loadingUsers ? (
                <div className="flex items-center justify-center rounded-md border border-gray-200 bg-gray-50 py-8 dark:border-slate-700 dark:bg-slate-900/30">
                  <Spinner size="md" />
                </div>
              ) : usersError ? (
                <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
                  {usersError}
                </div>
              ) : targetType === 'one' ? (
                <select
                  id="push-selected-user"
                  name="selectedUser"
                  value={selectedOne}
                  onChange={(e) => setSelectedOne(e.target.value)}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                >
                  <option value="">{t('pushSend.selectUserPlaceholder', 'Selecciona un usuario')}</option>
                  {filteredUsers.map((user) => {
                    const label = user.email || user.username || user.id
                    return (
                      <option key={user.id} value={user.id}>
                        {label}
                      </option>
                    )
                  })}
                </select>
              ) : (
                <div className="max-h-64 overflow-auto rounded-md border border-gray-200 dark:border-slate-700">
                  {filteredUsers.length === 0 ? (
                    <p className="px-3 py-4 text-sm text-gray-500 dark:text-slate-400">
                      {t('pushSend.noUsers', 'No hay usuarios para mostrar')}
                    </p>
                  ) : (
                    filteredUsers.map((user) => {
                      const checked = selectedMany.includes(user.id)
                      const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ')
                      return (
                        <label
                          key={user.id}
                          htmlFor={`push-user-${user.id}`}
                          className="flex cursor-pointer items-center gap-3 border-b border-gray-100 px-3 py-2 text-sm last:border-b-0 dark:border-slate-700"
                        >
                          <input
                            id={`push-user-${user.id}`}
                            name={`push-user-${user.id}`}
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleMany(user.id)}
                            className="h-4 w-4"
                          />
                          <div className="min-w-0">
                            <p className="truncate font-medium text-gray-900 dark:text-slate-100">
                              {user.email || user.username || user.id}
                            </p>
                            {fullName && <p className="truncate text-xs text-gray-500 dark:text-slate-400">{fullName}</p>}
                          </div>
                        </label>
                      )
                    })
                  )}
                </div>
              )}
            </div>
          )}

          <div className="grid gap-4">
            <div>
              <label htmlFor="push-notification-type" className="mb-1 block text-sm font-medium text-gray-800 dark:text-slate-200">
                {t('pushSend.notificationType', 'Tipo de notificacion')}
              </label>
              <select
                id="push-notification-type"
                name="notificationType"
                value={notificationType}
                onChange={(e) => setNotificationType(e.target.value)}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
              >
                <option value="INFO">{t('pushSend.types.INFO', 'INFO (mensaje interno)')}</option>
                <option value="NAVIGATE">{t('pushSend.types.NAVIGATE', 'NAVIGATE (abrir ruta)')}</option>
                <option value="APP_UPDATE">{t('pushSend.types.APP_UPDATE', 'APP_UPDATE (forzar recarga)')}</option>
              </select>
            </div>

            <div>
              <label htmlFor="push-title" className="mb-1 block text-sm font-medium text-gray-800 dark:text-slate-200">
                {t('pushSend.fieldTitle', 'Titulo')}
              </label>
              <input
                id="push-title"
                name="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={120}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label htmlFor="push-body" className="mb-1 block text-sm font-medium text-gray-800 dark:text-slate-200">
                {t('pushSend.fieldBody', 'Mensaje')}
              </label>
              <textarea
                id="push-body"
                name="body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={4}
                maxLength={500}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>

            {notificationType === 'NAVIGATE' && (
              <div>
                <label htmlFor="push-navigate-url" className="mb-1 block text-sm font-medium text-gray-800 dark:text-slate-200">
                  {t('pushSend.fieldUrl', 'URL al hacer click')}
                </label>
                <input
                  id="push-navigate-url"
                  name="navigateUrl"
                  type="text"
                  value={navigateUrl}
                  onChange={(e) => setNavigateUrl(e.target.value)}
                  placeholder="/"
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                />
              </div>
            )}

            {notificationType === 'INFO' && (
              <div>
                <label htmlFor="push-info-message" className="mb-1 block text-sm font-medium text-gray-800 dark:text-slate-200">
                  {t('pushSend.fieldInfoMessage', 'Mensaje interno (data.message)')}
                </label>
                <input
                  id="push-info-message"
                  name="infoMessage"
                  type="text"
                  value={infoMessage}
                  onChange={(e) => setInfoMessage(e.target.value)}
                  maxLength={300}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                />
              </div>
            )}
          </div>

          {formError && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
              {formError}
            </div>
          )}

          {successMessage && (
            <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300">
              {successMessage}
            </div>
          )}

          {warningMessage && (
            <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
              {warningMessage}
            </div>
          )}

          {sendResult && (
            <div className="grid gap-2 rounded-md border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700 dark:border-slate-700 dark:bg-slate-900/30 dark:text-slate-200 sm:grid-cols-4">
              <p>{t('pushSend.resultRequested', 'Solicitadas')}: <span className="font-semibold">{sendResult.requested ?? 0}</span></p>
              <p>{t('pushSend.resultSent', 'Enviadas')}: <span className="font-semibold">{sendResult.sent ?? 0}</span></p>
              <p>{t('pushSend.resultFailed', 'Fallidas')}: <span className="font-semibold">{sendResult.failed ?? 0}</span></p>
              <p>{t('pushSend.resultDeactivated', 'Desactivadas')}: <span className="font-semibold">{sendResult.deactivated ?? 0}</span></p>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={sending || loadingPushConfig || !pushEnabled}
              className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <Send className="h-4 w-4" />
              {sending ? t('pushSend.sending', 'Enviando...') : t('pushSend.submit', 'Enviar notificacion')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PushNotificationsPage
