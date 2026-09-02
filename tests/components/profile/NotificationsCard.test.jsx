import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import NotificationsCard from '@/components/profile/NotificationsCard'

const defaultProps = {
  supported: true,
  enabled: true,
  permission: 'granted',
  subscribed: false,
  loading: false,
  error: null,
  subscribe: vi.fn(),
  unsubscribe: vi.fn(),
}

describe('NotificationsCard', () => {
  it('muestra badges de estado', () => {
    render(<NotificationsCard {...defaultProps} />)
    expect(screen.getByText('Compatible')).toBeInTheDocument()
    expect(screen.getByText('Servidor habilitado')).toBeInTheDocument()
    expect(screen.getByText('Permiso concedido')).toBeInTheDocument()
  })

  it('muestra botón activar cuando no está suscrito', () => {
    render(<NotificationsCard {...defaultProps} />)
    expect(screen.getByRole('button', { name: 'Activar notificaciones' })).toBeEnabled()
  })

  it('deshabilita activar si no hay soporte', () => {
    render(<NotificationsCard {...defaultProps} supported={false} />)
    expect(screen.getByRole('button', { name: 'Activar notificaciones' })).toBeDisabled()
  })

  it('muestra botón desactivar cuando está suscrito', async () => {
    const user = userEvent.setup()
    const unsubscribe = vi.fn()
    render(
      <NotificationsCard {...defaultProps} subscribed unsubscribe={unsubscribe} />
    )
    await user.click(screen.getByRole('button', { name: 'Desactivar notificaciones' }))
    expect(unsubscribe).toHaveBeenCalledOnce()
  })

  it('muestra error y estado de carga', () => {
    render(
      <NotificationsCard
        {...defaultProps}
        error="Error de suscripción"
        loading
      />
    )
    expect(screen.getByText('Error de suscripción')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Procesando...' })).toBeDisabled()
  })

  it('llama subscribe al activar', async () => {
    const user = userEvent.setup()
    const subscribe = vi.fn()
    render(<NotificationsCard {...defaultProps} subscribe={subscribe} />)
    await user.click(screen.getByRole('button', { name: 'Activar notificaciones' }))
    expect(subscribe).toHaveBeenCalledOnce()
  })
})
