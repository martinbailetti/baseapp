import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

vi.mock('@/hooks/usePwaInstall', () => ({
  usePwaInstall: vi.fn(),
}))

import { usePwaInstall } from '@/hooks/usePwaInstall'

const mobileEnv = () => {
  Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 375 })
  Object.defineProperty(navigator, 'userAgent', {
    writable: true,
    configurable: true,
    value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
  })
}

const renderBanner = async (enabled = 'true') => {
  vi.stubEnv('VITE_ENABLE_INSTALL_PROMPT', enabled)
  vi.resetModules()
  mobileEnv()
  usePwaInstall.mockReturnValue({
    canInstall: true,
    install: vi.fn(),
    dismiss: vi.fn(),
  })
  const { default: PwaInstallBanner } = await import('@/components/PwaInstallBanner')
  return render(<PwaInstallBanner />)
}

describe('PwaInstallBanner', () => {
  beforeEach(() => {
    mobileEnv()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  it('no renderiza si el prompt está deshabilitado', async () => {
    const { container } = await renderBanner('false')
    expect(container).toBeEmptyDOMElement()
  })

  it('no renderiza si no se puede instalar', async () => {
    vi.stubEnv('VITE_ENABLE_INSTALL_PROMPT', 'true')
    vi.resetModules()
    usePwaInstall.mockReturnValue({
      canInstall: false,
      install: vi.fn(),
      dismiss: vi.fn(),
    })
    const { default: PwaInstallBanner } = await import('@/components/PwaInstallBanner')
    const { container } = render(<PwaInstallBanner />)
    expect(container).toBeEmptyDOMElement()
  })

  it('muestra banner en móvil cuando puede instalar', async () => {
    await renderBanner()
    expect(await screen.findByText('Instalar aplicacion')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Instalar' })).toBeInTheDocument()
  })

  it('llama install y dismiss', async () => {
    const user = userEvent.setup()
    const install = vi.fn()
    const dismiss = vi.fn()

    vi.stubEnv('VITE_ENABLE_INSTALL_PROMPT', 'true')
    vi.resetModules()
    mobileEnv()
    usePwaInstall.mockReturnValue({ canInstall: true, install, dismiss })
    const { default: PwaInstallBanner } = await import('@/components/PwaInstallBanner')
    render(<PwaInstallBanner />)

    await user.click(await screen.findByRole('button', { name: 'Instalar' }))
    expect(install).toHaveBeenCalledOnce()

    const dismissButton = screen.getAllByRole('button').find((btn) => !btn.textContent?.includes('Instalar'))
    await user.click(dismissButton)
    expect(dismiss).toHaveBeenCalledOnce()
  })
})
