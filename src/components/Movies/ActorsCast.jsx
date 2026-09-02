import { useState, useEffect } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { apiFetch } from '@/utils/apiFetch'

const sizeClasses = {
  sm: 'px-2 py-1 text-xs',
  lg: 'px-3 py-2.5 text-sm rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500/20',
}

export function ActorsCast({ cast, onChange, size = 'sm' }) {
  const { t } = useTranslation()
  const [actors,  setActors]  = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiFetch('/api/actors?per_page=999&sort=last_name&direction=ASC')
      .then(r => r.json())
      .then(j => {
        const items = j.data?.items ?? (Array.isArray(j.data) ? j.data : [])
        setActors(items)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  function addRow() {
    onChange([...cast, { actor_id: '', character_name: '' }])
  }

  function removeRow(i) {
    onChange(cast.filter((_, idx) => idx !== i))
  }

  function updateRow(i, field, v) {
    onChange(cast.map((r, idx) => idx === i ? { ...r, [field]: v } : r))
  }

  const isPage = size === 'lg'

  return (
    <div className="min-w-0">
      <div className="mb-3 flex items-center justify-end">
        <button
          type="button"
          onClick={addRow}
          className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700 transition-colors hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300 dark:hover:bg-indigo-950/60"
        >
          <Plus className="h-3.5 w-3.5" /> {t('cinema.formAddActor', 'Añadir')}
        </button>
      </div>
      {cast.length === 0 && (
        <div className="rounded-xl border border-dashed border-gray-200 py-8 text-center dark:border-slate-600">
          <p className="text-sm text-gray-400 dark:text-slate-500">{t('cinema.formNoActors', 'Sin actores añadidos')}</p>
          <p className="mt-1 text-xs text-gray-300 dark:text-slate-600">{t('cinema.formNoActorsHint', 'Pulsa "Añadir" para incluir actores en el reparto')}</p>
        </div>
      )}
      <div className="space-y-3">
        {cast.map((row, i) => (
          <div
            key={i}
            className={`rounded-xl border border-gray-100 bg-gray-50/80 p-3 dark:border-slate-700 dark:bg-slate-700/30 ${
              isPage
                ? 'grid gap-2.5 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_auto] md:items-center'
                : 'flex items-center gap-2'
            }`}
          >
            <select
              id={`cast-actor-${i}`}
              name={`cast[${i}].actor_id`}
              value={row.actor_id}
              onChange={e => updateRow(i, 'actor_id', e.target.value)}
              disabled={loading}
              aria-label={t('cinema.formPlaceholderActor', '— Actor —')}
              className={`min-w-0 rounded border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-white focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 ${sizeClasses[size]} ${isPage ? 'w-full md:col-span-1' : 'flex-1'}`}
            >
              <option value="">{t('cinema.formPlaceholderActor', '— Actor —')}</option>
              {actors.map(a => (
                <option key={a.id} value={a.id}>{a.last_name}, {a.first_name}{a.stage_name ? ` (${a.stage_name})` : ''}</option>
              ))}
            </select>
            <input
              id={`cast-character-${i}`}
              name={`cast[${i}].character_name`}
              type="text"
              placeholder={t('cinema.formPlaceholderCharacter', 'Personaje')}
              value={row.character_name}
              onChange={e => updateRow(i, 'character_name', e.target.value)}
              className={`min-w-0 rounded border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-white focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 ${sizeClasses[size]} ${isPage ? 'w-full' : 'flex-1'}`}
            />
            <button
              type="button"
              onClick={() => removeRow(i)}
              className={`shrink-0 rounded-lg p-2 text-red-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 ${isPage ? 'justify-self-end md:justify-self-auto' : ''}`}
              aria-label={t('common.delete', 'Eliminar')}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
