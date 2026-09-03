import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import UsersPage from '@/pages/UsersPage'

const { apiFetchMock, apiJsonMock } = vi.hoisted(() => ({
  apiFetchMock: vi.fn(),
  apiJsonMock: vi.fn(),
}))

vi.mock('@/utils/apiFetch', () => ({
  apiFetch: apiFetchMock,
  apiJson: apiJsonMock,
}))

vi.mock('@/components/Users/UserModal', () => ({
  UserModal: ({ initial, onClose, onSave }) => (
    <div>
      <h2>{initial ? 'Editar usuario' : 'Nuevo usuario'}</h2>
      <button type="button" onClick={onClose}>Cerrar modal</button>
      <button type="button" onClick={() => onSave({ username: 'nueva' }, initial?.id)}>
        Guardar
      </button>
    </div>
  ),
}))

describe('UsersPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('carga la lista de usuarios y la renderiza', async () => {
    apiFetchMock.mockResolvedValue({
      json: async () => ({
        success: true,
        data: [
          {
            id: 1,
            email: 'ana@test.com',
            username: 'ana',
            firstName: 'Ana',
            lastName: 'García',
            roles: ['admin'],
            enabled: true,
            emailVerified: true,
            createdTimestamp: '2024-01-20T12:00:00Z',
          },
        ],
      }),
    })

    render(<UsersPage />)

    expect(screen.getByRole('heading', { name: 'Usuarios con Roles' })).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('ana@test.com')).toBeInTheDocument()
      expect(screen.getByText('admin')).toBeInTheDocument()
      expect(screen.getByText(/Total:/i)).toBeInTheDocument()
    })
  })

  it('muestra el estado de error cuando falla la carga', async () => {
    apiFetchMock.mockRejectedValue(new Error('No se pudo cargar'))

    render(<UsersPage />)

    await waitFor(() => {
      expect(screen.getByText('No se pudo cargar')).toBeInTheDocument()
    })
  })

  it('muestra el vaciado cuando no hay usuarios', async () => {
    apiFetchMock.mockResolvedValue({
      json: async () => ({ success: true, data: [] }),
    })

    render(<UsersPage />)

    await waitFor(() => {
      expect(screen.getByText('No hay usuarios')).toBeInTheDocument()
    })
  })

  it('abre el modal de confirmación y elimina un usuario', async () => {
    const user = userEvent.setup()

    const fetchSequence = [
      { json: async () => ({ success: true, data: [{ id: 1, email: 'ana@test.com', username: 'ana' }] }) },
      { json: async () => ({ success: true, data: [] }) },
    ]

    apiFetchMock.mockImplementation(async () => fetchSequence.shift())
    apiJsonMock.mockResolvedValue(undefined)

    render(<UsersPage />)

    await waitFor(() => {
      expect(screen.getByText('ana@test.com')).toBeInTheDocument()
    })

    await user.click(screen.getAllByTitle('Eliminar')[0])

    expect(screen.getByText(/¿Seguro que quieres eliminar/i)).toBeInTheDocument()
    expect(screen.getAllByText('ana@test.com').length).toBeGreaterThan(0)

    await user.click(screen.getAllByRole('button', { name: 'Eliminar' }).at(-1))

    await waitFor(() => {
      expect(apiJsonMock).toHaveBeenCalledWith('/api/users/1', { method: 'DELETE' })
    })
  })
})
