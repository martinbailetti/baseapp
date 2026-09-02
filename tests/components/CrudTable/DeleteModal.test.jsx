import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { DeleteModal } from '@/components/CrudTable/DeleteModal'

describe('DeleteModal', () => {
  it('muestra textos de confirmación', () => {
    render(<DeleteModal onConfirm={vi.fn()} onCancel={vi.fn()} />)
    expect(screen.getByText('Confirmar eliminación')).toBeInTheDocument()
    expect(screen.getByText('¿Seguro que quieres eliminar este registro?')).toBeInTheDocument()
    expect(screen.getByText('Esta acción no se puede deshacer.')).toBeInTheDocument()
  })

  it('llama onCancel al pulsar Cancelar', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()
    render(<DeleteModal onConfirm={vi.fn()} onCancel={onCancel} />)
    await user.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(onCancel).toHaveBeenCalledOnce()
  })

  it('llama onConfirm al pulsar Eliminar', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    render(<DeleteModal onConfirm={onConfirm} onCancel={vi.fn()} />)
    await user.click(screen.getByRole('button', { name: 'Eliminar' }))
    expect(onConfirm).toHaveBeenCalledOnce()
  })
})
