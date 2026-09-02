import { Pencil, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/utils/cn'
import { SortIcon } from './SortIcon'

export function CrudTableGrid({
  error,
  visibleCols,
  colWidths,
  sortCriteria,
  dragOver,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  onHandleSort,
  onResizeStart,
  showActions,
  loading,
  rows,
  renderCell,
  renderActions,
  onEdit,
  onDelete,
}) {
  const { t } = useTranslation()

  if (error) {
    return (
      <div className="m-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 text-sm text-red-700 dark:text-red-300">
        {error}
      </div>
    )
  }

  return (
    <table className="w-full text-sm border-collapse">
      <thead className="sticky top-0 z-10 bg-gray-50 dark:bg-slate-800">
        <tr>
          {visibleCols.map((col) => (
            <th
              key={col.key}
              style={{ width: colWidths[col.key] ?? 'auto', minWidth: colWidths[col.key] ?? 60, position: 'relative' }}
              draggable
              onDragStart={() => onDragStart(col.key)}
              onDragOver={(e) => onDragOver(e, col.key)}
              onDrop={() => onDrop(col.key)}
              onDragEnd={onDragEnd}
              className={cn(
                'select-none whitespace-nowrap px-3 py-2.5 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide border-b border-gray-200 dark:border-slate-700 cursor-grab',
                dragOver === col.key && 'bg-indigo-50 dark:bg-indigo-900/30'
              )}
            >
              <button
                className="flex items-center gap-1 hover:text-indigo-600"
                onClick={() => onHandleSort(col.key)}
              >
                {col.label}
                <SortIcon colKey={col.key} sortCriteria={sortCriteria} />
              </button>
              <span
                onMouseDown={(e) => onResizeStart(e, col.key)}
                className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-indigo-400 opacity-0 hover:opacity-100"
              />
            </th>
          ))}
          {showActions && (
            <th className="px-3 py-2.5 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide border-b border-gray-200 dark:border-slate-700 text-right w-20">
              {t('common.actions', 'Acciones')}
            </th>
          )}
        </tr>
      </thead>
      <tbody>
        {loading && rows.length === 0 && (
          <tr>
            <td colSpan={visibleCols.length + (showActions ? 1 : 0)} className="px-4 py-8 text-center text-sm text-gray-400">
              {t('common.loading')}
            </td>
          </tr>
        )}
        {!loading && rows.length === 0 && (
          <tr>
            <td colSpan={visibleCols.length + (showActions ? 1 : 0)} className="px-4 py-8 text-center text-sm text-gray-400">
              {t('common.noData')}
            </td>
          </tr>
        )}
        {rows.map((row, i) => (
          <tr
            key={row.id ?? i}
            className={cn(
              'transition-colors',
              i % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-gray-50/50 dark:bg-slate-800/50',
              'hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20'
            )}
          >
            {visibleCols.map((col) => (
              <td
                key={col.key}
                style={{ width: colWidths[col.key] ?? 'auto' }}
                className="px-3 py-2 border-b border-gray-100 dark:border-slate-800 text-gray-700 dark:text-slate-200 whitespace-nowrap overflow-hidden text-ellipsis max-w-[320px]"
              >
                {renderCell
                  ? renderCell(col.key, row[col.key], row)
                  : (row[col.key] === null || row[col.key] === undefined || row[col.key] === ''
                      ? <span className="text-gray-300">—</span>
                      : String(row[col.key]))}
              </td>
            ))}
            {showActions && (
              <td className="px-3 py-2 border-b border-gray-100 dark:border-slate-800 text-right">
                <div className="flex items-center justify-end gap-1">
                  {renderActions && renderActions(row)}
                  {onEdit && (
                    <button
                      onClick={() => onEdit(row)}
                      className="rounded p-1 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
                      title={t('common.edit', 'Editar')}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(row)}
                      className="rounded p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                      title={t('common.delete', 'Eliminar')}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
