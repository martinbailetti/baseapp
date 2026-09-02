import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/utils/apiFetch', () => ({
  apiFetch: vi.fn(),
}))

import { apiFetch } from '@/utils/apiFetch'
import { DirectorSelect } from '@/components/Movies/DirectorSelect'

const directorsResponse = {
  data: {
    items: [
      { id: 1, first_name: 'Luis', last_name: 'Buñuel' },
      { id: 2, first_name: 'Pedro', last_name: 'Almodóvar' },
    ],
  },
}

describe('DirectorSelect', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    apiFetch.mockResolvedValue({
      json: async () => directorsResponse,
    })
  })

  it('carga y muestra directores', async () => {
    render(<DirectorSelect value="" onChange={vi.fn()} />)

    expect(apiFetch).toHaveBeenCalledWith('/api/directors?per_page=999&sort=last_name&direction=ASC')

    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'Buñuel, Luis' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'Almodóvar, Pedro' })).toBeInTheDocument()
    })
  })

  it('muestra la opción placeholder', async () => {
    render(<DirectorSelect value="" onChange={vi.fn()} />)

    expect(screen.getByRole('option', { name: '— Selecciona un director —' })).toBeInTheDocument()
  })

  it('notifica el cambio de director', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    render(<DirectorSelect id="director-test" value="" onChange={onChange} />)

    await waitFor(() => {
      expect(screen.getByRole('combobox')).not.toBeDisabled()
    })

    await user.selectOptions(screen.getByRole('combobox'), '2')

    expect(onChange).toHaveBeenCalledWith('2')
  })

  it('acepta un id personalizado', () => {
    render(<DirectorSelect id="custom-director" value="1" onChange={vi.fn()} />)
    expect(screen.getByRole('combobox')).toHaveAttribute('id', 'custom-director')
  })

  it('sigue funcionando si la API falla', async () => {
    apiFetch.mockRejectedValue(new Error('network'))

    render(<DirectorSelect value="" onChange={vi.fn()} />)

    await waitFor(() => {
      expect(screen.getByRole('combobox')).not.toBeDisabled()
    })

    expect(screen.getByRole('option', { name: '— Selecciona un director —' })).toBeInTheDocument()
  })
})
