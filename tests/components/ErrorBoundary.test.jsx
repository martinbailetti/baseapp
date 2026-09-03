import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ErrorBoundary from '@/components/ErrorBoundary'

function ThrowError({ shouldThrow = false }) {
  if (shouldThrow) {
    throw new Error('Boom de prueba')
  }

  return <div>Contenido restaurado</div>
}

describe('ErrorBoundary', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('muestra el fallback cuando un hijo lanza un error', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow />
      </ErrorBoundary>
    )

    expect(screen.getByRole('heading', { name: 'Algo salió mal' })).toBeInTheDocument()
    expect(screen.getByText('Ha ocurrido un error inesperado. Puedes reintentar o volver al inicio.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Volver al inicio' })).toBeInTheDocument()
  })

  it('permite reintentar y restaurar el contenido', async () => {
    const user = userEvent.setup()
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow />
      </ErrorBoundary>
    )

    await user.click(screen.getByRole('button', { name: 'Reintentar' }))

    rerender(
      <ErrorBoundary key="reset-boundary">
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    )

    await waitFor(() => {
      expect(screen.getByText('Contenido restaurado')).toBeInTheDocument()
    })
  })
})
