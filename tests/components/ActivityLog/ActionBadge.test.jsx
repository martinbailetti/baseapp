import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ActionBadge } from '@/components/ActivityLog/ActionBadge'

describe('ActionBadge', () => {
  it('renderiza la acción con color conocido', () => {
    render(<ActionBadge action="CREATE" />)
    const badge = screen.getByText('CREATE')
    expect(badge).toHaveClass('bg-green-100', 'text-green-700')
  })

  it('usa estilo por defecto para acciones desconocidas', () => {
    render(<ActionBadge action="CUSTOM" />)
    expect(screen.getByText('CUSTOM')).toHaveClass('bg-gray-100', 'text-gray-600')
  })
})
