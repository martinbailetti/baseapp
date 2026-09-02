import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Card, CardHeader, CardBody, CardFooter } from '@/components/ui/Card'

describe('Card', () => {
  it('renderiza children', () => {
    render(<Card>contenido</Card>)
    expect(screen.getByText('contenido')).toBeInTheDocument()
  })

  it('renderiza CardHeader, CardBody y CardFooter', () => {
    render(
      <Card>
        <CardHeader>Encabezado</CardHeader>
        <CardBody>Cuerpo</CardBody>
        <CardFooter>Pie</CardFooter>
      </Card>
    )
    expect(screen.getByText('Encabezado')).toBeInTheDocument()
    expect(screen.getByText('Cuerpo')).toBeInTheDocument()
    expect(screen.getByText('Pie')).toBeInTheDocument()
  })

  it('aplica className extra', () => {
    const { container } = render(<Card className="test-class">x</Card>)
    expect(container.firstChild).toHaveClass('test-class')
  })
})
