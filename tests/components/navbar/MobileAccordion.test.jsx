import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { Film } from 'lucide-react'
import { describe, it, expect, vi } from 'vitest'
import MobileAccordion from '@/components/navbar/MobileAccordion'
import { routerFuture } from '../../utils/routerFuture'

const subitems = [
  { to: '/movies', labelKey: 'nav.movies', Icon: Film, requiredRole: 'admin' },
  { to: '/actors', labelKey: 'nav.actors', Icon: Film },
]

const renderAccordion = (props = {}) =>
  render(
    <MemoryRouter future={routerFuture}>
      <MobileAccordion
        label="Cine"
        Icon={Film}
        subitems={subitems}
        pathname="/"
        hasRole={(role) => role === 'admin'}
        onNavigate={vi.fn()}
        {...props}
      />
    </MemoryRouter>
  )

describe('MobileAccordion', () => {
  it('renderiza el botón del acordeón', () => {
    renderAccordion()
    expect(screen.getByRole('button', { name: /Cine/i })).toBeInTheDocument()
  })

  it('no renderiza nada si no hay sub-ítems visibles', () => {
    const { container } = renderAccordion({ hasRole: () => false, subitems: [{ to: '/x', requiredRole: 'admin' }] })
    expect(container).toBeEmptyDOMElement()
  })

  it('muestra sub-ítems al expandir', async () => {
    const user = userEvent.setup()
    renderAccordion()
    await user.click(screen.getByRole('button', { name: /Cine/i }))
    expect(screen.getByRole('link', { name: /Películas/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Actores/i })).toBeInTheDocument()
  })

  it('llama onNavigate al pulsar un sub-ítem', async () => {
    const user = userEvent.setup()
    const onNavigate = vi.fn()
    renderAccordion({ onNavigate })
    await user.click(screen.getByRole('button', { name: /Cine/i }))
    await user.click(screen.getByRole('link', { name: /Películas/i }))
    expect(onNavigate).toHaveBeenCalledOnce()
  })

  it('marca como activo cuando pathname coincide con un sub-ítem', () => {
    renderAccordion({ pathname: '/movies' })
    expect(screen.getByRole('button', { name: /Cine/i })).toHaveClass('text-indigo-700')
  })

  it('colapsa al volver a pulsar el botón', async () => {
    const user = userEvent.setup()
    renderAccordion()
    const button = screen.getByRole('button', { name: /Cine/i })

    await user.click(button)
    expect(screen.getByRole('link', { name: /Películas/i })).toBeInTheDocument()

    await user.click(button)
    expect(screen.queryByRole('link', { name: /Películas/i })).not.toBeInTheDocument()
  })
})
