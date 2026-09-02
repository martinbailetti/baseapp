import { renderHook } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/utils/apiFetch', () => ({
  apiJson: vi.fn(),
}))

import { apiJson } from '@/utils/apiFetch'
import { useCrudResource } from '@/hooks/useCrudResource'

describe('useCrudResource', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('crea un recurso con POST cuando no hay id', () => {
    apiJson.mockResolvedValue({ id: 1, name: 'Nuevo' })
    const { result } = renderHook(() => useCrudResource('/api/movies'))

    result.current.save({ name: 'Nuevo' })

    expect(apiJson).toHaveBeenCalledWith('/api/movies', {
      method: 'POST',
      body: JSON.stringify({ name: 'Nuevo' }),
    })
  })

  it('actualiza un recurso con PUT cuando hay id', () => {
    apiJson.mockResolvedValue({ id: 5, name: 'Editado' })
    const { result } = renderHook(() => useCrudResource('/api/movies'))

    result.current.save({ name: 'Editado' }, 5)

    expect(apiJson).toHaveBeenCalledWith('/api/movies/5', {
      method: 'PUT',
      body: JSON.stringify({ name: 'Editado' }),
    })
  })

  it('elimina un recurso con DELETE', () => {
    apiJson.mockResolvedValue({ success: true })
    const { result } = renderHook(() => useCrudResource('/api/actors'))

    result.current.remove({ id: 9 })

    expect(apiJson).toHaveBeenCalledWith('/api/actors/9', { method: 'DELETE' })
  })

  it('memoiza las funciones mientras el endpoint no cambia', () => {
    const { result, rerender } = renderHook(
      ({ endpoint }) => useCrudResource(endpoint),
      { initialProps: { endpoint: '/api/movies' } }
    )

    const first = result.current
    rerender({ endpoint: '/api/movies' })
    expect(result.current).toBe(first)

    rerender({ endpoint: '/api/actors' })
    expect(result.current).not.toBe(first)
  })
})
