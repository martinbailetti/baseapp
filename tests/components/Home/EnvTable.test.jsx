import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { EnvTable } from '@/components/Home/EnvTable'

describe('EnvTable', () => {
  it('renderiza cabeceras y filas', () => {
    render(
      <EnvTable
        rows={[
          { name: 'VITE_A', description: 'Desc A', example: 'a', required: true },
          { name: 'VITE_B', description: 'Desc B', example: 'b', required: false },
        ]}
      />
    )
    expect(screen.getByText('Variable')).toBeInTheDocument()
    expect(screen.getByText('VITE_A')).toBeInTheDocument()
    expect(screen.getByText('VITE_B')).toBeInTheDocument()
    expect(screen.getByText('Desc A')).toBeInTheDocument()
    expect(screen.getByText('opcional')).toBeInTheDocument()
  })
})
