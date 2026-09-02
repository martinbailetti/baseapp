import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AlertCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { apiJson } from '@/utils/apiFetch'
import { useCrudResource } from '@/hooks/useCrudResource'
import Spinner from '@/components/ui/Spinner'
import { MovieForm } from '@/components/Movies'

export default function MovieFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const isEdit = !!id
  const [movie, setMovie] = useState(null)
  const [loading, setLoading] = useState(isEdit)
  const [loadError, setLoadError] = useState(null)
  const { save } = useCrudResource('/api/movies')

  useEffect(() => {
    if (!isEdit) return

    let cancelled = false

    async function loadMovie() {
      setLoading(true)
      setLoadError(null)
      try {
        const data = await apiJson(`/api/movies/${id}`)
        if (!cancelled) setMovie(data)
      } catch (ex) {
        if (!cancelled) setLoadError(ex.message || t('cinema.loadMovieError', 'Error al cargar la película'))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadMovie()
    return () => { cancelled = true }
  }, [id, isEdit, t])

  async function handleSave(form) {
    const saved = await save(form, id)
    if (isEdit) return
    navigate(`/peliculas/${saved.id}/editar`, { replace: true })
  }

  function handleCancel() {
    navigate('/peliculas')
  }

  if (loading) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center p-8">
        <div className="max-w-md text-center">
          <AlertCircle className="mx-auto mb-3 h-10 w-10 text-red-500" />
          <p className="mb-4 text-sm text-gray-600 dark:text-slate-400">{loadError}</p>
          <button
            type="button"
            onClick={handleCancel}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            {t('cinema.backToMovies', 'Volver a películas')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <MovieForm
      initial={isEdit ? movie : null}
      onSave={handleSave}
      onCancel={handleCancel}
    />
  )
}
