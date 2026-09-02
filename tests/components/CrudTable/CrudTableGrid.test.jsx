import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { CrudTableGrid } from '@/components/CrudTable/CrudTableGrid'

const columns = [{ key: 'name', label: 'Nombre' }]
const noop = vi.fn()

const buildProps = (overrides = {}) => ({
  error: null,
  visibleCols: columns,
  colWidths: {},
  sortCriteria: [{ key: 'name', dir: 'asc' }],
  dragOver: null,
  onDragStart: noop,
  onDragOver: noop,
  onDrop: noop,
  onDragEnd: noop,
  onHandleSort: vi.fn(),
  onResizeStart: noop,
  showActions: true,
  loading: false,
  rows: [],
  renderCell: null,
  renderActions: null,
  onEdit: vi.fn(),
  onDelete: vi.fn(),
  ...overrides,
})

describe('CrudTableGrid', () => {
  it('muestra mensaje de error', () => {
    render(<CrudTableGrid {...buildProps({ error: 'Error de red' })} />)
    expect(screen.getByText('Error de red')).toBeInTheDocument()
  })

  it('muestra estado de carga', () => {
    render(<CrudTableGrid {...buildProps({ loading: true })} />)
    expect(screen.getByText('Cargando...')).toBeInTheDocument()
  })

  it('muestra estado vacío', () => {
    render(<CrudTableGrid {...buildProps()} />)
    expect(screen.getByText('Sin datos')).toBeInTheDocument()
  })

  it('renderiza filas y acciones', async () => {
    const user = userEvent.setup()
    const onEdit = vi.fn()
    const onDelete = vi.fn()
    render(
      <CrudTableGrid
        {...buildProps({
          rows: [{ id: 1, name: 'Ana' }],
          onEdit,
          onDelete,
        })}
      />
    )
    expect(screen.getByText('Ana')).toBeInTheDocument()
    await user.click(screen.getByTitle('Editar'))
    await user.click(screen.getByTitle('Eliminar'))
    expect(onEdit).toHaveBeenCalledWith({ id: 1, name: 'Ana' })
    expect(onDelete).toHaveBeenCalledWith({ id: 1, name: 'Ana' })
  })

  it('ordena al pulsar cabecera de columna', async () => {
    const user = userEvent.setup()
    const onHandleSort = vi.fn()
    render(<CrudTableGrid {...buildProps({ onHandleSort })} />)
    await user.click(screen.getByRole('button', { name: /Nombre/i }))
    expect(onHandleSort).toHaveBeenCalledWith('name')
  })

  it('usa renderCell personalizado', () => {
    render(
      <CrudTableGrid
        {...buildProps({
          rows: [{ id: 1, name: 'Ana' }],
          renderCell: (key, value) => `${key}:${value}`,
        })}
      />
    )
    expect(screen.getByText('name:Ana')).toBeInTheDocument()
  })
})
