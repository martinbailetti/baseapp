import { createRef } from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { MoviePdfSheet } from '@/components/Movies/MoviePdfSheet'
import { APP_NAME } from '@/utils/appConfig'

const baseMovie = {
  spanish_title: 'Todo sobre mi madre',
  original_title: 'Todo sobre mi madre',
  release_year: 1999,
  director_name: 'Pedro Almodóvar',
  is_favorite: false,
  actors: [],
}

describe('MoviePdfSheet', () => {
  it('renderiza la ficha con título y director', () => {
    render(<MoviePdfSheet movie={baseMovie} />)

    expect(screen.getByText(APP_NAME)).toBeInTheDocument()
    expect(screen.getByText('Ficha de película')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Todo sobre mi madre', level: 1 })).toBeInTheDocument()
    expect(screen.getByText('Todo sobre mi madre (1999)')).toBeInTheDocument()
    expect(screen.getByText('Pedro Almodóvar')).toBeInTheDocument()
  })

  it('muestra mensaje sin reparto', () => {
    render(<MoviePdfSheet movie={baseMovie} />)
    expect(screen.getByText('Sin actores añadidos')).toBeInTheDocument()
  })

  it('muestra badge de favorita', () => {
    render(<MoviePdfSheet movie={{ ...baseMovie, is_favorite: true }} />)
    expect(screen.getByText(/Película favorita/)).toBeInTheDocument()
  })

  it('renderiza actores con personaje y nombre artístico', () => {
    render(
      <MoviePdfSheet
        movie={{
          ...baseMovie,
          actors: [
            { id: 1, first_name: 'Penélope', last_name: 'Cruz', character_name: 'Raimunda' },
            { id: 2, first_name: 'Antonio', last_name: 'Banderas', stage_name: 'El Toro' },
          ],
        }}
      />
    )

    expect(screen.getByText('Cruz, Penélope — Raimunda')).toBeInTheDocument()
    expect(screen.getByText('Banderas, Antonio (El Toro)')).toBeInTheDocument()
  })

  it('muestra guion si no hay director', () => {
    render(<MoviePdfSheet movie={{ ...baseMovie, director_name: '' }} />)
    expect(screen.getByText('—')).toBeInTheDocument()
  })

  it('expone la referencia al contenedor', () => {
    const ref = createRef()
    render(<MoviePdfSheet ref={ref} movie={baseMovie} />)
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })
})
