import { forwardRef } from 'react'
import { useTranslation } from 'react-i18next'
import { APP_NAME } from '@/utils/appConfig'

function actorLabel(actor) {
  const name = `${actor.last_name}, ${actor.first_name}${actor.stage_name ? ` (${actor.stage_name})` : ''}`
  return actor.character_name ? `${name} — ${actor.character_name}` : name
}

export const MoviePdfSheet = forwardRef(function MoviePdfSheet({ movie }, ref) {
  const { t } = useTranslation()
  const actors = movie?.actors ?? []

  return (
    <div
      ref={ref}
      style={{
        width: 595,
        padding: 40,
        fontFamily: 'Arial, sans-serif',
        backgroundColor: '#ffffff',
        color: '#111827',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          paddingBottom: 16,
          marginBottom: 24,
          borderBottom: '2px solid #e5e7eb',
        }}
      >
        <img
          src="/images/logo.png"
          alt=""
          style={{ height: 40, width: 'auto', objectFit: 'contain' }}
        />
        <span style={{ fontSize: 22, fontWeight: 700, color: '#4338ca', letterSpacing: '-0.02em' }}>
          {APP_NAME}
        </span>
      </div>

      <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#6366f1', marginBottom: 8 }}>
        {t('cinema.pdfSheetTitle', 'Ficha de película')}
      </p>
      <h1 style={{ fontSize: 26, fontWeight: 700, margin: '0 0 6px', lineHeight: 1.2 }}>
        {movie.spanish_title}
      </h1>
      <p style={{ fontSize: 14, color: '#6b7280', margin: '0 0 28px' }}>
        {movie.original_title} ({movie.release_year})
      </p>

      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#9ca3af', marginBottom: 4 }}>
          {t('cinema.colDirector', 'Director')}
        </div>
        <div style={{ fontSize: 15 }}>{movie.director_name || '—'}</div>
      </div>

      {movie.is_favorite ? (
        <div style={{ marginBottom: 20, fontSize: 13, color: '#e11d48' }}>
          ★ {t('cinema.pdfFavorite', 'Película favorita')}
        </div>
      ) : null}

      <div>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#9ca3af', marginBottom: 8 }}>
          {t('cinema.formCast', 'Reparto')}
        </div>
        {actors.length === 0 ? (
          <p style={{ fontSize: 13, color: '#9ca3af', fontStyle: 'italic', margin: 0 }}>
            {t('cinema.formNoActors', 'Sin actores añadidos')}
          </p>
        ) : (
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            {actors.map(actor => (
              <li key={actor.id} style={{ fontSize: 13, marginBottom: 6 }}>
                {actorLabel(actor)}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
})
