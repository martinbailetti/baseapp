import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/utils/apiFetch', () => ({
  apiFetch: vi.fn(),
}))

import { apiFetch } from '@/utils/apiFetch'
import { useLanguage } from '@/hooks/useLanguage'
import i18n from '@/i18n'

describe('useLanguage', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    apiFetch.mockResolvedValue({ ok: false })
    await i18n.changeLanguage('es')
  })

  it('devuelve el idioma activo', () => {
    const { result } = renderHook(() => useLanguage())
    expect(result.current.lang).toBe('es')
  })

  it('cambia idioma y lo persiste en la API', async () => {
    apiFetch.mockResolvedValue({ ok: true })
    const { result } = renderHook(() => useLanguage())

    act(() => result.current.changeLanguage('ca'))

    expect(result.current.lang).toBe('ca')
    await waitFor(() => {
      expect(apiFetch).toHaveBeenCalledWith('/api/user-prefs?key=lang', {
        method: 'POST',
        body: JSON.stringify({ lang: 'ca' }),
      })
    })
  })

  it('ignora idiomas no soportados', async () => {
    const { result } = renderHook(() => useLanguage())

    await waitFor(() => {
      expect(apiFetch).toHaveBeenCalledWith('/api/user-prefs?key=lang')
    })

    act(() => result.current.changeLanguage('fr'))

    expect(result.current.lang).toBe('es')
    expect(apiFetch).toHaveBeenCalledTimes(1)
  })

  it('carga idioma desde la API al montar', async () => {
    apiFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { lang: 'en' } }),
    })

    renderHook(() => useLanguage())

    await waitFor(() => {
      expect(i18n.resolvedLanguage).toBe('en')
    })
  })
})
