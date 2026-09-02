import { useMemo } from 'react'
import { apiJson } from '@/utils/apiFetch'

/**
 * Hook que encapsula las operaciones CRUD comunes contra un endpoint REST.
 *
 * Devuelve `{ save, remove }`:
 * - `save(form, id)`  → POST si no hay id, PUT si lo hay. Devuelve el recurso.
 * - `remove(row)`     → DELETE del recurso por `row.id`.
 *
 * Ambas lanzan `ApiError` en caso de fallo (mensaje legible incluido), por lo
 * que el llamante puede capturarlo y mostrar el feedback que corresponda.
 *
 * @param {string} endpoint  Ruta base, p.ej. '/api/movies'
 */
export function useCrudResource(endpoint) {
  return useMemo(
    () => ({
      save(form, id) {
        return apiJson(id ? `${endpoint}/${id}` : endpoint, {
          method: id ? 'PUT' : 'POST',
          body: JSON.stringify(form),
        })
      },
      remove(row) {
        return apiJson(`${endpoint}/${row.id}`, { method: 'DELETE' })
      },
    }),
    [endpoint]
  )
}
