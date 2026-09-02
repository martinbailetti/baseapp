import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/hooks/useDarkMode', () => ({
  useDarkMode: vi.fn(),
}))

import { useDarkMode } from '@/hooks/useDarkMode'
import DarkModeSwitch from '@/components/profile/DarkModeSwitch'

describe('DarkModeSwitch', () => {
  beforeEach(() => {
    useDarkMode.mockReturnValue([false, vi.fn()])
  })

  it('muestra estado claro', () => {
    render(<DarkModeSwitch />)
    expect(screen.getByText('Modo oscuro')).toBeInTheDocument()
    expect(screen.getByText('Desactivado')).toBeInTheDocument()
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false')
  })

  it('muestra estado oscuro', () => {
    useDarkMode.mockReturnValue([true, vi.fn()])
    render(<DarkModeSwitch />)
    expect(screen.getByText('Activado')).toBeInTheDocument()
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true')
  })

  it('alterna el modo al pulsar el switch', async () => {
    const user = userEvent.setup()
    const setDark = vi.fn()
    useDarkMode.mockReturnValue([false, setDark])
    render(<DarkModeSwitch />)
    await user.click(screen.getByRole('switch'))
    expect(setDark).toHaveBeenCalledOnce()
  })
})
