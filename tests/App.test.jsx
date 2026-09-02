import { screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderApp, setupApiFetchMock } from './utils/renderApp'

const findPageHeading = (name, options = {}) =>
  screen.findByRole('heading', { name, ...options }, { timeout: 5000 })

describe('App routes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setupApiFetchMock()
    Object.defineProperty(navigator, 'onLine', {
      configurable: true,
      value: true,
    })
  })

  it('muestra LoadingPage mientras Keycloak inicializa', () => {
    renderApp('/', { isLoading: true })
    expect(screen.getByText('Iniciando sesión...')).toBeInTheDocument()
  })

  it('redirige / a /home para usuarios autenticados', async () => {
    renderApp('/')
    expect(await findPageHeading('BaseKit', { level: 1 })).toBeInTheDocument()
  })

  it('renderiza /login para usuarios no autenticados', async () => {
    renderApp('/login', {
      isAuthenticated: false,
      hasRequiredRoles: false,
      hasRole: () => false,
    })
    expect(await screen.findByText('Portal de administración')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Iniciar sesión con Keycloak/i })).toBeInTheDocument()
  })

  it('redirige /login a /home si el usuario ya está autenticado', async () => {
    renderApp('/login')
    expect(await findPageHeading('BaseKit', { level: 1 })).toBeInTheDocument()
  })

  it('renderiza /unauthorized', async () => {
    renderApp('/unauthorized', {
      isAuthenticated: true,
      hasRequiredRoles: false,
      hasRole: () => false,
    })
    expect(await screen.findByRole('heading', { name: 'Acceso denegado', level: 1 })).toBeInTheDocument()
  })

  it('redirige rutas protegidas a /login sin autenticación', async () => {
    renderApp('/home', {
      isAuthenticated: false,
      hasRequiredRoles: false,
      hasRole: () => false,
    })
    expect(await screen.findByText('Portal de administración')).toBeInTheDocument()
  })

  it('redirige rutas con rol requerido a /unauthorized sin permisos', async () => {
    renderApp('/peliculas', {
      isAuthenticated: true,
      hasRequiredRoles: true,
      hasRole: () => false,
    })
    expect(await screen.findByRole('heading', { name: 'Acceso denegado', level: 1 })).toBeInTheDocument()
  })

  it('renderiza /home', async () => {
    renderApp('/home')
    expect(await findPageHeading('BaseKit', { level: 1 })).toBeInTheDocument()
  })

  it('renderiza /profile', async () => {
    renderApp('/profile')
    expect(await findPageHeading('Mi perfil', { level: 1 })).toBeInTheDocument()
  })

  it('renderiza /peliculas', async () => {
    renderApp('/peliculas')
    expect(await findPageHeading('Películas', { level: 1 })).toBeInTheDocument()
  })

  it('renderiza /actores', async () => {
    renderApp('/actores')
    expect(await findPageHeading('Actores', { level: 1 })).toBeInTheDocument()
  })

  it('renderiza /directores', async () => {
    renderApp('/directores')
    expect(await findPageHeading('Directores', { level: 1 })).toBeInTheDocument()
  })

  it('renderiza /activity-log', async () => {
    renderApp('/activity-log')
    expect(await findPageHeading('Registro de actividad', { level: 1 })).toBeInTheDocument()
  })

  it('renderiza /users', async () => {
    renderApp('/users')
    expect(await findPageHeading('Usuarios con Roles')).toBeInTheDocument()
  })

  it('renderiza /push-notifications', async () => {
    renderApp('/push-notifications')
    expect(await findPageHeading('Enviar notificaciones push')).toBeInTheDocument()
  })

  it('renderiza /qr-confirm sin sesión con error', async () => {
    renderApp('/qr-confirm')
    expect(await screen.findByText('Enlace no válido: falta el identificador de sesión.')).toBeInTheDocument()
  })

  it('renderiza /qr-confirm con sesión válida', async () => {
    renderApp('/qr-confirm?s=test-session')
    expect(await screen.findByText('Vincular dispositivo')).toBeInTheDocument()
  })

  it('redirige rutas desconocidas a /home', async () => {
    renderApp('/ruta-inexistente')
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'BaseKit', level: 1 })).toBeInTheDocument()
    }, { timeout: 5000 })
  })
})
