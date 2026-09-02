import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import MobileAccountSection from '@/components/navbar/MobileAccountSection'
import { routerFuture } from '../../utils/routerFuture'

const renderSection = (props = {}) =>
  render(
    <MemoryRouter future={routerFuture}>
      <MobileAccountSection
        user={{ name: 'Carlos Ruiz', preferred_username: 'carlos' }}
        onLogout={vi.fn()}
        onNavigate={vi.fn()}
        {...props}
      />
    </MemoryRouter>
  )

describe('MobileAccountSection', () => {
  it('muestra enlace al perfil con el nombre del usuario', () => {
    renderSection()
    const profileLink = screen.getByRole('link', { name: 'Carlos Ruiz' })
    expect(profileLink).toHaveAttribute('href', '/profile')
  })

  it('usa preferred_username si no hay name', () => {
    renderSection({ user: { preferred_username: 'movil-user' } })
    expect(screen.getByRole('link', { name: 'movil-user' })).toBeInTheDocument()
  })

  it('llama onNavigate al pulsar el enlace de perfil', async () => {
    const user = userEvent.setup()
    const onNavigate = vi.fn()
    renderSection({ onNavigate })
    await user.click(screen.getByRole('link', { name: 'Carlos Ruiz' }))
    expect(onNavigate).toHaveBeenCalledOnce()
  })

  it('llama onNavigate y onLogout al pulsar Salir', async () => {
    const user = userEvent.setup()
    const onNavigate = vi.fn()
    const onLogout = vi.fn()
    renderSection({ onNavigate, onLogout })
    await user.click(screen.getByRole('button', { name: /Salir/i }))
    expect(onNavigate).toHaveBeenCalledOnce()
    expect(onLogout).toHaveBeenCalledOnce()
  })
})
