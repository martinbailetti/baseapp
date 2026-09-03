import { describe, it, expect } from 'vitest'
import { resolveApiPublicPath } from '../../scripts/deploy-to-api.js'

describe('resolveApiPublicPath', () => {
  it('resuelve la carpeta pública de la API correctamente en este workspace', () => {
    const result = resolveApiPublicPath(new URL('../../scripts', import.meta.url).pathname)
    const normalized = result.replace(/\\/g, '/')

    expect(normalized.toLowerCase().endsWith('/baseapi/public')).toBe(true)
    expect(normalized).toContain('/baseapi/')
  })
})
