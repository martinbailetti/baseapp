import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Film } from 'lucide-react'
import PageHeader from '@/components/ui/PageHeader'

describe('PageHeader', () => {
  it('renderiza título y subtítulo', () => {
    render(<PageHeader title="Películas" subtitle="Gestión de catálogo" />)
    expect(screen.getByRole('heading', { name: 'Películas' })).toBeInTheDocument()
    expect(screen.getByText('Gestión de catálogo')).toBeInTheDocument()
  })

  it('renderiza icono cuando se proporciona', () => {
    const { container } = render(<PageHeader title="Cine" Icon={Film} />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('renderiza acciones en la zona derecha', () => {
    render(
      <PageHeader
        title="Usuarios"
        actions={<button type="button">Nuevo</button>}
      />
    )
    expect(screen.getByRole('button', { name: 'Nuevo' })).toBeInTheDocument()
  })

  it('aplica className extra', () => {
    const { container } = render(
      <PageHeader title="Test" className="custom-header" />
    )
    expect(container.firstChild).toHaveClass('custom-header')
  })
})
