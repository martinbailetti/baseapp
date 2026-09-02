/**
 * CrudTable.jsx
 *
 * Tabla genérica reutilizable con las mismas capacidades que PlanningTable:
 * - Columnas configurables con visibilidad, drag-reorder, resize
 * - Paginación, ordenación por columna
 * - Búsqueda de texto
 * - Export XLSX
 * - Persistencia de preferencias (keycloakPrefs)
 * - Modal de creación/edición (via onNew / onEdit)
 * - Confirmación de eliminación
 * - Toast notifications
 *
 * Props:
 *   columns    {Array}   Array de { key, label, visible? }
 *   endpoint   {string}  Ruta API, ej. '/api/movies'
 *   storageKey {string}  Clave única para persistir prefs
 *   title      {string}  Título mostrado en la cabecera
 *   onNew      {fn}      () => void  — abre modal de creación
 *   onEdit     {fn}      (row) => void — abre modal de edición
 *   onDelete   {fn}      (row) => Promise<void> — elimina el registro
 *   renderActions {fn}    (row) => ReactNode — acciones custom por fila
 *   onRefresh  {fn|ref}  Se puede pasar una función setter de ref para exponer refresh
 *   readOnly   {bool}    Si true, oculta botones Nuevo/Editar/Eliminar
 *   renderCell {fn}      (key, value, row) => ReactNode — custom cell renderer
 */
import { useState, useEffect, useLayoutEffect, useCallback, useRef, useMemo } from 'react'
import * as XLSX from 'xlsx'
import { useTranslation } from 'react-i18next'
import { apiFetch } from '@/utils/apiFetch'
import * as keycloakPrefs from '@/utils/keycloakPrefs'
import { PER_PAGE_OPTIONS, DEFAULT_PER_PAGE } from '../config/crudTableConfigs'
import { PREFS_LOAD_FALLBACK_MS, TOAST_DISMISS_MS } from '@/config/defaults'
import { initVisibility, initColOrder, initSortCriteria, normalizeSortCriteria, appendSortCriteriaParams } from './CrudTable/helpers'
import {
  CrudTableHeader,
  CrudTableGrid,
  CrudTablePagination,
  DeleteModal,
  ToastContainer,
} from './CrudTable/index'

// ── Componente principal ──────────────────────────────────────────────────────

