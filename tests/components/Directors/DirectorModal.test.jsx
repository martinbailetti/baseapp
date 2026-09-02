import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { DirectorModal } from '@/components/Directors/DirectorModal'

describe('DirectorModal', () => {
  it('muestra título de nuevo director', () => {
    render(<DirectorModal onSave={vi.fn()} onClose={vi.fn()} />)
    expect(screen.getByRole('heading', { name: 'Nuevo director' })).toBeInTheDocument()
  })

  it('precarga datos en modo edición', () => {
    render(
      <DirectorModal
        initial={{ id: 3, first_name: 'Luis', last_name: 'Buñuel' }}
        onSave={vi.fn()}
        onClose={vi.fn()}
      />
    )
    expect(screen.getByRole('heading', { name: 'Editar director' })).toBeInTheDocument()
    expect(screen.getByLabelText('Nombre *')).toHaveValue('Luis')
  })

  it('llama onClose desde el botón X', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<DirectorModal onSave={vi.fn()} onClose={onClose} />)
    const buttons = screen.getAllByRole('button')
    await user.click(buttons[0])
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('guarda el director', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn().mockResolvedValue(undefined)
    render(<DirectorModal onSave={onSave} onClose={vi.fn()} />)

    await user.type(screen.getByLabelText('Nombre *'), 'Pedro')
    await user.type(screen.getByLabelText('Apellido *'), 'Almodóvar')
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({ first_name: 'Pedro', last_name: 'Almodóvar' }),
        undefined
      )
    })
  })
})
