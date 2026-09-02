import { useState, useEffect, useCallback, useRef } from 'react'
import { Search, X, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { apiFetch } from '@/utils/apiFetch'
import * as keycloakPrefs from '@/utils/keycloakPrefs'
import { cn } from '@/utils/cn'
import { ACTIVITY_LOG_PER_PAGE_OPTIONS, ACTIVITY_LOG_COLUMNS_KEYS } from '@/config/pageConfigs'
import { STORAGE_KEYS } from '@/config/storageKeys'
import { DEFAULT_PER_PAGE, PREFS_LOAD_FALLBACK_MS } from '@/config/defaults'
import { LogRow } from '@/components/ActivityLog'

const PER_PAGE_OPTIONS = ACTIVITY_LOG_PER_PAGE_OPTIONS
const COLUMNS_KEYS = ACTIVITY_LOG_COLUMNS_KEYS
const STORAGE_KEY = STORAGE_KEYS.ACTIVITY_LOG

function restoreFilters(prefs) {
  const f = prefs.filters || {}
  return {
    user_email: f.user_email || '',
    action:     f.action     || '',
    entity:     f.entity     || '',
    date_from:  f.date_from  || '',
    date_to:    f.date_to    || '',
  }
}

const ActivityLogPage = () => {
  const { t } = useTranslation()
  const prefsApplied = useRef(false)
  const [prefsReady, setPrefsReady] = useState(false)

  const [rows,    setRows]    = useState([])
  const [total,   setTotal]   = useState(0)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  const [page,    setPage]    = useState(1)
  const [perPage, setPerPage] = useState(DEFAULT_PER_PAGE)
  const [sortBy,  setSortBy]  = useState('Id')
  const [sortDir, setSortDir] = useState('desc')

  // Filtros pending (formulario)
  const [fEmail,    setFEmail]    = useState('')
  const [fAction,   setFAction]   = useState('')
  const [fEntity,   setFEntity]   = useState('')
  const [fDateFrom, setFDateFrom] = useState('')
  const [fDateTo,   setFDateTo]   = useState('')

  // Filtros aplicados
  const [aEmail,    setAEmail]    = useState('')
  const [aAction,   setAAction]   = useState('')
  const [aEntity,   setAEntity]   = useState('')
  const [aDateFrom, setADateFrom] = useState('')
  const [aDateTo,   setADateTo]   = useState('')

  // Opciones para selects
  const [actionOpts, setActionOpts] = useState([])
  const [entityOpts, setEntityOpts] = useState([])

  useEffect(() => {
    async function loadOpts(column, setter) {
      try {
        const res  = await apiFetch(`/api/activity-log/filters?column=${column}`)
        const json = await res.json()
        setter(Array.isArray(json.data) ? json.data : [])
      } catch { /* noop */ }
    }
    loadOpts('action', setActionOpts)
    loadOpts('entity', setEntityOpts)
  }, [])

  useEffect(() => {
    const fallback = setTimeout(() => setPrefsReady(true), PREFS_LOAD_FALLBACK_MS)
    const unsub = keycloakPrefs.subscribe(STORAGE_KEY, (p) => {
      if (prefsApplied.current) return
      setPerPage(p.perPage || DEFAULT_PER_PAGE)
      if (p.sortBy)  setSortBy(p.sortBy)
      if (p.sortDir) setSortDir(p.sortDir)
      const filters = restoreFilters(p)
      setFEmail(filters.user_email)
      setFAction(filters.action)
      setFEntity(filters.entity)
      setFDateFrom(filters.date_from)
      setFDateTo(filters.date_to)
      setAEmail(filters.user_email)
      setAAction(filters.action)
      setAEntity(filters.entity)
      setADateFrom(filters.date_from)
      setADateTo(filters.date_to)
      prefsApplied.current = true
      clearTimeout(fallback)
      setPrefsReady(true)
    })
    keycloakPrefs.ensureLoaded(STORAGE_KEY)
    return () => { unsub(); clearTimeout(fallback) }
  }, [])

  useEffect(() => {
    if (!prefsReady) return
    keycloakPrefs.setPrefs(STORAGE_KEY, {
      perPage,
      sortBy,
      sortDir,
      filters: {
        user_email: aEmail,
        action:     aAction,
        entity:     aEntity,
        date_from:  aDateFrom,
        date_to:    aDateTo,
      },
    })
  }, [perPage, sortBy, sortDir, aEmail, aAction, aEntity, aDateFrom, aDateTo, prefsReady])

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ page, per_page: perPage, sort: sortBy, direction: sortDir })
      if (aEmail)    params.set('user_email', aEmail)
      if (aAction)   params.set('action',     aAction)
      if (aEntity)   params.set('entity',     aEntity)
      if (aDateFrom) params.set('date_from',  aDateFrom)
      if (aDateTo)   params.set('date_to',    aDateTo)

      const res  = await apiFetch(`/api/activity-log?${params}`)
      const json = await res.json()
      if (!res.ok || !json.success) throw new Error(json.message || `Error ${res.status}`)
      setRows(json.data?.items || [])
      setTotal(json.data?.pagination?.total || 0)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [page, perPage, sortBy, sortDir, aEmail, aAction, aEntity, aDateFrom, aDateTo])

  useEffect(() => {
    if (!prefsReady) return
    fetchData()
  }, [fetchData, prefsReady])

  function handleSort(key) {
    if (!key) return
    if (sortBy === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortBy(key); setSortDir('asc') }
    setPage(1)
  }

  function applyFilters() {
    setAEmail(fEmail)
    setAAction(fAction)
    setAEntity(fEntity)
    setADateFrom(fDateFrom)
    setADateTo(fDateTo)
    setPage(1)
  }

  function clearFilters() {
    setFEmail(''); setFAction(''); setFEntity(''); setFDateFrom(''); setFDateTo('')
    setAEmail(''); setAAction(''); setAEntity(''); setADateFrom(''); setADateTo('')
    setPage(1)
  }

  const totalPages = Math.ceil(total / perPage) || 1
  const hasFilters = aEmail || aAction || aEntity || aDateFrom || aDateTo

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
    <div className="mx-auto max-w-screen-xl px-4 py-6">
      <h1 className="mb-4 text-xl font-semibold text-gray-900">{t('activityLog.title')}</h1>

      {/* Filtros */}
      <div className="mb-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          <input
            id="activity-log-filter-user"
            name="filterUser"
            type="text"
            placeholder={t('activityLog.filterUser')}
            value={fEmail}
            onChange={e => setFEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && applyFilters()}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <select
            id="activity-log-filter-action"
            name="filterAction"
            value={fAction}
            onChange={e => setFAction(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">{t('activityLog.filterAllActions')}</option>
            {actionOpts.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
          <select
            id="activity-log-filter-entity"
            name="filterEntity"
            value={fEntity}
            onChange={e => setFEntity(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">{t('activityLog.filterAllEntities')}</option>
            {entityOpts.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
          <input
            id="activity-log-filter-date-from"
            name="filterDateFrom"
            type="date"
            value={fDateFrom}
            onChange={e => setFDateFrom(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            title="Des de"
          />
          <input
            id="activity-log-filter-date-to"
            name="filterDateTo"
            type="date"
            value={fDateTo}
            onChange={e => setFDateTo(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            title="Fins a"
          />
        </div>
        <div className="mt-3 flex items-center gap-2">
          <button
            onClick={applyFilters}
            className="flex items-center gap-1.5 rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
          >
            <Search className="h-3.5 w-3.5" />
            {t('activityLog.apply')}
          </button>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
              {t('activityLog.clear')}
            </button>
          )}
          <span className="ml-auto text-sm text-gray-500">
            {total} registres
          </span>
        </div>
      </div>

      {/* Tabla */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        {error && (
          <div className="px-4 py-3 text-sm text-red-600 bg-red-50 border-b border-red-200">{error}</div>
        )}
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {COLUMNS_KEYS.map(({ tKey, sortKey }) => (
                  <th
                    key={tKey}
                    onClick={() => handleSort(sortKey)}
                    className={cn(
                      'px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 whitespace-nowrap select-none',
                      sortKey ? 'cursor-pointer hover:bg-gray-100 transition-colors' : ''
                    )}
                  >
                    <span className="inline-flex items-center gap-1">
                      {t(tKey)}
                      {sortKey && (
                        sortBy === sortKey
                          ? sortDir === 'asc'
                            ? <ChevronUp className="h-3.5 w-3.5 text-indigo-600" />
                            : <ChevronDown className="h-3.5 w-3.5 text-indigo-600" />
                          : <ChevronsUpDown className="h-3.5 w-3.5 opacity-40" />
                      )}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">{t('common.loading')}</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">—</td></tr>
              ) : rows.map(row => (
                <LogRow key={row.Id} row={row} />
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Files per pàgina:</span>
            <select
              id="activity-log-per-page"
              name="perPage"
              value={perPage}
              onChange={e => { setPerPage(Number(e.target.value)); setPage(1) }}
              className="rounded border border-gray-300 px-2 py-0.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {PER_PAGE_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded p-1 text-gray-500 hover:bg-gray-100 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-2 text-sm text-gray-600">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="rounded p-1 text-gray-500 hover:bg-gray-100 disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
    </div>
  )
}

export default ActivityLogPage
