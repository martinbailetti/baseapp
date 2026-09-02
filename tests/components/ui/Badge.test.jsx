import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Badge from '@/components/ui/Badge'

describe('Badge', () => {
  it('renderiza el texto', () => {
    render(<Badge>admin</Badge>)
    expect(screen.getByText('admin')).toBeInTheDocument()
  })

  it('aplica clases del variant success', () => {
    render(<Badge variant="success">ok</Badge>)
    expect(screen.getByText('ok')).toHaveClass('bg-green-100', 'text-green-700')
  })

  it('aplica clases del variant danger', () => {
    render(<Badge variant="danger">error</Badge>)
    expect(screen.getByText('error')).toHaveClass('bg-red-100', 'text-red-700')
  })

  it('aplica clases del variant primary', () => {
    render(<Badge variant="primary">info</Badge>)
    expect(screen.getByText('info')).toHaveClass('bg-indigo-100')
  })

  it('aplica className extra', () => {
    render(<Badge className="custom">tag</Badge>)
    expect(screen.getByText('tag')).toHaveClass('custom')
  })
})
