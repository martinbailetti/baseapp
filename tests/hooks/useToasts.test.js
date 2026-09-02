import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useToasts } from '@/hooks/useToasts'

describe('useToasts', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('inicia sin toasts', () => {
    const { result } = renderHook(() => useToasts())
    expect(result.current.toasts).toEqual([])
  })

  it('añade un toast de éxito', () => {
    const { result } = renderHook(() => useToasts())

    act(() => result.current.addToast('Guardado correctamente'))

    expect(result.current.toasts).toHaveLength(1)
    expect(result.current.toasts[0]).toMatchObject({
      message: 'Guardado correctamente',
      type: 'success',
    })
  })

  it('añade un toast de error', () => {
    const { result } = renderHook(() => useToasts())

    act(() => result.current.addToast('Ha fallado', 'error'))

    expect(result.current.toasts[0].type).toBe('error')
  })

  it('elimina el toast tras el timeout', () => {
    const { result } = renderHook(() => useToasts(1000))

    act(() => result.current.addToast('Temporal'))
    expect(result.current.toasts).toHaveLength(1)

    act(() => vi.advanceTimersByTime(1000))
    expect(result.current.toasts).toHaveLength(0)
  })
})
