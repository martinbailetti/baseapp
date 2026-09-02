import { useCallback, useState } from 'react'
import { TOAST_DISMISS_MS } from '@/config/defaults'

/**
 * Hook para gestionar notificaciones tipo toast de forma reutilizable.
 *
 * Devuelve `{ toasts, addToast }` para renderizar junto a `<ToastContainer />`.
 *
 * @param {number} [timeout=TOAST_DISMISS_MS]  Tiempo en ms antes de ocultar cada toast.
 */
export function useToasts(timeout = TOAST_DISMISS_MS) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback(
    (message, type = 'success') => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`
      setToasts((prev) => [...prev, { id, message, type }])
      setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id))
      }, timeout)
    },
    [timeout]
  )

  return { toasts, addToast }
}
