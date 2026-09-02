import { Settings2, Download, Plus, Search, X, RefreshCw } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { SortCriteriaControl } from './SortCriteriaControl'

export function CrudTableHeader({
  title,
  searchInput,
  onChangeSearchInput,
  onSearchKeyDown,
  onApplySearch,
  onClearSearch,
  filterSlot,
  colMenuRef,
  showColMenu,
  onToggleColMenu,
  orderedCols,
  visibility,
  onToggleCol,
  sortCriteria,
  onToggleSortColumn,
  onToggleSortDirection,
  onRemoveSortCriterion,
  onResetSortCriteria,
  onExport,
  onRefresh,
  onNew,
  readOnly,
}) {
  const { t } = useTranslation()
  const hiddenColumnsCount = orderedCols.filter((col) => !visibility[col.key]).length

  return (
    <div className="flex shrink-0 flex-wrap items-center gap-3 border-b border-gray-200 px-4 pb-3 pt-4 dark:border-slate-700">
      {title && <h1 className="text-lg font-semibold text-gray-900 dark:text-white mr-2">{title}</h1>}

      <div className="flex items-center gap-1.5 min-w-0">
        <div className="flex items-center gap-1.5 flex-1 min-w-[180px] max-w-xs">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <input
              id="crud-table-search"
              name="search"
              type="text"
              value={searchInput}
              onChange={(e) => onChangeSearchInput(e.target.value)}
              onKeyDown={onSearchKeyDown}
              placeholder={t('common.search', 'Buscar...')}
              autoComplete="off"
              className="w-full rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 pl-8 pr-8 py-1.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {searchInput && (
              <button onClick={onClearSearch} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <button
            onClick={onApplySearch}
            className="shrink-0 rounded-md px-3 py-1.5 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
          >
            {t('common.searchBtn', 'Buscar')}
          </button>
        </div>

        {filterSlot && (
          <div className="shrink-0 w-52">
            {filterSlot}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <SortCriteriaControl
          columns={orderedCols}
          sortCriteria={sortCriteria}
          onToggleColumn={onToggleSortColumn}
          onToggleDirection={onToggleSortDirection}
          onRemoveCriterion={onRemoveSortCriterion}
          onResetDefault={onResetSortCriteria}
        />

        <div ref={colMenuRef} className="relative">
          <button
            onClick={onToggleColMenu}
            title={t('common.visibleColumns', 'Columnas visibles')}
            className="relative rounded-md p-1.5 text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <Settings2 className="h-4 w-4" />
            {hiddenColumnsCount > 0 && (
              <span className="absolute -right-2 -top-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white dark:border-slate-900 bg-red-600 px-1 text-[10px] font-bold leading-none text-white shadow-sm">
                {hiddenColumnsCount}
              </span>
            )}
          </button>
          {showColMenu && (
            <div className="absolute right-0 top-full mt-1 w-52 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xl z-dropdown py-1.5 max-h-80 overflow-y-auto">
              {orderedCols.map((col) => (
                <label
                  key={col.key}
                  htmlFor={`col-vis-${col.key}`}
                  className="flex items-center gap-2.5 px-3 py-1.5 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700 text-sm text-gray-700 dark:text-slate-200"
                >
                  <input
                    id={`col-vis-${col.key}`}
                    name={`col-vis-${col.key}`}
                    type="checkbox"
                    checked={!!visibility[col.key]}
                    onChange={() => onToggleCol(col.key)}
                    className="rounded border-gray-300"
                  />
                  {col.label}
                </label>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={onExport}
          title={t('common.exportXlsx', 'Exportar XLSX')}
          className="rounded-md p-1.5 text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
        >
          <Download className="h-4 w-4" />
        </button>

        <button
          onClick={onRefresh}
          title={t('common.refresh', 'Actualizar')}
          className="rounded-md p-1.5 text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
        </button>

        {!readOnly && onNew && (
          <button
            onClick={onNew}
            className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
          >
            <Plus className="h-4 w-4" />
            {t('common.new', 'Nuevo')}
          </button>
        )}
      </div>
    </div>
  )
}
