import useAuthStore from '@/store/useAuthStore'
import keycloak from '@/utils/keycloak'
import { ensureFreshToken, tryRefreshToken } from '@/utils/tokenRefresh'
import { API_URL, TOKEN_MIN_VALIDITY_SECONDS } from '@/config/defaults'

/**
 * Error tipado para respuestas de la API.
 * Expone status HTTP, errores de validación por campo y el payload `data`.
 */
export class ApiError extends Error {
  constructor(message, { status = 0, errors = null, data = null } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors
    this.data = data
  }
}

function hasHeader(headers, name) {
  return Object.keys(headers).some((k) => k.toLowerCase() === name.toLowerCase())
}

/**
 * Wrapper sobre fetch que añade automáticamente el header Authorization
 * con el JWT de Keycloak almacenado en el store.
 *
 * El header `Content-Type: application/json` solo se añade cuando hay body
 * y no es un FormData (para no romper subidas de archivos ni peticiones GET).
 *
 * Uso:
 *   apiFetch('/api/movies')
 *   apiFetch('/api/movies/1', { method: 'PUT', body: JSON.stringify(data) })
 */
export async function apiFetch(path, options = {}) {
  await ensureFreshToken(TOKEN_MIN_VALIDITY_SECONDS)

  const makeRequest = () => {
    const token = useAuthStore.getState().token
    const headers = { ...(options.headers || {}) }

    const hasBody = options.body !== undefined && options.body !== null
    const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData

    if (hasBody && !isFormData && !hasHeader(headers, 'Content-Type')) {
      headers['Content-Type'] = 'application/json'
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    return fetch(`${API_URL}${path}`, { ...options, headers })
  }

  let res = await makeRequest()

  if (res.status === 401) {
    const refreshed = await tryRefreshToken(-1)
    if (refreshed) {
      res = await makeRequest()
    }
  }

  return res
}

/**
 * Realiza una petición a la API y devuelve directamente `json.data`.
 *
 * - Parsea el JSON y lanza `ApiError` si la respuesta no es correcta.
 * - Ante un 401 intenta refrescar el token una vez; si sigue fallando,
 *   cierra la sesión y lanza `ApiError`.
 * - Convierte errores de red en un `ApiError` con mensaje legible.
 *
 * @template T
 * @param {string} path
 * @param {RequestInit} [options]
 * @returns {Promise<T>}
 */
export async function apiJson(path, options = {}) {
  let res
  try {
    res = await apiFetch(path, options)
  } catch {
    throw new ApiError('Error de conexión con el servidor', { status: 0 })
  }

  if (res.status === 401) {
    try {
      keycloak.logout({ redirectUri: window.location.origin + '/' })
    } catch {
      /* noop */
    }
    throw new ApiError('Sesión expirada', { status: 401 })
  }

  let json = null
  try {
    json = await res.json()
  } catch {
    json = null
  }

  if (!res.ok || !json || json.success === false) {
    throw new ApiError(json?.message || `Error ${res.status}`, {
      status: res.status,
      errors: json?.errors ?? null,
      data: json?.data ?? null,
    })
  }

  return json.data
}

export { API_URL }
