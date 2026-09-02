import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { apiFetch } from '@/utils/apiFetch'

export function DirectorFilterSelect({ id = 'director-filter', value, onChange }) {
  const { t } = useTranslation()
  const [directors, setDirectors] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiFetch('/api/movies/filters/directors')
      .then(r => r.json())
      .then(j => {
        const items = Array.isArray(j.data) ? j.data : []
        setDirectors(items)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <select
      id={id}
      name="director_id"
      value={value}
      onChange={e => onChange(e.target.value)}
      disabled={loading}
      className="w-full rounded-md border border-gray-300 dark:border-slate-600 px-3 py-1.5 text-sm bg-white dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
    >
      <option value="">{t('cinema.filterAllDirectors', 'Todos los directores')}</option>
      {directors.map(d => (
        <option key={d.id} value={d.id}>{d.last_name}, {d.first_name}</option>
      ))}
    </select>
  )
}
