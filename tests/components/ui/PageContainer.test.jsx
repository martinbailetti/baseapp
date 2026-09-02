import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import PageContainer from '@/components/ui/PageContainer'

describe('PageContainer', () => {
  it('renderiza children', () => {
    render(<PageContainer>Contenido de página</PageContainer>)
    expect(screen.getByText('Contenido de página')).toBeInTheDocument()
  })

  it('aplica maxWidth por defecto', () => {
    const { container } = render(<PageContainer>x</PageContainer>)
    expect(container.firstChild).toHaveClass('max-w-7xl')
  })

  it('permite personalizar maxWidth y className', () => {
    const { container } = render(
      <PageContainer maxWidth="max-w-4xl" className="extra">
        x
      </PageContainer>
    )
    expect(container.firstChild).toHaveClass('max-w-4xl', 'extra')
  })
})
