import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { LogRow } from '@/components/ActivityLog/LogRow'

const baseRow = {
  Id: 42,
  user_email: 'user@test.com',
  action: 'UPDATE',
  entity: 'users',
  entity_id: '7',
  ip_address: '127.0.0.1',
  created_at: '2026-06-16T10:30:00.000Z',
}

const renderLogRow = (row = baseRow) =>
  render(
    <table>
      <tbody>
        <LogRow row={row} />
      </tbody>
    </table>
  )

describe('LogRow', () => {
  it('muestra datos básicos de la fila', () => {
    renderLogRow()
    expect(screen.getByText('42')).toBeInTheDocument()
    expect(screen.getByText('user@test.com')).toBeInTheDocument()
    expect(screen.getByText('UPDATE')).toBeInTheDocument()
    expect(screen.getByText('users')).toBeInTheDocument()
    expect(screen.getByText('7')).toBeInTheDocument()
    expect(screen.getByText('127.0.0.1')).toBeInTheDocument()
    expect(screen.getByText('2026-06-16 10:30:00')).toBeInTheDocument()
  })

  it('muestra guiones para valores vacíos', () => {
    renderLogRow({
      ...baseRow,
      user_email: '',
      entity: '',
      entity_id: '',
      ip_address: '',
      created_at: '',
    })
    expect(screen.getAllByText('—').length).toBeGreaterThan(0)
  })

  it('no muestra botón de detalles sin JSON válido', () => {
    renderLogRow({ ...baseRow, details: null })
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('expande y colapsa detalles', async () => {
    const user = userEvent.setup()
    renderLogRow({
      ...baseRow,
      details: JSON.stringify({ foo: 'bar' }),
    })

    const toggle = screen.getByRole('button', { name: /Ver/i })
    await user.click(toggle)
    expect(screen.getByText('foo')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Ocultar/i })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Ocultar/i }))
    expect(screen.queryByText('foo')).not.toBeInTheDocument()
  })

  it('parsea details como objeto', async () => {
    const user = userEvent.setup()
    renderLogRow({
      ...baseRow,
      details: { username: 'ana' },
    })
    await user.click(screen.getByRole('button', { name: /Ver/i }))
    expect(screen.getByText(/Cambio de contraseña para el usuario/)).toBeInTheDocument()
  })
})
