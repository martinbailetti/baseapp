import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

vi.mock('@/utils/apiFetch', () => ({
  apiFetch: vi.fn(),
}))

import { apiFetch } from '@/utils/apiFetch'
import { useDarkMode } from '@/hooks/useDarkMode'

describe('useDarkMode', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove('dark')
    apiFetch.mockResolvedValue({ ok: false })
    vi.spyOn(window, 'matchMedia').mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('inicia en false si no hay preferencia guardada', () => {
    const { result } = renderHook(() => useDarkMode())
    expect(result.current[0]).toBe(false)
  })

  it('lee el valor inicial desde localStorage', () => {
    localStorage.setItem('dark_mode', 'true')
    const { result } = renderHook(() => useDarkMode())
    expect(result.current[0]).toBe(true)
  })

  it('aplica la clase dark al documento al activarse', () => {
    const { result } = renderHook(() => useDarkMode())
    act(() => result.current[1](true))
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(localStorage.getItem('dark_mode')).toBe('true')
  })

  it('alterna el modo al llamar toggle sin argumento', () => {
    const { result } = renderHook(() => useDarkMode())
    act(() => result.current[1]())
    expect(result.current[0]).toBe(true)
    act(() => result.current[1]())
    expect(result.current[0]).toBe(false)
  })

  it('carga preferencia desde la API al montar', async () => {
    apiFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { dark_mode: true } }),
    })

    const { result } = renderHook(() => useDarkMode())

    await waitFor(() => {
      expect(result.current[0]).toBe(true)
    })
    expect(apiFetch).toHaveBeenCalledWith('/api/user-prefs?key=ui_prefs')
  })

  it('persiste el cambio en la API', async () => {
    apiFetch.mockResolvedValue({ ok: true })
    const { result } = renderHook(() => useDarkMode())

    act(() => result.current[1](true))

    await waitFor(() => {
      expect(apiFetch).toHaveBeenCalledWith('/api/user-prefs?key=ui_prefs', {
        method: 'POST',
        body: JSON.stringify({ dark_mode: true }),
      })
    })
  })
})
