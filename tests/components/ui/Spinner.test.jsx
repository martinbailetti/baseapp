import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Spinner from '@/components/ui/Spinner'

describe('Spinner', () => {
  it('renderiza con etiqueta accesible', () => {
    render(<Spinner />)
    expect(screen.getByRole('status', { name: 'Cargando' })).toBeInTheDocument()
  })

  it('aplica clases del tamaño lg', () => {
    render(<Spinner size="lg" />)
    expect(screen.getByRole('status')).toHaveClass('h-12', 'w-12')
  })

  it('aplica clases del tamaño sm', () => {
    render(<Spinner size="sm" />)
    expect(screen.getByRole('status')).toHaveClass('h-4', 'w-4')
  })

  it('aplica clases del tamaño md por defecto', () => {
    render(<Spinner />)
    expect(screen.getByRole('status')).toHaveClass('h-8', 'w-8')
  })
})
