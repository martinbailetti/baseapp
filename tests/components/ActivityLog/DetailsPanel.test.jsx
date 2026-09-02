import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { DetailsPanel } from '@/components/ActivityLog/DetailsPanel'

describe('DetailsPanel', () => {
  it('muestra tabla de campos modificados en UPDATE', () => {
    render(
      <DetailsPanel
        parsed={{
          old_value: { name: 'Ana', role: 'admin' },
          new_value: { name: 'Ana', role: 'viewer' },
        }}
      />
    )
    expect(screen.getByText('Campos modificados')).toBeInTheDocument()
    expect(screen.getByText('role')).toBeInTheDocument()
    expect(screen.getByText('admin')).toBeInTheDocument()
    expect(screen.getByText('viewer')).toBeInTheDocument()
  })

  it('muestra mensaje de cascade update', () => {
    render(
      <DetailsPanel
        parsed={{
          cascade_from: 'movies',
          column: 'title',
          old_value: 'Old',
          new_value: 'New',
          rows_updated: 3,
        }}
      />
    )
    expect(screen.getByText(/Actualización en cascada desde.*movies.*title/)).toBeInTheDocument()
  })

  it('muestra registro creado', () => {
    render(
      <DetailsPanel
        parsed={{ created_record: { id: 1, name: 'Nuevo' } }}
      />
    )
    expect(screen.getByText('Registro creado')).toBeInTheDocument()
    expect(screen.getByText('Nuevo')).toBeInTheDocument()
  })

  it('muestra registro eliminado', () => {
    render(
      <DetailsPanel
        parsed={{ deleted_record: { id: 5, name: 'Borrado' } }}
      />
    )
    expect(screen.getByText('Registro eliminado')).toBeInTheDocument()
    expect(screen.getByText('Borrado')).toBeInTheDocument()
  })

  it('muestra cambio de contraseña', () => {
    render(<DetailsPanel parsed={{ username: 'martin' }} />)
    expect(screen.getByText(/Cambio de contraseña para el usuario.*martin/)).toBeInTheDocument()
  })

  it('usa fallback genérico para otros objetos', () => {
    render(<DetailsPanel parsed={{ foo: 'bar', count: 2 }} />)
    expect(screen.getByText('foo')).toBeInTheDocument()
    expect(screen.getByText('bar')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
  })
})