export default function CrudTable({
  columns: allColumnsProp,
  endpoint,
  storageKey,
  title = '',
  onNew,
  onEdit,
  onDelete,
  renderActions,
  readOnly = false,
  renderCell: renderCellProp,
  refreshRef,     // si se pasa un ref, se asigna la función refresh a él
  defaultSortCriteria = [],
  filterSlot = null,
}) {
  const { t } = useTranslation()

  // ── Prefs ──────────────────────────────────────────────────────────────────
  const prefs       = useRef({})
  const prefsApplied = useRef(false)
  const [prefsReady, setPrefsReady] = useState(false)

  const [visibility, setVisibility] = useState(() => initVisibility(allColumnsProp, {}))
  const [colOrder,   setColOrder]   = useState(() => allColumnsProp.map(c => c.key))
  const [colWidths,  setColWidths]  = useState({})
  const [perPage,    setPerPage]    = useState(DEFAULT_PER_PAGE)
  const defaultSortRef = useRef(defaultSortCriteria)
  defaultSortRef.current = defaultSortCriteria

  const [sortCriteria, setSortCriteria] = useState(() => initSortCriteria(allColumnsProp, {}, defaultSortCriteria))

  // ── Data ───────────────────────────────────────────────────────────────────
  const [rows,    setRows]    = useState([])
  const [total,   setTotal]   = useState(0)
  const [page,    setPage]    = useState(1)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  // ── UI state ───────────────────────────────────────────────────────────────
  const [search,      setSearch]      = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [filters,     setFilters]     = useState({})
  const [showColMenu, setShowColMenu] = useState(false)
  const [dragOver,    setDragOver]    = useState(null)
  const [deleteModal, setDeleteModal] = useState(null)
  const [toasts,      setToasts]      = useState([])
  const [tableScrollWidth, setTableScrollWidth] = useState(0)

  const dragKey      = useRef(null)
  const colMenuRef   = useRef(null)
  const topScrollRef = useRef(null)
  const tableWrapRef = useRef(null)
  const resizing     = useRef(null)

  // ── Derived ────────────────────────────────────────────────────────────────
  const columnKeys = useMemo(() => allColumnsProp.map((c) => c.key), [allColumnsProp])
  const sortBy = sortCriteria[0]?.key || columnKeys[0] || 'id'
  const sortDir = sortCriteria[0]?.dir || 'asc'
  const colMap      = Object.fromEntries(allColumnsProp.map(c => [c.key, c]))
  const orderedCols = colOrder.map(k => colMap[k]).filter(Boolean)
  const visibleCols = orderedCols.filter(c => visibility[c.key])
  const totalPages  = Math.max(1, Math.ceil(total / perPage))

  // ── Scroll sincronizado ────────────────────────────────────────────────────
  useLayoutEffect(() => {
    if (tableWrapRef.current) setTableScrollWidth(tableWrapRef.current.scrollWidth)
  }, [visibleCols, rows])

  useEffect(() => {
    const el = tableWrapRef.current
    if (!el) return
    const ro = new ResizeObserver(() => setTableScrollWidth(el.scrollWidth))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  function onTopScroll()   { if (tableWrapRef.current) tableWrapRef.current.scrollLeft = topScrollRef.current.scrollLeft }
  function onTableScroll() { if (topScrollRef.current) topScrollRef.current.scrollLeft = tableWrapRef.current.scrollLeft }

  // ── Cargar prefs desde Keycloak ────────────────────────────────────────────
  useEffect(() => {
    const fallback = setTimeout(() => setPrefsReady(true), PREFS_LOAD_FALLBACK_MS)
    const unsub = keycloakPrefs.subscribe(storageKey, (p) => {
      if (prefsApplied.current) return
      prefs.current = p
      setVisibility(initVisibility(allColumnsProp, p))
      setColOrder(initColOrder(allColumnsProp, p))
      setPerPage(p.perPage  || DEFAULT_PER_PAGE)
      setSortCriteria(initSortCriteria(allColumnsProp, p, defaultSortRef.current))
      if (p.colWidths) setColWidths(p.colWidths)
      if (p.search) {
        setSearch(p.search)
        setSearchInput(p.search)
      }
      if (p.filters) setFilters(p.filters)
      prefsApplied.current = true
      clearTimeout(fallback)
      setPrefsReady(true)
    })
    keycloakPrefs.ensureLoaded(storageKey)
    return () => { unsub(); clearTimeout(fallback) }
  }, [storageKey, allColumnsProp])

  // ── Persistir prefs ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!prefsReady) return
    keycloakPrefs.setPrefs(storageKey, {
      visibility,
      colOrder,
      colWidths,
      perPage,
      sortBy,
      sortDir,
      sortCriteria,
      search,
      filters,
    })
  }, [visibility, colOrder, colWidths, perPage, sortBy, sortDir, sortCriteria, search, filters, prefsReady, storageKey])

  // ── Fetch data ─────────────────────────────────────────────────────────────
  const fetchData = useCallback(async (opts = {}) => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        page,
        per_page: perPage,
      })
      appendSortCriteriaParams(params, sortCriteria, columnKeys)
      if (search) params.set('search', search)
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== '' && value != null) params.set(key, String(value))
      })
      // allow override
      if (opts.page !== undefined) params.set('page', opts.page)

      const res  = await apiFetch(`${endpoint}?${params}`)
      const json = await res.json()
      if (!res.ok || !json.success) throw new Error(json.message || 'Error cargando datos')
      const d = json.data
      setRows(Array.isArray(d) ? d : (d.items ?? []))
      setTotal(d.pagination?.total ?? (Array.isArray(d) ? d.length : 0))
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [endpoint, page, perPage, sortCriteria, columnKeys, search, filters])

  useEffect(() => {
    if (!prefsReady) return
    fetchData()
  }, [fetchData, prefsReady])

  // Exponer refresh al padre vía refreshRef
  useEffect(() => {
    if (refreshRef) refreshRef.current = fetchData
  }, [refreshRef, fetchData])

  // ── Toast ──────────────────────────────────────────────────────────────────
  function addToast(message, type = 'success') {
    const id = Date.now()
    setToasts(p => [...p, { id, message, type }])
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), TOAST_DISMISS_MS)
  }

  // ── Sort ───────────────────────────────────────────────────────────────────
  function handleSort(key) {
    setPage(1)
    setSortCriteria((prev) => {
      const current = normalizeSortCriteria(prev, columnKeys)
      const idx = current.findIndex((c) => c.key === key)
      if (idx === -1) return [...current, { key, dir: 'asc' }]
      const next = [...current]
      next[idx] = { ...next[idx], dir: next[idx].dir === 'asc' ? 'desc' : 'asc' }
      return next
    })
  }

  function removeSortCriterion(key) {
    setPage(1)
    setSortCriteria((prev) => prev.filter((c) => c.key !== key))
  }

  function resetSortCriteria() {
    setPage(1)
    setSortCriteria(initSortCriteria(allColumnsProp, {}, defaultSortRef.current))
  }

  // ── Drag-reorder columns ───────────────────────────────────────────────────
  function onDragStart(key) { dragKey.current = key }
  function onDragOver(e, key) { e.preventDefault(); setDragOver(key) }
  function onDrop(targetKey) {
    const src = dragKey.current
    if (!src || src === targetKey) { setDragOver(null); return }
    setColOrder(prev => {
      const next = [...prev]
      const from = next.indexOf(src)
      const to   = next.indexOf(targetKey)
      if (from === -1 || to === -1) return prev
      next.splice(from, 1)
      next.splice(to, 0, src)
      return next
    })
    setDragOver(null)
  }

  // ── Resize columns ─────────────────────────────────────────────────────────
  function onResizeStart(e, key) {
    e.preventDefault()
    const th = e.currentTarget.closest('th')
    resizing.current = { key, startX: e.clientX, startWidth: th ? th.offsetWidth : 100 }
    function onMove(ev) {
      if (!resizing.current) return
      const delta = ev.clientX - resizing.current.startX
      const newW  = Math.max(40, resizing.current.startWidth + delta)
      setColWidths(p => ({ ...p, [resizing.current.key]: newW }))
    }
    function onUp() {
      resizing.current = null
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  // ── Visibility toggle ──────────────────────────────────────────────────────
  function toggleCol(key) {
    setVisibility(v => ({ ...v, [key]: !v[key] }))
  }

  // Cerrar col menu con click fuera
  useEffect(() => {
    if (!showColMenu) return
    function handler(e) { if (colMenuRef.current && !colMenuRef.current.contains(e.target)) setShowColMenu(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showColMenu])

  // ── Export XLSX ────────────────────────────────────────────────────────────
  async function handleExport() {
    try {
      // Descarga todos los registros
      const params = new URLSearchParams({ per_page: 9999 })
      appendSortCriteriaParams(params, sortCriteria, columnKeys)
      if (search) params.set('search', search)
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== '' && value != null) params.set(key, String(value))
      })
      const res  = await apiFetch(`${endpoint}?${params}`)
      const json = await res.json()
      const allRows = json.data?.items ?? (Array.isArray(json.data) ? json.data : rows)

      const headers = visibleCols.map(c => c.label)
      const data    = allRows.map(row => visibleCols.map(c => {
        const v = row[c.key]
        return v === null || v === undefined ? '' : String(v)
      }))

      const ws = XLSX.utils.aoa_to_sheet([headers, ...data])
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, title || 'Export')
      XLSX.writeFile(wb, `${storageKey || 'export'}_${new Date().toISOString().slice(0, 10)}.xlsx`)
      addToast(t('common.exportSuccess', 'Exportado correctamente'))
    } catch {
      addToast(t('common.exportError', 'Error al exportar'), 'error')
    }
  }

  // ── Delete ─────────────────────────────────────────────────────────────────
  async function confirmDelete(row) {
    if (!onDelete) return
    try {
      await onDelete(row)
      addToast(t('common.deleteSuccess', 'Eliminado correctamente'))
      fetchData()
    } catch (e) {
      addToast(e.message || t('common.deleteError', 'Error al eliminar'), 'error')
    }
    setDeleteModal(null)
  }

  // ── Search ─────────────────────────────────────────────────────────────────
  function applySearch() {
    setSearch(searchInput)
    setPage(1)
  }

  function clearSearch() {
    setSearchInput('')
    setSearch('')
    setPage(1)
  }

  function setFilter(key, value) {
    setFilters(prev => ({ ...prev, [key]: value }))
    setPage(1)
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  const showActions = !readOnly && (renderActions || onEdit || onDelete)

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <CrudTableHeader
        title={title}
        searchInput={searchInput}
        onChangeSearchInput={setSearchInput}
        onSearchKeyDown={(e) => e.key === 'Enter' && applySearch()}
        onApplySearch={applySearch}
        onClearSearch={clearSearch}
        filterSlot={filterSlot ? filterSlot({ filters, setFilter }) : null}
        colMenuRef={colMenuRef}
        showColMenu={showColMenu}
        onToggleColMenu={() => setShowColMenu((v) => !v)}
        orderedCols={orderedCols}
        visibility={visibility}
        onToggleCol={toggleCol}
        sortCriteria={sortCriteria}
        onToggleSortColumn={handleSort}
        onToggleSortDirection={handleSort}
        onRemoveSortCriterion={removeSortCriterion}
        onResetSortCriteria={resetSortCriteria}
        onExport={handleExport}
        onRefresh={fetchData}
        onNew={onNew}
        readOnly={readOnly}
      />

      {/* Scroll espejo superior */}
      <div
        ref={topScrollRef}
        onScroll={onTopScroll}
        className="h-3 shrink-0 overflow-x-auto overflow-y-hidden border-b border-gray-100 dark:border-slate-800"
      >
        <div style={{ width: tableScrollWidth }} className="h-1" />
      </div>

      {/* Tabla */}
      <div
        ref={tableWrapRef}
        onScroll={onTableScroll}
        className="min-h-0 flex-1 overflow-auto"
      >
        <CrudTableGrid
          error={error}
          visibleCols={visibleCols}
          colWidths={colWidths}
          sortCriteria={sortCriteria}
          dragOver={dragOver}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDrop={onDrop}
          onDragEnd={() => setDragOver(null)}
          onHandleSort={handleSort}
          onResizeStart={onResizeStart}
          showActions={showActions}
          loading={loading}
          rows={rows}
          renderCell={renderCellProp}
          renderActions={renderActions}
          onEdit={onEdit}
          onDelete={(row) => setDeleteModal(row)}
        />
      </div>

      <CrudTablePagination
        total={total}
        page={page}
        totalPages={totalPages}
        onFirstPage={() => setPage(1)}
        onPrevPage={() => setPage((p) => p - 1)}
        onNextPage={() => setPage((p) => p + 1)}
        onLastPage={() => setPage(totalPages)}
        perPage={perPage}
        onPerPageChange={(n) => {
          setPerPage(n)
          setPage(1)
        }}
        perPageOptions={PER_PAGE_OPTIONS}
      />

      {/* Modal eliminar */}
      {deleteModal && (
        <DeleteModal
          onConfirm={() => confirmDelete(deleteModal)}
          onCancel={() => setDeleteModal(null)}
        />
      )}

      {/* Toasts */}
      <ToastContainer toasts={toasts} />
    </div>
  )
}
