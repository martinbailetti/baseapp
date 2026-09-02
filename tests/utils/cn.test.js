import { describe, it, expect } from 'vitest'
import { cn } from '@/utils/cn'

describe('cn', () => {
  it('combina clases simples', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('resuelve conflictos de Tailwind (última clase gana)', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4')
  })

  it('omite valores falsy', () => {
    expect(cn('base', false && 'hidden', 'visible')).toBe('base visible')
  })

  it('omite undefined y null', () => {
    expect(cn('base', undefined, null)).toBe('base')
  })

  it('acepta arrays de clases', () => {
    expect(cn(['foo', 'bar'])).toBe('foo bar')
  })
})
