import { describe, it, expect } from 'vitest'
import { generateHomeMarkdown } from '@/utils/generateHomeMarkdown'
import { HOME_WEBAPP_ENV, HOME_API_ENV } from '@/config/pageConfigs'

describe('generateHomeMarkdown', () => {
  it('genera un documento markdown con secciones principales', () => {
    const md = generateHomeMarkdown()

    expect(md).toContain('# BaseKit')
    expect(md).toContain('## Autenticación — API')
    expect(md).toContain('## Entorno de desarrollo')
    expect(md).toContain('## Frontend — Estilos y recursos')
    expect(md).toContain('## Base de datos')
    expect(md).toContain('## Webapp — Variables de entorno')
    expect(md).toContain('## API — Variables de entorno')
  })

  it('incluye tablas de variables de entorno', () => {
    const md = generateHomeMarkdown()

    expect(md).toContain('| Variable | Descripción | Ejemplo | Estado |')
    expect(HOME_WEBAPP_ENV[0].name).toBeTruthy()
    expect(md).toContain(HOME_WEBAPP_ENV[0].name)
    expect(md).toContain(HOME_API_ENV[0].name)
  })

  it('marca variables opcionales en la tabla', () => {
    const optional = HOME_WEBAPP_ENV.find((row) => row.required === false)
    expect(optional).toBeTruthy()

    const md = generateHomeMarkdown()
    expect(md).toContain('opcional')
    expect(md).toContain('requerido')
  })

  it('incluye fecha de generación al final', () => {
    const md = generateHomeMarkdown()
    expect(md).toMatch(/\*Generado el .+\*/)
  })
})
