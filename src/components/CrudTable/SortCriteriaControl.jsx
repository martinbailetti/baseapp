import { useEffect, useRef, useState } from 'react'
import { ChevronsUpDown, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export function SortCriteriaControl({
  columns,
  sortCriteria,
  onToggleColumn,
  onToggleDirection,
  onRemoveCriterion,
  onResetDefault,
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const { t } = useTranslation()

  useEffect(() => {
    if (!open) return
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const selectedKeys = new Set(sortCriteria.map((s) => s.key))

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        title={t('common.sortControl', 'Ordenación')}
        className="relative rounded-md p-1.5 text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <ChevronsUpDown className="h-4 w-4" />
        {sortCriteria.length > 0 && (
          <span className="absolute -right-2 -top-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white dark:border-slate-900 bg-red-600 px-1 text-[10px] font-bold leading-none text-white shadow-sm">
            {sortCriteria.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-dropdown mt-1 w-80 max-w-[calc(100vw-2rem)] rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 shadow-lg">
          <div className="mb-1 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
            {t('common.sortActiveCriteria', 'Criterios activos')}
          </div>

          {sortCriteria.length === 0 ? (
            <div className="px-2 py-2 text-xs text-gray-400 dark:text-slate-500">
              {t('common.sortNoCriteria', 'Sin criterios. Haz click en una cabecera para añadir.')}
            </div>
          ) : (
            <div className="space-y-1">
              {sortCriteria.map((criterion, idx) => {
                const col = columns.find((c) => c.key === criterion.key)
                const label = col?.label || criterion.key
                return (
                  <div key={criterion.key} className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-gray-50 dark:hover:bg-slate-700">
                    <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-gray-100 dark:bg-slate-700 px-1 text-[10px] font-bold text-gray-600 dark:text-slate-300">
                      {idx + 1}
                    </span>
                    <span className="flex-1 truncate text-sm text-gray-700 dark:text-slate-200">{label}</span>
                    <button
                      type="button"
                      onClick={() => onToggleDirection(criterion.key)}
                      className="rounded border border-gray-300 dark:border-slate-600 px-2 py-0.5 text-[11px] font-semibold text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-600"
                    >
                      {criterion.dir === 'asc'
                        ? t('common.sortDirectionAsc', 'A-Z')
                        : t('common.sortDirectionDesc', 'Z-A')}
                    </button>
                    <button
                      type="button"
                      onClick={() => onRemoveCriterion(criterion.key)}
                      className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30"
                      title={t('common.sortRemoveCriteria', 'Quitar criterio')}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )
              })}
            </div>
          )}

          <div className="mt-2 border-t border-gray-100 dark:border-slate-700 pt-2">
            <div className="mb-1 px-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
              {t('common.sortAddColumn', 'Añadir columna')}
            </div>
            <div className="max-h-40 space-y-0.5 overflow-y-auto">
              {columns.filter((c) => !selectedKeys.has(c.key)).map((col) => (
                <button
                  key={col.key}
                  type="button"
                  onClick={() => onToggleColumn(col.key)}
                  className="w-full rounded px-2 py-1.5 text-left text-sm text-gray-700 dark:text-slate-200 hover:bg-indigo-50 hover:text-indigo-700 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-300"
                >
                  {col.label}
                </button>
              ))}
              {columns.every((c) => selectedKeys.has(c.key)) && (
                <div className="px-2 py-1.5 text-xs text-gray-400 dark:text-slate-500">
                  {t('common.sortNoMoreColumns', 'No hay más columnas disponibles.')}
                </div>
              )}
            </div>
          </div>

          <div className="mt-2 flex justify-end border-t border-gray-100 dark:border-slate-700 pt-2">
            <button
              type="button"
              onClick={() => { onResetDefault(); setOpen(false) }}
              className="rounded border border-gray-300 dark:border-slate-600 px-2.5 py-1 text-xs font-medium text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700"
            >
              {t('common.sortReset', 'Restablecer')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
