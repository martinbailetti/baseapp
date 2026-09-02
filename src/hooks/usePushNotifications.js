import { useCallback, useEffect, useState } from 'react'
import { apiFetch } from '@/utils/apiFetch'

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export function usePushNotifications() {
  const [supported, setSupported] = useState(false)
  const [enabled, setEnabled] = useState(false)
  const [permission, setPermission] = useState(typeof Notification !== 'undefined' ? Notification.permission : 'default')
  const [subscribed, setSubscribed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const refreshState = useCallback(async () => {
    const hasSupport =
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      typeof Notification !== 'undefined'

    setSupported(hasSupport)
    setPermission(typeof Notification !== 'undefined' ? Notification.permission : 'default')

    if (!hasSupport) {
      setSubscribed(false)
      setEnabled(false)
      return
    }

    try {
      const cfgRes = await apiFetch('/api/push/public-key')
      const cfgJson = await cfgRes.json()
      const pushEnabled = !!cfgJson?.data?.enabled && !!cfgJson?.data?.public_key
      setEnabled(pushEnabled)

      if (!pushEnabled) {
        setSubscribed(false)
        return
      }

      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      setSubscribed(!!subscription)
    } catch (ex) {
      setError(ex.message || 'Error obteniendo estado de notificaciones')
    }
  }, [])

  useEffect(() => {
    refreshState()
  }, [refreshState])

  const subscribe = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      if (!supported) {
        throw new Error('Push no soportado en este navegador')
      }
      if (!enabled) {
        throw new Error('Push deshabilitado en el servidor')
      }

      let currentPermission = Notification.permission
      if (currentPermission !== 'granted') {
        currentPermission = await Notification.requestPermission()
      }
      setPermission(currentPermission)

      if (currentPermission !== 'granted') {
        throw new Error('Permiso de notificaciones denegado')
      }

      const cfgRes = await apiFetch('/api/push/public-key')
      const cfgJson = await cfgRes.json()
      const publicKey = cfgJson?.data?.public_key
      if (!publicKey) {
        throw new Error('Clave pública de push no configurada')
      }

      const registration = await navigator.serviceWorker.ready
      let subscription = await registration.pushManager.getSubscription()
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        })
      }

      const res = await apiFetch('/api/push/subscriptions', {
        method: 'POST',
        body: JSON.stringify(subscription.toJSON()),
      })
      const json = await res.json()
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'No se pudo guardar la suscripción')
      }

      setSubscribed(true)
      return true
    } catch (ex) {
      setError(ex.message || 'Error al activar notificaciones')
      return false
    } finally {
      setLoading(false)
    }
  }, [enabled, supported])

  const unsubscribe = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      if (!supported) {
        throw new Error('Push no soportado en este navegador')
      }

      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      if (!subscription) {
        setSubscribed(false)
        return true
      }

      const endpoint = subscription.endpoint
      const res = await apiFetch('/api/push/subscriptions', {
        method: 'DELETE',
        body: JSON.stringify({ endpoint }),
      })
      const json = await res.json()
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'No se pudo eliminar la suscripción')
      }

      await subscription.unsubscribe()
      setSubscribed(false)
      return true
    } catch (ex) {
      setError(ex.message || 'Error al desactivar notificaciones')
      return false
    } finally {
      setLoading(false)
    }
  }, [supported])

  return {
    supported,
    enabled,
    permission,
    subscribed,
    loading,
    error,
    subscribe,
    unsubscribe,
    refreshState,
  }
}

export default usePushNotifications
