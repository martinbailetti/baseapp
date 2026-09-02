import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { Film } from 'lucide-react'
import { describe, it, expect, vi } from 'vitest'
import NavDropdown from '@/components/navbar/NavDropdown'
import { routerFuture } from '../../utils/routerFuture'

const subitems = [
  { to: '/movies', labelKey: 'nav.movies', Icon: Film, requiredRole: 'admin' },
  { to: '/actors', labelKey: 'nav.actors', Icon: Film, requiredRole: 'user' },
]

const renderDropdown = (props = {}) =>
  render(
    <MemoryRouter future={routerFuture}>
      <NavDropdown
        label="Cine"
        Icon={Film}
        subitems={subitems}
        pathname="/"
        hasRole={(role) => role === 'admin'}
        {...props}
      />
    </MemoryRouter>
  )

describe('NavDropdown', () => {
  it('renderiza el botón con la etiqueta', () => {
    renderDropdown()
    expect(screen.getByRole('button', { name: /Cine/i })).toBeInTheDocument()
  })

  it('muestra sub-ítems visibles al abrir el menú', async () => {
    const user = userEvent.setup()
    renderDropdown()
    await user.click(screen.getByRole('button', { name: /Cine/i }))
    expect(screen.getByRole('link', { name: /Películas/i })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /Actores/i })).not.toBeInTheDocument()
  })

  it('cierra el menú al hacer clic fuera', async () => {
    const user = userEvent.setup()
    renderDropdown()
    await user.click(screen.getByRole('button', { name: /Cine/i }))
    expect(screen.getByRole('link', { name: /Películas/i })).toBeInTheDocument()

    fireEvent.mouseDown(document.body)
    expect(screen.queryByRole('link', { name: /Películas/i })).not.toBeInTheDocument()
  })

  it('cierra el menú al seleccionar un sub-ítem', async () => {
    const user = userEvent.setup()
    renderDropdown()
    await user.click(screen.getByRole('button', { name: /Cine/i }))
    await user.click(screen.getByRole('link', { name: /Películas/i }))
    expect(screen.queryByRole('link', { name: /Películas/i })).not.toBeInTheDocument()
  })

  it('marca el botón como activo cuando pathname coincide con un sub-ítem', () => {
    renderDropdown({ pathname: '/movies' })
    expect(screen.getByRole('button', { name: /Cine/i })).toHaveClass('text-indigo-700')
  })

  it('alterna abierto/cerrado al pulsar el botón', async () => {
    const user = userEvent.setup()
    renderDropdown()
    const button = screen.getByRole('button', { name: /Cine/i })

    await user.click(button)
    expect(screen.getByRole('link', { name: /Películas/i })).toBeInTheDocument()

    await user.click(button)
    expect(screen.queryByRole('link', { name: /Películas/i })).not.toBeInTheDocument()
  })
})
