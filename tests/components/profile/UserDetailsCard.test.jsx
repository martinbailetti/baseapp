import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import UserDetailsCard from '@/components/profile/UserDetailsCard'

describe('UserDetailsCard', () => {
  it('muestra nombre, email y campos con valor', () => {
    render(
      <UserDetailsCard
        user={{
          name: 'Ana García',
          email: 'ana@test.com',
          email_verified: true,
        }}
        fields={[
          { label: 'Usuario', value: 'ana' },
          { label: 'Vacío', value: null },
        ]}
      />
    )
    expect(screen.getByText('Ana García')).toBeInTheDocument()
    expect(screen.getByText('ana@test.com')).toBeInTheDocument()
    expect(screen.getByText('ana')).toBeInTheDocument()
    expect(screen.queryByText('Vacío')).not.toBeInTheDocument()
  })

  it('usa preferred_username si no hay name', () => {
    render(
      <UserDetailsCard
        user={{ preferred_username: 'usuario123', email_verified: false }}
        fields={[]}
      />
    )
    expect(screen.getByText('usuario123')).toBeInTheDocument()
    expect(screen.getByText('No verificado')).toBeInTheDocument()
  })

  it('muestra badge de email verificado', () => {
    render(
      <UserDetailsCard
        user={{ name: 'Test', email_verified: true }}
        fields={[]}
      />
    )
    expect(screen.getByText('Verificado')).toBeInTheDocument()
  })
})
