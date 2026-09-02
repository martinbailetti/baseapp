import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { EnvRow } from '@/components/Home/EnvRow'

const renderRow = (props = {}) =>
  render(
    <table>
      <tbody>
        <EnvRow
          name="VITE_API_URL"
          description="URL del API"
          example="http://localhost:8888"
          {...props}
        />
      </tbody>
    </table>
  )

describe('EnvRow', () => {
  it('muestra nombre, descripción y ejemplo', () => {
    renderRow()
    expect(screen.getByText('VITE_API_URL')).toBeInTheDocument()
    expect(screen.getByText('URL del API')).toBeInTheDocument()
    expect(screen.getByText('http://localhost:8888')).toBeInTheDocument()
  })

  it('muestra badge requerido por defecto', () => {
    renderRow()
    expect(screen.getByText('requerido')).toBeInTheDocument()
  })

  it('muestra badge opcional cuando required es false', () => {
    renderRow({ required: false })
    expect(screen.getByText('opcional')).toBeInTheDocument()
  })
})
