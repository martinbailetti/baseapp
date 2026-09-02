import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import UserMenu from '@/components/navbar/UserMenu'
import { routerFuture } from '../../utils/routerFuture'

const renderUserMenu = (props = {}) =>
  render(
    <MemoryRouter future={routerFuture}>
      <UserMenu
        user={{ name: 'Ana García', preferred_username: 'ana' }}
        onLogout={vi.fn()}
        {...props}
      />
    </MemoryRouter>
  )

describe('UserMenu', () => {
  it('muestra el nombre del usuario en el botón', () => {
    renderUserMenu()
    expect(screen.getByRole('button', { name: /Ana García/i })).toBeInTheDocument()
  })

  it('usa preferred_username si no hay name', () => {
    renderUserMenu({ user: { preferred_username: 'usuario123' } })
    expect(screen.getByRole('button', { name: /usuario123/i })).toBeInTheDocument()
  })

  it('muestra perfil y logout al abrir el menú', async () => {
    const user = userEvent.setup()
    renderUserMenu()
    await user.click(screen.getByRole('button', { name: /Ana García/i }))
    expect(screen.getByRole('link', { name: /Mi Cuenta/i })).toHaveAttribute('href', '/profile')
    expect(screen.getByRole('button', { name: /Salir/i })).toBeInTheDocument()
  })

  it('llama onLogout al pulsar Salir', async () => {
    const user = userEvent.setup()
    const onLogout = vi.fn()
    renderUserMenu({ onLogout })
    await user.click(screen.getByRole('button', { name: /Ana García/i }))
    await user.click(screen.getByRole('button', { name: /Salir/i }))
    expect(onLogout).toHaveBeenCalledOnce()
  })

  it('cierra el menú al hacer clic fuera', async () => {
    const user = userEvent.setup()
    renderUserMenu()
    await user.click(screen.getByRole('button', { name: /Ana García/i }))
    expect(screen.getByRole('link', { name: /Mi Cuenta/i })).toBeInTheDocument()

    fireEvent.mouseDown(document.body)
    expect(screen.queryByRole('link', { name: /Mi Cuenta/i })).not.toBeInTheDocument()
  })

  it('cierra el menú al ir a perfil', async () => {
    const user = userEvent.setup()
    renderUserMenu()
    await user.click(screen.getByRole('button', { name: /Ana García/i }))
    await user.click(screen.getByRole('link', { name: /Mi Cuenta/i }))
    expect(screen.queryByRole('link', { name: /Mi Cuenta/i })).not.toBeInTheDocument()
  })
})
