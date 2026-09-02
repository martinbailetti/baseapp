import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { routerFuture } from '../utils/routerFuture'

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}))

import { useAuth } from '@/hooks/useAuth'
import Navbar from '@/components/Navbar'
import { APP_NAME } from '@/utils/appConfig'

const renderNavbar = (pathname = '/') =>
  render(
    <MemoryRouter initialEntries={[pathname]} future={routerFuture}>
      <Navbar />
    </MemoryRouter>
  )

describe('Navbar', () => {
  beforeEach(() => {
    useAuth.mockReturnValue({
      user: { name: 'Martín López', preferred_username: 'martin' },
      logout: vi.fn(),
      hasRole: vi.fn(() => true),
    })
  })

  it('muestra el nombre de la app', () => {
    renderNavbar()
    expect(screen.getAllByAltText(APP_NAME).length).toBeGreaterThan(0)
  })

  it('muestra el nombre del usuario en el botón del menú', () => {
    renderNavbar()
    expect(screen.getByRole('button', { name: /Martín López/i })).toBeInTheDocument()
  })

  it('renderiza el enlace Perfil al abrir el menú de usuario', () => {
    renderNavbar()
    const userButton = screen.getByRole('button', { name: /Martín López/i })
    fireEvent.click(userButton)
    expect(screen.getByRole('link', { name: /Mi Cuenta/i })).toBeInTheDocument()
  })

  it('llama a logout al pulsar Salir', () => {
    const logout = vi.fn()
    useAuth.mockReturnValue({
      user: { name: 'Test', preferred_username: 'test' },
      logout,
      hasRole: vi.fn(() => true),
    })
    renderNavbar()
    
    // Abrir el menú de usuario
    const userButton = screen.getByRole('button', { name: /Test/i })
    fireEvent.click(userButton)
    
    // Pulsar botón Salir
    const logoutButton = screen.getByRole('button', { name: /Salir/i })
    fireEvent.click(logoutButton)
    
    expect(logout).toHaveBeenCalledOnce()
  })
})

