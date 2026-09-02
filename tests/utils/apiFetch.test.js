import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockSetToken = vi.fn()
const mockSetUser = vi.fn()
const mockReset = vi.fn()
const mockFetch = vi.fn()

vi.mock('@/store/useAuthStore', () => ({
  default: {
    getState: vi.fn(() => ({
      token: 'stored-token',
      isAuthenticated: true,
      refreshToken: 'stored-refresh',
      setToken: mockSetToken,
      setUser: mockSetUser,
      reset: mockReset,
    })),
  },
}))

vi.mock('@/utils/tokenRefresh', () => ({
  ensureFreshToken: vi.fn().mockResolvedValue(undefined),
  tryRefreshToken: vi.fn().mockResolvedValue(false),
}))

vi.mock('@/utils/authSession', () => ({
  clearRefreshToken: vi.fn(),
}))

import useAuthStore from '@/store/useAuthStore'
import { tryRefreshToken } from '@/utils/tokenRefresh'
import { clearRefreshToken } from '@/utils/authSession'
import { apiFetch, apiJson, ApiError } from '@/utils/apiFetch'

describe('ApiError', () => {
  it('expone status, errors y data', () => {
    const error = new ApiError('Fallo', {
      status: 422,
      errors: { name: ['requerido'] },
      data: { id: 1 },
    })

    expect(error.name).toBe('ApiError')
    expect(error.message).toBe('Fallo')
    expect(error.status).toBe(422)
    expect(error.errors).toEqual({ name: ['requerido'] })
    expect(error.data).toEqual({ id: 1 })
  })
})

describe('apiFetch', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = mockFetch
    tryRefreshToken.mockResolvedValue(false)
    useAuthStore.getState.mockReturnValue({
      token: 'stored-token',
      isAuthenticated: true,
      refreshToken: 'stored-refresh',
      setToken: mockSetToken,
      setUser: mockSetUser,
      reset: mockReset,
    })
  })

  it('añade Authorization cuando hay token', async () => {
    mockFetch.mockResolvedValue({ ok: true })

    await apiFetch('/api/movies')

    expect(mockFetch).toHaveBeenCalledWith('/api/movies', {
      headers: { Authorization: 'Bearer stored-token' },
    })
  })

  it('no añade Authorization sin token', async () => {
    useAuthStore.getState.mockReturnValue({
      token: null,
      isAuthenticated: false,
      setToken: mockSetToken,
      setUser: mockSetUser,
      reset: mockReset,
    })
    mockFetch.mockResolvedValue({ ok: true })

    await apiFetch('/api/movies')

    expect(mockFetch).toHaveBeenCalledWith('/api/movies', { headers: {} })
  })

  it('añade Content-Type para body JSON', async () => {
    mockFetch.mockResolvedValue({ ok: true })

    await apiFetch('/api/movies', { method: 'POST', body: '{"name":"Nuevo"}' })

    expect(mockFetch).toHaveBeenCalledWith('/api/movies', {
      method: 'POST',
      body: '{"name":"Nuevo"}',
      headers: {
        Authorization: 'Bearer stored-token',
        'Content-Type': 'application/json',
      },
    })
  })

  it('no sobreescribe Content-Type existente', async () => {
    mockFetch.mockResolvedValue({ ok: true })

    await apiFetch('/api/upload', {
      method: 'POST',
      body: 'raw',
      headers: { 'Content-Type': 'text/plain' },
    })

    expect(mockFetch).toHaveBeenCalledWith('/api/upload', {
      method: 'POST',
      body: 'raw',
      headers: {
        Authorization: 'Bearer stored-token',
        'Content-Type': 'text/plain',
      },
    })
  })

  it('no añade Content-Type para FormData', async () => {
    mockFetch.mockResolvedValue({ ok: true })
    const body = new FormData()
    body.append('file', 'data')

    await apiFetch('/api/upload', { method: 'POST', body })

    const [, options] = mockFetch.mock.calls[0]
    expect(options.headers['Content-Type']).toBeUndefined()
    expect(options.body).toBe(body)
  })

  it('refresca el token y reintenta ante un 401', async () => {
    tryRefreshToken.mockResolvedValue(true)
    mockFetch
      .mockResolvedValueOnce({ ok: false, status: 401 })
      .mockResolvedValueOnce({ ok: true, status: 200 })

    const res = await apiFetch('/api/movies')

    expect(res.status).toBe(200)
    expect(tryRefreshToken).toHaveBeenCalled()
    expect(mockFetch).toHaveBeenCalledTimes(2)
  })
})

describe('apiJson', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = mockFetch
    tryRefreshToken.mockResolvedValue(false)
    useAuthStore.getState.mockReturnValue({
      token: 'stored-token',
      isAuthenticated: true,
      refreshToken: 'stored-refresh',
      setToken: mockSetToken,
      setUser: mockSetUser,
      reset: mockReset,
    })
  })

  it('devuelve json.data en respuestas correctas', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true, data: { id: 7 } }),
    })

    await expect(apiJson('/api/movies/7')).resolves.toEqual({ id: 7 })
  })

  it('lanza ApiError ante fallo de red', async () => {
    mockFetch.mockRejectedValue(new Error('offline'))

    await expect(apiJson('/api/movies')).rejects.toMatchObject({
      message: 'Error de conexión con el servidor',
      status: 0,
    })
  })

  it('refresca el token y reintenta ante un 401', async () => {
    tryRefreshToken.mockResolvedValue(true)
    mockFetch
      .mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ success: false }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true, data: ['ok'] }),
      })

    await expect(apiJson('/api/movies')).resolves.toEqual(['ok'])

    expect(tryRefreshToken).toHaveBeenCalled()
    expect(mockFetch).toHaveBeenCalledTimes(2)
  })

  it('cierra sesión si el 401 persiste tras refrescar', async () => {
    tryRefreshToken.mockResolvedValue(true)
    mockFetch.mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ success: false }),
    })

    await expect(apiJson('/api/movies')).rejects.toMatchObject({
      message: 'Sesión expirada',
      status: 401,
    })

    expect(clearRefreshToken).toHaveBeenCalled()
    expect(mockReset).toHaveBeenCalled()
  })

  it('lanza ApiError con mensaje y errores de validación', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 422,
      json: async () => ({
        success: false,
        message: 'Datos inválidos',
        errors: { title: ['obligatorio'] },
        data: null,
      }),
    })

    await expect(apiJson('/api/movies', { method: 'POST', body: '{}' })).rejects.toMatchObject({
      message: 'Datos inválidos',
      status: 422,
      errors: { title: ['obligatorio'] },
    })
  })

  it('usa mensaje genérico si la respuesta no tiene JSON', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => { throw new Error('invalid json') },
    })

    await expect(apiJson('/api/movies')).rejects.toMatchObject({
      message: 'Error 500',
      status: 500,
    })
  })
})
