import { useState, useRef, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart, FileDown } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import CrudTable from '@/components/CrudTable'
import { ToastContainer } from '@/components/CrudTable/ToastContainer'
import { apiJson } from '@/utils/apiFetch'
import { useCrudResource } from '@/hooks/useCrudResource'
import { useToasts } from '@/hooks/useToasts'
import { STORAGE_KEYS } from '@/config/storageKeys'
import { DEFAULT_MOVIES_SORT } from '@/config/crudTableConfigs'
import { MoviePdfSheet, DirectorFilterSelect } from '@/components/Movies'
import { generateMoviePdf, moviePdfFilename } from '@/utils/generateMoviePdf'

export default function MoviesPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [favoriteBusyId, setFavoriteBusyId] = useState(null)
  const [pdfBusyId, setPdfBusyId] = useState(null)
  const [pdfMovie, setPdfMovie] = useState(null)
  const pdfRef = useRef(null)
  const refreshRef = useRef(null)
  const { remove } = useCrudResource('/api/movies')
  const { toasts, addToast } = useToasts()

  const columns = useMemo(() => [
    { key: 'id',            label: t('cinema.colId', 'ID'),            visible: false },
    { key: 'spanish_title', label: t('cinema.colSpanishTitle', 'Título (ES)')    },
    { key: 'original_title',label: t('cinema.colOriginalTitle', 'Título original') },
    { key: 'director_name', label: t('cinema.colDirector', 'Director')           },
    { key: 'release_year',  label: t('cinema.colReleaseYear', 'Año')              },
    { key: 'created_at',    label: t('cinema.colCreatedAt', 'Creado')         },
    { key: 'updated_at',    label: t('cinema.colUpdatedAt', 'Actualizado')   },
  ], [t])

  useEffect(() => {
    if (!pdfMovie) return

    let cancelled = false

    async function exportPdf() {
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))
      if (cancelled || !pdfRef.current) return

      try {
        const filename = moviePdfFilename(pdfMovie.spanish_title || pdfMovie.original_title)
        await generateMoviePdf(pdfRef.current, filename)
        addToast(t('cinema.pdfSuccess', 'PDF generado correctamente'))
      } catch (ex) {
        addToast(ex.message || t('cinema.pdfError', 'Error al generar PDF'), 'error')
      } finally {
        if (!cancelled) {
          setPdfMovie(null)
          setPdfBusyId(null)
        }
      }
    }

    exportPdf()
    return () => { cancelled = true }
  }, [pdfMovie, addToast, t])

  function openEdit(row) {
    navigate(`/peliculas/${row.id}/editar`)
  }

  async function handleDelete(row) {
    await remove(row)
  }

  async function handleToggleFavorite(row) {
    if (favoriteBusyId === row.id) return

    setFavoriteBusyId(row.id)
    try {
      const isFavorite = !!row.is_favorite
      await apiJson(`/api/movies/${row.id}/favorite`, {
        method: isFavorite ? 'DELETE' : 'POST',
      })
      refreshRef.current?.()
    } catch (ex) {
      addToast(ex.message || t('common.saveError', 'Error al guardar'), 'error')
    } finally {
      setFavoriteBusyId(null)
    }
  }

  async function handleDownloadPdf(row) {
    if (pdfBusyId === row.id) return

    setPdfBusyId(row.id)
    try {
      const data = await apiJson(`/api/movies/${row.id}`)
      setPdfMovie(data)
    } catch (ex) {
      addToast(ex.message || t('cinema.pdfError', 'Error al generar PDF'), 'error')
      setPdfBusyId(null)
    }
  }

  function renderCell(key, value) {
    if (key === 'director_name') {
      const name = value == null ? '' : String(value).trim()
      if (!name) return <span className="text-gray-300">—</span>
      return <span>{name}</span>
    }
    if (key === 'created_at' || key === 'updated_at') {
      if (!value) return <span className="text-gray-300">—</span>
      return <span className="tabular-nums">{String(value).replace('T', ' ').substring(0, 19)}</span>
    }
    if (value === null || value === undefined || value === '') return <span className="text-gray-300">—</span>
    return <span>{String(value)}</span>
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <CrudTable
        columns={columns}
        endpoint="/api/movies"
        storageKey={STORAGE_KEYS.MOVIES}
        title={t('cinema.movies', 'Películas')}
        onNew={() => navigate('/peliculas/nueva')}
        onEdit={openEdit}
        onDelete={handleDelete}
        renderActions={(row) => {
          const isFavorite = !!row.is_favorite
          const isFavoriteBusy = favoriteBusyId === row.id
          const isPdfBusy = pdfBusyId === row.id

          return (
            <>
              <button
                onClick={() => handleDownloadPdf(row)}
                disabled={isPdfBusy}
                className="rounded p-1 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors disabled:opacity-50"
                title={t('cinema.downloadPdf', 'Descargar PDF')}
              >
                <FileDown className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => handleToggleFavorite(row)}
                disabled={isFavoriteBusy}
                className="rounded p-1 text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors disabled:opacity-50"
                title={isFavorite
                  ? t('common.removeFavorite', 'Quitar de favoritos')
                  : t('common.addFavorite', 'Añadir a favoritos')}
              >
                <Heart className={`h-3.5 w-3.5 ${isFavorite ? 'text-rose-500 fill-rose-500' : ''}`} />
              </button>
            </>
          )
        }}
        refreshRef={refreshRef}
        defaultSortCriteria={DEFAULT_MOVIES_SORT}
        renderCell={renderCell}
        filterSlot={({ filters, setFilter }) => (
          <DirectorFilterSelect
            value={filters.director_id || ''}
            onChange={(value) => setFilter('director_id', value)}
          />
        )}
      />

      {pdfMovie && (
        <div className="fixed left-[-9999px] top-0" aria-hidden="true">
          <MoviePdfSheet ref={pdfRef} movie={pdfMovie} />
        </div>
      )}

      <ToastContainer toasts={toasts} />
    </div>
  )
}
