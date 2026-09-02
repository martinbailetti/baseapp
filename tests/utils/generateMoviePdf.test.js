import { describe, it, expect, vi, beforeEach } from 'vitest'

const html2canvasMock = vi.fn()

class JsPDFMock {
  constructor() {
    this.internal = { pageSize: { getWidth: () => 210, getHeight: () => 297 } }
    this.addImage = vi.fn()
    this.addPage = vi.fn()
    this.save = vi.fn()
  }
}

vi.mock('html2canvas', () => ({
  default: (...args) => html2canvasMock(...args),
}))

vi.mock('jspdf', () => ({
  jsPDF: JsPDFMock,
}))

import { moviePdfFilename, generateMoviePdf } from '@/utils/generateMoviePdf'

describe('moviePdfFilename', () => {
  it('normaliza títulos con acentos y espacios', () => {
    expect(moviePdfFilename('El señor de los anillos')).toBe('El_senor_de_los_anillos.pdf')
  })

  it('elimina caracteres no válidos', () => {
    expect(moviePdfFilename('Star Wars: Episodio IV!!!')).toBe('Star_Wars_Episodio_IV.pdf')
  })

  it('usa "pelicula" si el título queda vacío', () => {
    expect(moviePdfFilename('!!!')).toBe('pelicula.pdf')
    expect(moviePdfFilename()).toBe('pelicula.pdf')
  })

  it('limita la longitud del nombre a 80 caracteres', () => {
    const longTitle = 'a'.repeat(120)
    expect(moviePdfFilename(longTitle)).toBe(`${'a'.repeat(80)}.pdf`)
  })
})

describe('generateMoviePdf', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    html2canvasMock.mockResolvedValue({
      width: 100,
      height: 400,
      toDataURL: () => 'data:image/png;base64,abc',
    })
  })

  it('genera y guarda un PDF a partir de un elemento DOM', async () => {
    const element = document.createElement('div')
    element.innerHTML = '<p>Test</p>'

    await generateMoviePdf(element, 'test.pdf')

    expect(html2canvasMock).toHaveBeenCalledWith(element, expect.objectContaining({
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
    }))
    expect(html2canvasMock).toHaveBeenCalled()
  })

  it('añade páginas extra cuando el contenido es muy alto', async () => {
    html2canvasMock.mockResolvedValue({
      width: 100,
      height: 2000,
      toDataURL: () => 'data:image/png;base64,abc',
    })

    const element = document.createElement('div')
    await expect(generateMoviePdf(element, 'largo.pdf')).resolves.toBeUndefined()
  })

  it('continúa si la imagen del elemento ya está cargada', async () => {
    const element = document.createElement('div')
    const img = document.createElement('img')
    Object.defineProperty(img, 'complete', { value: true })
    Object.defineProperty(img, 'naturalWidth', { value: 100 })
    element.appendChild(img)

    await expect(generateMoviePdf(element, 'con-imagen.pdf')).resolves.toBeUndefined()
  })
})
