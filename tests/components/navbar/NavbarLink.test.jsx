import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import { routerFuture } from '../../utils/routerFuture'
import NavbarLink from '@/components/navbar/NavbarLink'

const MockIcon = () => <span data-testid="nav-icon" />

const renderLink = (props = {}) =>
  render(
    <MemoryRouter future={routerFuture}>
      <NavbarLink
        to="/destino"
        activeClassName="link-active"
        inactiveClassName="link-inactive"
        {...props}
      >
        Texto enlace
      </NavbarLink>
    </MemoryRouter>
  )

describe('NavbarLink', () => {
  it('renderiza el enlace con destino y texto', () => {
    renderLink()
    const link = screen.getByRole('link', { name: 'Texto enlace' })
    expect(link).toHaveAttribute('href', '/destino')
  })

  it('renderiza el icono cuando se proporciona', () => {
    renderLink({ Icon: MockIcon })
    expect(screen.getByTestId('nav-icon')).toBeInTheDocument()
  })

  it('no renderiza icono si Icon no se pasa', () => {
    renderLink()
    expect(screen.queryByTestId('nav-icon')).not.toBeInTheDocument()
  })

  it('aplica clases de estado activo', () => {
    renderLink({ active: true })
    expect(screen.getByRole('link')).toHaveClass('link-active')
  })

  it('aplica clases de estado inactivo', () => {
    renderLink({ active: false })
    expect(screen.getByRole('link')).toHaveClass('link-inactive')
  })

  it('llama onClick al hacer clic', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    renderLink({ onClick })
    await user.click(screen.getByRole('link'))
    expect(onClick).toHaveBeenCalledOnce()
  })
})
