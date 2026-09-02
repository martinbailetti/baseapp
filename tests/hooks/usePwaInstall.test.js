import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { usePwaInstall } from '@/hooks/usePwaInstall'

describe('usePwaInstall', () => {
  let listeners

  beforeEach(() => {
    listeners = {}
    vi.spyOn(window, 'addEventListener').mockImplementation((event, handler) => {
      listeners[event] = handler
    })
    vi.spyOn(window, 'removeEventListener').mockImplementation((event) => {
      delete listeners[event]
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('inicia sin prompt disponible', () => {
    const { result } = renderHook(() => usePwaInstall())
    expect(result.current.canInstall).toBe(false)
  })

  it('detecta el evento beforeinstallprompt', () => {
    const { result } = renderHook(() => usePwaInstall())
    const event = { preventDefault: vi.fn() }

    act(() => listeners.beforeinstallprompt(event))

    expect(event.preventDefault).toHaveBeenCalledOnce()
    expect(result.current.canInstall).toBe(true)
  })

  it('llama prompt al instalar', async () => {
    const { result } = renderHook(() => usePwaInstall())
    const prompt = vi.fn().mockResolvedValue(undefined)
    const event = { preventDefault: vi.fn(), prompt }

    act(() => listeners.beforeinstallprompt(event))

    await act(async () => {
      await result.current.install()
    })

    expect(prompt).toHaveBeenCalledOnce()
    expect(result.current.canInstall).toBe(false)
  })

  it('descarta el prompt', () => {
    const { result } = renderHook(() => usePwaInstall())

    act(() => listeners.beforeinstallprompt({ preventDefault: vi.fn() }))
    expect(result.current.canInstall).toBe(true)

    act(() => result.current.dismiss())
    expect(result.current.canInstall).toBe(false)
  })

  it('no hace nada si install se llama sin prompt', async () => {
    const { result } = renderHook(() => usePwaInstall())

    await act(async () => {
      await result.current.install()
    })

    expect(result.current.canInstall).toBe(false)
  })
})
