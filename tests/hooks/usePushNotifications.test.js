import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

vi.mock('@/utils/apiFetch', () => ({
  apiFetch: vi.fn(),
}))

import { apiFetch } from '@/utils/apiFetch'
import { usePushNotifications } from '@/hooks/usePushNotifications'

const mockSubscription = {
  endpoint: 'https://push.example/sub/1',
  toJSON: () => ({ endpoint: 'https://push.example/sub/1' }),
  unsubscribe: vi.fn().mockResolvedValue(true),
}

function setupPushSupport({ subscribed = false, permission = 'granted' } = {}) {
  class PushManager {}

  Object.defineProperty(window, 'PushManager', {
    configurable: true,
    writable: true,
    value: PushManager,
  })

  Object.defineProperty(globalThis, 'Notification', {
    configurable: true,
    writable: true,
    value: {
      permission,
      requestPermission: vi.fn().mockResolvedValue(permission),
    },
  })

  const getSubscription = vi.fn().mockResolvedValue(subscribed ? mockSubscription : null)
  const subscribe = vi.fn().mockResolvedValue(mockSubscription)

  Object.defineProperty(navigator, 'serviceWorker', {
    configurable: true,
    value: {
      ready: Promise.resolve({
        pushManager: { getSubscription, subscribe },
      }),
    },
  })

  return { getSubscription, subscribe }
}

describe('usePushNotifications', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setupPushSupport()
    apiFetch.mockImplementation(async (path) => {
      if (path === '/api/push/public-key') {
        return {
          ok: true,
          json: async () => ({ data: { enabled: true, public_key: 'YQ==' } }),
        }
      }
      return {
        ok: true,
        json: async () => ({ success: true }),
      }
    })
  })

  afterEach(() => {
    delete globalThis.Notification
    delete window.PushManager
    delete navigator.serviceWorker
  })

  it('detecta soporte push y estado del servidor', async () => {
    const { result } = renderHook(() => usePushNotifications())

    await waitFor(() => {
      expect(result.current.supported).toBe(true)
      expect(result.current.enabled).toBe(true)
    })
    expect(result.current.permission).toBe('granted')
    expect(result.current.subscribed).toBe(false)
  })

  it('marca como no suscrito si push está deshabilitado en servidor', async () => {
    apiFetch.mockImplementation(async (path) => {
      if (path === '/api/push/public-key') {
        return {
          ok: true,
          json: async () => ({ data: { enabled: false, public_key: null } }),
        }
      }
      return { ok: true, json: async () => ({ success: true }) }
    })

    const { result } = renderHook(() => usePushNotifications())

    await waitFor(() => {
      expect(result.current.enabled).toBe(false)
      expect(result.current.subscribed).toBe(false)
    })
  })

  it('suscribe al usuario cuando todo está disponible', async () => {
    const { subscribe } = setupPushSupport({ subscribed: false, permission: 'granted' })
    const { result } = renderHook(() => usePushNotifications())

    await waitFor(() => expect(result.current.enabled).toBe(true))

    let ok
    await act(async () => {
      ok = await result.current.subscribe()
    })

    expect(ok).toBe(true)
    expect(subscribe).toHaveBeenCalledOnce()
    expect(result.current.subscribed).toBe(true)
    expect(apiFetch).toHaveBeenCalledWith('/api/push/subscriptions', expect.objectContaining({
      method: 'POST',
    }))
  })

  it('devuelve error si el permiso está denegado', async () => {
    setupPushSupport({ permission: 'denied' })
    const { result } = renderHook(() => usePushNotifications())

    await waitFor(() => expect(result.current.enabled).toBe(true))

    let ok
    await act(async () => {
      ok = await result.current.subscribe()
    })

    expect(ok).toBe(false)
    expect(result.current.error).toBe('Permiso de notificaciones denegado')
  })

  it('desuscribe y elimina la suscripción del servidor', async () => {
    setupPushSupport({ subscribed: true })
    const { result } = renderHook(() => usePushNotifications())

    await waitFor(() => expect(result.current.subscribed).toBe(true))

    let ok
    await act(async () => {
      ok = await result.current.unsubscribe()
    })

    expect(ok).toBe(true)
    expect(mockSubscription.unsubscribe).toHaveBeenCalledOnce()
    expect(result.current.subscribed).toBe(false)
    expect(apiFetch).toHaveBeenCalledWith('/api/push/subscriptions', expect.objectContaining({
      method: 'DELETE',
      body: JSON.stringify({ endpoint: mockSubscription.endpoint }),
    }))
  })
})
