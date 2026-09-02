import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Settings } from 'lucide-react'
import { Section } from '@/components/Home/Section'

describe('Section', () => {
  it('renderiza título e icono', () => {
    render(
      <Section icon={Settings} title="Configuración">
        <p>Contenido</p>
      </Section>
    )
    expect(screen.getByRole('heading', { name: 'Configuración' })).toBeInTheDocument()
    expect(screen.getByText('Contenido')).toBeInTheDocument()
  })
})
