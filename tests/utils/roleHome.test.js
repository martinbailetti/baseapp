import { describe, it, expect } from 'vitest'
import { getHomeForRoles } from '@/utils/roleHome'

describe('getHomeForRoles', () => {
  it('devuelve /home para rol super', () => {
    expect(getHomeForRoles((role) => role === 'super')).toBe('/home')
  })

  it('devuelve /home para rol admin', () => {
    expect(getHomeForRoles((role) => role === 'admin')).toBe('/home')
  })

  it('devuelve /home por defecto si no hay rol coincidente', () => {
    expect(getHomeForRoles(() => false)).toBe('/home')
  })

  it('devuelve /home por defecto si hasRole no es función', () => {
    expect(getHomeForRoles(null)).toBe('/home')
    expect(getHomeForRoles(undefined)).toBe('/home')
  })

  it('prioriza el primer rol del mapa', () => {
    const hasRole = (role) => ['super', 'admin'].includes(role)
    expect(getHomeForRoles(hasRole)).toBe('/home')
  })
})
