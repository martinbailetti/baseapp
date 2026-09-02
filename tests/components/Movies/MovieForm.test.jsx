import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/utils/apiFetch', () => ({
  apiFetch: vi.fn(),
}))

import { apiFetch } from '@/utils/apiFetch'
import { MovieForm } from '@/components/Movies/MovieForm'

function mockApiFetch() {
  apiFetch.mockImplementation(async (url) => {
    if (url.includes('/api/directors')) {
      return {
        json: async () => ({
          data: { items: [{ id: 1, first_name: 'Pedro', last_name: 'Almodóvar' }] },
        }),
      }
    }

    if (url.includes('/api/actors')) {
      return {
        json: async () => ({
          data: { items: [{ id: 10, first_name: 'Penélope', last_name: 'Cruz' }] },
        }),
      }
    }

    return { json: async () => ({ data: { items: [] } }) }
  })
}

describe('MovieForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockApiFetch()
  })

  it('muestra título de nueva película', () => {
    render(<MovieForm onSave={vi.fn()} onCancel={vi.fn()} />)
    expect(screen.getByRole('heading', { name: 'Nueva película' })).toBeInTheDocument()
  })

  it('muestra título de edición con datos iniciales', () => {
    render(
      <MovieForm
        initial={{
          id: 5,
          spanish_title: 'Volver',
          original_title: 'Volver',
          release_year: 2006,
          director_id: 1,
          actors: [{ id: 10, character_name: 'Raimunda' }],
        }}
        onSave={vi.fn()}
        onCancel={vi.fn()}
      />
    )

    expect(screen.getByRole('heading', { name: 'Editar película' })).toBeInTheDocument()
    expect(screen.getByLabelText('Título en español *')).toHaveValue('Volver')
    expect(screen.getByLabelText('Título original *')).toHaveValue('Volver')
    expect(screen.getByLabelText('Año estreno *')).toHaveValue(2006)
  })

  it('llama onCancel al cancelar', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()

    render(<MovieForm onSave={vi.fn()} onCancel={onCancel} />)
    await user.click(screen.getByRole('button', { name: 'Cancelar' }))

    expect(onCancel).toHaveBeenCalledOnce()
  })

  it('llama onCancel desde el enlace de volver', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()

    render(<MovieForm onSave={vi.fn()} onCancel={onCancel} />)
    await user.click(screen.getByRole('button', { name: 'Volver a películas' }))

    expect(onCancel).toHaveBeenCalledOnce()
  })

  it('envía el formulario con reparto', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn().mockResolvedValue(undefined)

    render(<MovieForm onSave={onSave} onCancel={vi.fn()} />)

    await user.type(screen.getByLabelText('Título en español *'), 'Volver')
    await user.type(screen.getByLabelText('Título original *'), 'Volver')
    await user.clear(screen.getByLabelText('Año estreno *'))
    await user.type(screen.getByLabelText('Año estreno *'), '2006')

    await waitFor(() => {
      expect(screen.getByLabelText('Director *')).not.toBeDisabled()
    })
    await user.selectOptions(screen.getByLabelText('Director *'), '1')

    await user.click(screen.getByRole('button', { name: 'Añadir' }))
    const actorSelect = document.getElementById('cast-actor-0')
    await waitFor(() => {
      expect(actorSelect).not.toBeDisabled()
    })
    await user.selectOptions(actorSelect, '10')
    await user.type(screen.getByPlaceholderText('Personaje'), 'Raimunda')

    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          spanish_title: 'Volver',
          original_title: 'Volver',
          release_year: 2006,
          director_id: 1,
          actors: [{ actor_id: 10, character_name: 'Raimunda' }],
        }),
        undefined
      )
    })
  })

  it('muestra error si onSave falla', async () => {
    const user = userEvent.setup()

    render(
      <MovieForm
        onSave={vi.fn().mockRejectedValue(new Error('Error al guardar'))}
        onCancel={vi.fn()}
      />
    )

    await user.type(screen.getByLabelText('Título en español *'), 'Test')
    await user.type(screen.getByLabelText('Título original *'), 'Test')

    await waitFor(() => {
      expect(screen.getByLabelText('Director *')).not.toBeDisabled()
    })
    await user.selectOptions(screen.getByLabelText('Director *'), '1')
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    expect(await screen.findByText('Error al guardar')).toBeInTheDocument()
  })
})
