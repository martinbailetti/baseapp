import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ToastContainer } from '@/components/CrudTable/ToastContainer'

describe('ToastContainer', () => {
  it('renderiza toasts de éxito y error', () => {
    render(
      <ToastContainer
        toasts={[
          { id: 1, type: 'success', message: 'Guardado' },
          { id: 2, type: 'error', message: 'Falló' },
        ]}
      />
    )
    expect(screen.getByText('Guardado')).toHaveClass('bg-green-600')
    expect(screen.getByText('Falló')).toHaveClass('bg-red-600')
  })

  it('no renderiza nada sin toasts', () => {
    const { container } = render(<ToastContainer toasts={[]} />)
    expect(container.firstChild?.childNodes.length ?? 0).toBe(0)
  })
})
