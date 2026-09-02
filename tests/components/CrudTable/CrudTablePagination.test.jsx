import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { CrudTablePagination } from '@/components/CrudTable/CrudTablePagination'

const defaultProps = {
  total: 25,
  page: 2,
  totalPages: 5,
  onFirstPage: vi.fn(),
  onPrevPage: vi.fn(),
  onNextPage: vi.fn(),
  onLastPage: vi.fn(),
  perPage: 10,
  onPerPageChange: vi.fn(),
  perPageOptions: [10, 25, 50],
}

describe('CrudTablePagination', () => {
  it('muestra total de registros y página actual', () => {
    render(<CrudTablePagination {...defaultProps} />)
    expect(screen.getByText('25 registros')).toBeInTheDocument()
    expect(screen.getByText('2 / 5')).toBeInTheDocument()
  })

  it('usa singular con un solo registro', () => {
    render(<CrudTablePagination {...defaultProps} total={1} page={1} totalPages={1} />)
    expect(screen.getByText('1 registro')).toBeInTheDocument()
  })

  it('navega entre páginas', async () => {
    const user = userEvent.setup()
    const onNextPage = vi.fn()
    const onPrevPage = vi.fn()
    render(
      <CrudTablePagination
        {...defaultProps}
        onNextPage={onNextPage}
        onPrevPage={onPrevPage}
      />
    )
    await user.click(screen.getByRole('button', { name: '›' }))
    expect(onNextPage).toHaveBeenCalledOnce()
    await user.click(screen.getByRole('button', { name: '‹' }))
    expect(onPrevPage).toHaveBeenCalledOnce()
  })

  it('deshabilita navegación en límites', () => {
    render(<CrudTablePagination {...defaultProps} page={1} />)
    expect(screen.getByRole('button', { name: '‹' })).toBeDisabled()
    expect(screen.getByRole('button', { name: '«' })).toBeDisabled()
  })

  it('cambia filas por página', async () => {
    const user = userEvent.setup()
    const onPerPageChange = vi.fn()
    render(
      <CrudTablePagination {...defaultProps} onPerPageChange={onPerPageChange} />
    )
    await user.click(screen.getByRole('button', { name: '25' }))
    expect(onPerPageChange).toHaveBeenCalledWith(25)
  })
})
