import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { apiFetch } from '@/utils/apiFetch'

const sizeClasses = {
  sm: 'px-3 py-2 text-sm',
  lg: 'px-4 py-2.5 text-sm rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500/20',
}

export function DirectorSelect({ id = 'director', value, onChange, size = 'sm' }) {
  const { t } = useTranslation()
  const [directors, setDirectors] = useState([])
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    apiFetch('/api/directors?per_page=999&sort=last_name&direction=ASC')
      .then(r => r.json())
      .then(j => {
        const items = j.data?.items ?? (Array.isArray(j.data) ? j.data : [])
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
      required
      className={`w-full rounded-md border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700/80 dark:text-white focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 ${sizeClasses[size]}`}
    >
      <option value="">{t('cinema.formSelectDirector', '— Selecciona un director —')}</option>
      {directors.map(d => (
        <option key={d.id} value={d.id}>{d.last_name}, {d.first_name}</option>
      ))}
    </select>
  )
}
