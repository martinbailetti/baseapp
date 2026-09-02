import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import { routerFuture } from '../utils/routerFuture'

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}))

import { useAuth } from '@/hooks/useAuth'
import ProtectedRoute from '@/components/ProtectedRoute'

const ProtectedContent = () => <div>Contenido protegido</div>

const renderRoute = () =>
  render(
    <MemoryRouter initialEntries={['/']} future={routerFuture}>
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <ProtectedContent />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<div>Página de login</div>} />
        <Route path="/unauthorized" element={<div>Acceso denegado</div>} />
      </Routes>
    </MemoryRouter>
  )

describe('ProtectedRoute', () => {
  it('muestra children cuando está autenticado y tiene los roles', () => {
    useAuth.mockReturnValue({ isAuthenticated: true, isLoading: false, hasRequiredRoles: true })
    renderRoute()
    expect(screen.getByText('Contenido protegido')).toBeInTheDocument()
  })

  it('redirige a /login si no está autenticado', () => {
    useAuth.mockReturnValue({ isAuthenticated: false, isLoading: false, hasRequiredRoles: false })
    renderRoute()
    expect(screen.getByText('Página de login')).toBeInTheDocument()
  })

  it('redirige a /unauthorized si está autenticado pero sin roles', () => {
    useAuth.mockReturnValue({ isAuthenticated: true, isLoading: false, hasRequiredRoles: false })
    renderRoute()
    expect(screen.getByText('Acceso denegado')).toBeInTheDocument()
  })

  it('muestra el spinner mientras se carga la autenticación', () => {
    useAuth.mockReturnValue({ isAuthenticated: false, isLoading: true, hasRequiredRoles: false })
    renderRoute()
    expect(screen.getByRole('status', { name: 'Cargando' })).toBeInTheDocument()
  })
})
