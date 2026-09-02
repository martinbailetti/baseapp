import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { ActorModal } from '@/components/Actors/ActorModal'

describe('ActorModal', () => {
  it('muestra título de nuevo actor', () => {
    render(<ActorModal onSave={vi.fn()} onClose={vi.fn()} />)
    expect(screen.getByRole('heading', { name: 'Nuevo actor' })).toBeInTheDocument()
  })

  it('muestra título de edición con datos iniciales', () => {
    render(
      <ActorModal
        initial={{ id: 1, first_name: 'Ana', last_name: 'López' }}
        onSave={vi.fn()}
        onClose={vi.fn()}
      />
    )
    expect(screen.getByRole('heading', { name: 'Editar actor' })).toBeInTheDocument()
    expect(screen.getByLabelText('Nombre *')).toHaveValue('Ana')
  })

  it('llama onClose al cancelar', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<ActorModal onSave={vi.fn()} onClose={onClose} />)
    await user.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('envía el formulario con onSave', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn().mockResolvedValue(undefined)
    render(<ActorModal onSave={onSave} onClose={vi.fn()} />)

    await user.type(screen.getByLabelText('Nombre *'), 'Pedro')
    await user.type(screen.getByLabelText('Apellido *'), 'Sánchez')
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({ first_name: 'Pedro', last_name: 'Sánchez' }),
        undefined
      )
    })
  })

  it('muestra error si onSave falla', async () => {
    const user = userEvent.setup()
    render(
      <ActorModal
        onSave={vi.fn().mockRejectedValue(new Error('Error al guardar'))}
        onClose={vi.fn()}
      />
    )

    await user.type(screen.getByLabelText('Nombre *'), 'Pedro')
    await user.type(screen.getByLabelText('Apellido *'), 'Sánchez')
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    expect(await screen.findByText('Error al guardar')).toBeInTheDocument()
  })
})
