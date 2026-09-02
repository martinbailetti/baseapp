import { useTranslation } from 'react-i18next'
import { cn } from '@/utils/cn'

export function CrudTablePagination({
  total,
  page,
  totalPages,
  onFirstPage,
  onPrevPage,
  onNextPage,
  onLastPage,
  perPage,
  onPerPageChange,
  perPageOptions,
}) {
  const { t } = useTranslation()

  return (
    <div className="flex shrink-0 flex-wrap items-center gap-3 border-t border-gray-200 bg-white px-4 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-900">
      <span className="text-gray-500 dark:text-slate-400">
        {total} {total !== 1 ? t('common.records', 'registros') : t('common.record', 'registro')}
      </span>

      <div className="flex items-center gap-1 ml-auto">
        <button
          disabled={page <= 1}
          onClick={onFirstPage}
          className="rounded px-2 py-1 text-gray-500 disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
        >«</button>
        <button
          disabled={page <= 1}
          onClick={onPrevPage}
          className="rounded px-2 py-1 text-gray-500 disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
        >‹</button>
        <span className="px-2 text-gray-700 dark:text-slate-300">
          {page} / {totalPages}
        </span>
        <button
          disabled={page >= totalPages}
          onClick={onNextPage}
          className="rounded px-2 py-1 text-gray-500 disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
        >›</button>
        <button
          disabled={page >= totalPages}
          onClick={onLastPage}
          className="rounded px-2 py-1 text-gray-500 disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
        >»</button>
      </div>

      <div className="flex items-center gap-1.5">
        <span className="text-gray-500 dark:text-slate-400 text-xs">{t('common.rowsPerPage', 'Filas:')}</span>
        {perPageOptions.map((n) => (
          <button
            key={n}
            onClick={() => onPerPageChange(n)}
            className={cn(
              'rounded px-2 py-0.5 text-xs font-medium transition-colors',
              perPage === n
                ? 'bg-indigo-600 text-white'
                : 'text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700'
            )}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  )
}
