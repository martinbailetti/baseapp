import { describe, it, expect } from 'vitest'
import { getVisibleSubitems } from '@/components/navbar/navVisibility'

describe('getVisibleSubitems', () => {
  it('incluye ítems sin requiredRole', () => {
    const subitems = [{ to: '/a', labelKey: 'nav.a' }]
    expect(getVisibleSubitems(subitems, () => false)).toEqual(subitems)
  })

  it('filtra por requiredRole (string)', () => {
    const hasRole = (role) => role === 'admin'
    const subitems = [
      { to: '/admin', requiredRole: 'admin' },
      { to: '/user', requiredRole: 'user' },
    ]
    expect(getVisibleSubitems(subitems, hasRole).map((item) => item.to)).toEqual(['/admin'])
  })

  it('filtra por requiredRole (array)', () => {
    const hasRole = (role) => role === 'editor'
    const subitems = [{ to: '/edit', requiredRole: ['admin', 'editor'] }]
    expect(getVisibleSubitems(subitems, hasRole)).toHaveLength(1)
  })

  it('filtra por anyRole cuando el usuario tiene uno de los roles', () => {
    const hasRole = (role) => role === 'viewer'
    const subitems = [
      { to: '/view', anyRole: ['admin', 'viewer'] },
      { to: '/admin', anyRole: 'admin' },
    ]
    expect(getVisibleSubitems(subitems, hasRole).map((item) => item.to)).toEqual(['/view'])
  })

  it('filtra por anyRole con valor string', () => {
    const hasRole = (role) => role === 'admin'
    const subitems = [{ to: '/admin', anyRole: 'admin' }]
    expect(getVisibleSubitems(subitems, hasRole)).toHaveLength(1)
  })

  it('excluye ítems cuando el usuario tiene excludeRole', () => {
    const hasRole = (role) => role === 'guest'
    const subitems = [
      { to: '/members', excludeRole: 'guest' },
      { to: '/public' },
    ]
    expect(getVisibleSubitems(subitems, hasRole).map((item) => item.to)).toEqual(['/public'])
  })

  it('excluye ítems cuando excludeRole es un array', () => {
    const hasRole = (role) => role === 'admin'
    const subitems = [{ to: '/restricted', excludeRole: ['admin', 'super'] }]
    expect(getVisibleSubitems(subitems, hasRole)).toHaveLength(0)
  })
})
