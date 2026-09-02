import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { SortIcon } from '@/components/CrudTable/SortIcon'

describe('SortIcon', () => {
  it('muestra icono neutro si la columna no está ordenada', () => {
    const { container } = render(<SortIcon colKey="name" sortCriteria={[{ key: 'id', dir: 'asc' }]} />)
    expect(container.querySelector('svg')).toHaveClass('opacity-30')
  })

  it('muestra chevron arriba en orden ascendente', () => {
    const { container } = render(<SortIcon colKey="name" sortCriteria={[{ key: 'name', dir: 'asc' }]} />)
    expect(container.querySelector('svg')).toHaveClass('text-indigo-500')
  })

  it('muestra chevron abajo en orden descendente', () => {
    const { container } = render(<SortIcon colKey="name" sortCriteria={[{ key: 'name', dir: 'desc' }]} />)
    expect(container.querySelector('svg')).toHaveClass('text-indigo-500')
  })
})
