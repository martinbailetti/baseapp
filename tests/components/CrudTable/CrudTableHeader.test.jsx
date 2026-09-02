import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { CrudTableHeader } from '@/components/CrudTable/CrudTableHeader'

const buildProps = (overrides = {}) => ({
  title: 'Actores',
  searchInput: '',
  onChangeSearchInput: vi.fn(),
  onSearchKeyDown: vi.fn(),
  onApplySearch: vi.fn(),
  onClearSearch: vi.fn(),
  colMenuRef: { current: null },
  showColMenu: false,
  onToggleColMenu: vi.fn(),
  orderedCols: [
    { key: 'name', label: 'Nombre' },
    { key: 'email', label: 'Email' },
  ],
  visibility: { name: true, email: false },
  onToggleCol: vi.fn(),
  sortCriteria: [],
  onToggleSortColumn: vi.fn(),
  onToggleSortDirection: vi.fn(),
  onRemoveSortCriterion: vi.fn(),
  onResetSortCriteria: vi.fn(),
  onExport: vi.fn(),
  onRefresh: vi.fn(),
  onNew: vi.fn(),
  readOnly: false,
  ...overrides,
})

describe('CrudTableHeader', () => {
  it('renderiza título y campo de búsqueda', () => {
    render(<CrudTableHeader {...buildProps()} />)
    expect(screen.getByRole('heading', { name: 'Actores' })).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Buscar...')).toBeInTheDocument()
  })

  it('aplica búsqueda y limpia el input', async () => {
    const user = userEvent.setup()
    const onApplySearch = vi.fn()
    const onClearSearch = vi.fn()
    render(
      <CrudTableHeader
        {...buildProps({
          searchInput: 'ana',
          onApplySearch,
          onClearSearch,
        })}
      />
    )
    await user.click(screen.getByRole('button', { name: 'Buscar' }))
    expect(onApplySearch).toHaveBeenCalledOnce()

    const searchField = screen.getByPlaceholderText('Buscar...')
    await user.click(within(searchField.parentElement).getByRole('button'))
    expect(onClearSearch).toHaveBeenCalledOnce()
  })

  it('muestra badge con columnas ocultas', () => {
    render(<CrudTableHeader {...buildProps()} />)
    expect(screen.getByTitle('Columnas visibles').querySelector('span')).toHaveTextContent('1')
  })

  it('no muestra badge si todas las columnas están visibles', () => {
    render(
      <CrudTableHeader
        {...buildProps({ visibility: { name: true, email: true } })}
      />
    )
    expect(screen.getByTitle('Columnas visibles').querySelector('span')).toBeNull()
  })

  it('muestra menú de columnas visibles', async () => {
    const user = userEvent.setup()
    const onToggleCol = vi.fn()
    render(
      <CrudTableHeader
        {...buildProps({ showColMenu: true, onToggleCol })}
      />
    )
    expect(screen.getByLabelText('Nombre')).toBeChecked()
    expect(screen.getByLabelText('Email')).not.toBeChecked()
    await user.click(screen.getByLabelText('Email'))
    expect(onToggleCol).toHaveBeenCalledWith('email')
  })

  it('dispara acciones de exportar, refrescar y nuevo', async () => {
    const user = userEvent.setup()
    const onExport = vi.fn()
    const onRefresh = vi.fn()
    const onNew = vi.fn()
    render(
      <CrudTableHeader
        {...buildProps({ onExport, onRefresh, onNew })}
      />
    )
    await user.click(screen.getByTitle('Exportar XLSX'))
    await user.click(screen.getByTitle('Actualizar'))
    await user.click(screen.getByRole('button', { name: /Nuevo/i }))
    expect(onExport).toHaveBeenCalledOnce()
    expect(onRefresh).toHaveBeenCalledOnce()
    expect(onNew).toHaveBeenCalledOnce()
  })

  it('oculta botón Nuevo en modo readOnly', () => {
    render(<CrudTableHeader {...buildProps({ readOnly: true })} />)
    expect(screen.queryByRole('button', { name: /Nuevo/i })).not.toBeInTheDocument()
  })
})
