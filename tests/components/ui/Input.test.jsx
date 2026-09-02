import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import Input from '@/components/ui/Input'

describe('Input', () => {
  it('renderiza el input con placeholder', () => {
    render(<Input placeholder="Escribe aquí" />)
    expect(screen.getByPlaceholderText('Escribe aquí')).toBeInTheDocument()
  })

  it('muestra label asociado al input', () => {
    render(<Input id="email" label="Email" />)
    expect(screen.getByLabelText('Email')).toHaveAttribute('id', 'email')
  })

  it('usa id como name por defecto', () => {
    render(<Input id="username" />)
    expect(screen.getByRole('textbox')).toHaveAttribute('name', 'username')
  })

  it('muestra mensaje de error y clases de error', () => {
    render(<Input id="field" error="Campo obligatorio" />)
    expect(screen.getByText('Campo obligatorio')).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toHaveClass('border-red-400')
  })

  it('llama onChange al escribir', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Input onChange={onChange} />)
    await user.type(screen.getByRole('textbox'), 'a')
    expect(onChange).toHaveBeenCalled()
  })

  it('aplica className extra', () => {
    render(<Input className="w-full" />)
    expect(screen.getByRole('textbox')).toHaveClass('w-full')
  })
})
