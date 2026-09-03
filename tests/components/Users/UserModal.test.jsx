import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { UserModal } from '@/components/Users/UserModal'

vi.mock('@/utils/apiFetch', () => ({
  apiFetch: vi.fn(),
}))

import { apiFetch } from '@/utils/apiFetch'

describe('UserModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    apiFetch.mockResolvedValue({
      json: async () => ({
        success: true,
        data: [{ name: 'super' }, { name: 'admin' }],
      }),
    })
  })

  it('muestra el título de creación y carga los roles disponibles', async () => {
    render(<UserModal onSave={vi.fn()} onClose={vi.fn()} />)

    expect(screen.getByRole('heading', { name: 'Nuevo usuario' })).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByRole('checkbox', { name: 'super' })).toBeInTheDocument()
      expect(screen.getByRole('checkbox', { name: 'admin' })).toBeInTheDocument()
    })
  })

  it('muestra el título de edición con los datos iniciales', async () => {
    render(
      <UserModal
        initial={{
          id: 7,
          username: 'ana',
          email: 'ana@test.com',
          firstName: 'Ana',
          lastName: 'García',
          enabled: true,
          emailVerified: true,
          roles: ['super'],
        }}
        onSave={vi.fn()}
        onClose={vi.fn()}
      />
    )

    expect(screen.getByRole('heading', { name: 'Editar usuario' })).toBeInTheDocument()
    await waitFor(() => expect(screen.getByRole('checkbox', { name: 'super' })).toBeChecked())
    expect(screen.getByDisplayValue('ana')).toBeInTheDocument()
    expect(screen.getByDisplayValue('ana@test.com')).toBeInTheDocument()
  })

  it('llama a onClose al cancelar', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()

    render(<UserModal onSave={vi.fn()} onClose={onClose} />)

    await user.click(screen.getByRole('button', { name: 'Cancelar' }))

    expect(onClose).toHaveBeenCalledOnce()
  })

  it('envía el formulario con los datos introducidos', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn().mockResolvedValue(undefined)
    const { container } = render(<UserModal onSave={onSave} onClose={vi.fn()} />)

    const inputs = container.querySelectorAll('input')
    await user.type(inputs[0], 'anita')
    await user.type(inputs[1], 'anita@test.com')
    await user.type(inputs[2], 'Anita')
    await user.type(inputs[3], 'López')
    await user.type(inputs[4], 'secret123')
    await user.click(screen.getByRole('checkbox', { name: 'super' }))
    await user.click(screen.getByRole('button', { name: 'Crear' }))

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          username: 'anita',
          email: 'anita@test.com',
          firstName: 'Anita',
          lastName: 'López',
          password: 'secret123',
          roles: ['super'],
        }),
        undefined
      )
    })
  })
})
