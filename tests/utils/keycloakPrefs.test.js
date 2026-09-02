import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

vi.mock('@/utils/apiFetch', () => ({
  apiFetch: vi.fn(),
}))

import { apiFetch } from '@/utils/apiFetch'
import { ensureLoaded, subscribe, setPrefs } from '@/utils/keycloakPrefs'

describe('keycloakPrefs', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('carga preferencias desde la API', async () => {
    apiFetch.mockResolvedValue({
      json: async () => ({ data: { perPage: 25 } }),
    })

    const prefs = await ensureLoaded('actors_v1')

    expect(apiFetch).toHaveBeenCalledWith('/api/user-prefs?key=actors_v1')
    expect(prefs).toEqual({ perPage: 25 })
  })

  it('devuelve objeto vacío si la API falla', async () => {
    apiFetch.mockRejectedValue(new Error('network'))

    const prefs = await ensureLoaded('actors_v2')

    expect(prefs).toEqual({})
  })

  it('reutiliza la caché en llamadas posteriores', async () => {
    apiFetch.mockResolvedValue({
      json: async () => ({ data: { sortBy: 'name' } }),
    })

    await ensureLoaded('actors_v3')
    await ensureLoaded('actors_v3')

    expect(apiFetch).toHaveBeenCalledTimes(1)
  })

  it('notifica a los suscriptores al cargar', async () => {
    const listener = vi.fn()
    apiFetch.mockResolvedValue({
      json: async () => ({ data: { visible: ['id'] } }),
    })

    subscribe('actors_v4', listener)
    await ensureLoaded('actors_v4')

    expect(listener).toHaveBeenCalledWith({ visible: ['id'] })
  })

  it('notifica inmediatamente si las prefs ya están cargadas', async () => {
    apiFetch.mockResolvedValue({
      json: async () => ({ data: { page: 2 } }),
    })

    await ensureLoaded('actors_v5')
    const listener = vi.fn()
    subscribe('actors_v5', listener)

    expect(listener).toHaveBeenCalledWith({ page: 2 })
  })

  it('permite desuscribirse', async () => {
    apiFetch.mockResolvedValue({
      json: async () => ({ data: {} }),
    })

    const listener = vi.fn()
    const unsubscribe = subscribe('actors_v6', listener)
    unsubscribe()

    await ensureLoaded('actors_v6')

    expect(listener).not.toHaveBeenCalled()
  })

  it('guarda preferencias con debounce', async () => {
    apiFetch.mockResolvedValue({ ok: true })

    setPrefs('actors_v7', { perPage: 100 })

    expect(apiFetch).not.toHaveBeenCalledWith(
      '/api/user-prefs?key=actors_v7',
      expect.objectContaining({ method: 'POST' })
    )

    await vi.advanceTimersByTimeAsync(1500)

    expect(apiFetch).toHaveBeenCalledWith('/api/user-prefs?key=actors_v7', {
      method: 'POST',
      body: JSON.stringify({ perPage: 100 }),
    })
  })
})
