import { useState } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/utils/apiFetch', () => ({
  apiFetch: vi.fn(),
}))

import { apiFetch } from '@/utils/apiFetch'
import { ActorsCast } from '@/components/Movies/ActorsCast'

const actorsResponse = {
  data: {
    items: [
      { id: 10, first_name: 'Penélope', last_name: 'Cruz' },
      { id: 11, first_name: 'Antonio', last_name: 'Banderas', stage_name: 'El Toro' },
    ],
  },
}

function renderActorsCast(initial = []) {
  function Wrapper() {
    const [cast, setCast] = useState(initial)
    return <ActorsCast cast={cast} onChange={setCast} />
  }

  return render(<Wrapper />)
}

describe('ActorsCast', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    apiFetch.mockResolvedValue({
      json: async () => actorsResponse,
    })
  })

  it('muestra mensaje cuando no hay actores en el reparto', () => {
    render(<ActorsCast cast={[]} onChange={vi.fn()} />)
    expect(screen.getByText('Sin actores añadidos')).toBeInTheDocument()
  })

  it('carga actores desde la API', async () => {
    const user = userEvent.setup()
    renderActorsCast()

    expect(apiFetch).toHaveBeenCalledWith('/api/actors?per_page=999&sort=last_name&direction=ASC')

    await user.click(screen.getByRole('button', { name: 'Añadir' }))

    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'Cruz, Penélope' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'Banderas, Antonio (El Toro)' })).toBeInTheDocument()
    })
  })

  it('añade una fila al reparto', async () => {
    const user = userEvent.setup()

    renderActorsCast()
    await user.click(screen.getByRole('button', { name: 'Añadir' }))

    expect(screen.getByPlaceholderText('Personaje')).toBeInTheDocument()
  })

  it('elimina una fila del reparto', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const cast = [
      { actor_id: '10', character_name: 'María' },
      { actor_id: '11', character_name: 'Juan' },
    ]

    render(<ActorsCast cast={cast} onChange={onChange} />)
    const removeButtons = screen.getAllByRole('button').filter((btn) => !btn.textContent?.includes('Añadir'))
    await user.click(removeButtons[0])

    expect(onChange).toHaveBeenCalledWith([{ actor_id: '11', character_name: 'Juan' }])
  })

  it('actualiza actor y personaje', async () => {
    const user = userEvent.setup()

    renderActorsCast([{ actor_id: '', character_name: '' }])

    const actorSelect = screen.getByRole('combobox')
    await waitFor(() => {
      expect(actorSelect).not.toBeDisabled()
    })

    await user.selectOptions(actorSelect, '10')
    expect(actorSelect).toHaveValue('10')

    await user.type(screen.getByPlaceholderText('Personaje'), 'Elena')
    expect(screen.getByPlaceholderText('Personaje')).toHaveValue('Elena')
  })
})
