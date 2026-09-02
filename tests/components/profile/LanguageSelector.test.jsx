import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/hooks/useLanguage', () => ({
  useLanguage: vi.fn(),
}))

import { useLanguage } from '@/hooks/useLanguage'
import LanguageSelector from '@/components/profile/LanguageSelector'

describe('LanguageSelector', () => {
  beforeEach(() => {
    useLanguage.mockReturnValue({ lang: 'es', changeLanguage: vi.fn() })
  })

  it('renderiza botones de idioma', () => {
    render(<LanguageSelector />)
    expect(screen.getByRole('button', { name: 'ES' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'CA' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'EN' })).toBeInTheDocument()
  })

  it('marca el idioma activo', () => {
    render(<LanguageSelector />)
    expect(screen.getByRole('button', { name: 'ES' })).toHaveClass('bg-indigo-600')
  })

  it('llama changeLanguage al seleccionar otro idioma', async () => {
    const user = userEvent.setup()
    const changeLanguage = vi.fn()
    useLanguage.mockReturnValue({ lang: 'es', changeLanguage })
    render(<LanguageSelector />)
    await user.click(screen.getByRole('button', { name: 'EN' }))
    expect(changeLanguage).toHaveBeenCalledWith('en')
  })
})
