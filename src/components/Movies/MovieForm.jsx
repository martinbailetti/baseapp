import { useState } from 'react'
import { Film, Clapperboard, Users, ArrowLeft, Check, Calendar, UserCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { DirectorSelect } from './DirectorSelect'
import { ActorsCast } from './ActorsCast'

const inputClass =
  'w-full rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700/80 px-4 py-2.5 text-sm text-gray-900 dark:text-white shadow-sm transition-colors placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20'

const labelClass = 'mb-1.5 block text-sm font-medium text-gray-700 dark:text-slate-300'

function FormField({ id, label, icon: Icon, children }) {
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        <span className="flex items-center gap-1.5">
          {Icon && <Icon className="h-3.5 w-3.5 text-indigo-500" />}
          {label}
        </span>
      </label>
      {children}
    </div>
  )
}

function SectionCard({ icon: Icon, title, description, children, action }) {
  return (
    <section className="overflow-hidden rounded-xl border border-gray-200/80 bg-white p-4 shadow-sm dark:border-slate-700/80 dark:bg-slate-800/90">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
            <Icon className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h2>
            {description && (
              <p className="text-xs text-gray-500 dark:text-slate-400">{description}</p>
            )}
          </div>
        </div>
        {action}
      </div>
      <div className="min-w-0">{children}</div>
    </section>
  )
}

export function MovieForm({ initial, onSave, onCancel }) {
  const { t } = useTranslation()
  const currentYear = new Date().getFullYear()
  const [form, setForm] = useState({
    spanish_title: initial?.spanish_title ?? '',
    original_title: initial?.original_title ?? '',
    release_year: initial?.release_year ?? currentYear,
    director_id: initial?.director_id ?? '',
  })
  const [cast, setCast] = useState(
    initial?.actors?.map(a => ({
      actor_id: String(a.id),
      character_name: a.character_name ?? '',
    })) ?? []
  )
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState(null)
  const isEdit = !!initial?.id

  function update(k, v) {
    setForm(f => ({ ...f, [k]: v }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setErr(null)
    try {
      const payload = {
        ...form,
        release_year: parseInt(form.release_year, 10),
        director_id: parseInt(form.director_id, 10),
        actors: cast
          .filter(r => r.actor_id !== '')
          .map(r => ({
            actor_id: parseInt(r.actor_id, 10),
            character_name: r.character_name || null,
          })),
      }
      await onSave(payload, initial?.id)
    } catch (ex) {
      setErr(ex.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto bg-gray-50 dark:bg-slate-900">
      <div className="mx-auto max-w-4xl px-4 py-3 md:px-6">
        <div className="mb-4 flex items-center gap-3 border-b border-gray-200 pb-3 dark:border-slate-700">
          <button
            type="button"
            onClick={onCancel}
            aria-label={t('cinema.backToMovies', 'Volver a películas')}
            className="inline-flex shrink-0 items-center gap-1 text-sm text-gray-500 transition-colors hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">{t('cinema.backToMovies', 'Volver a películas')}</span>
          </button>
          <div className="h-5 w-px shrink-0 bg-gray-200 dark:bg-slate-600" />
          <div className="flex min-w-0 items-center gap-2">
            <Film className="h-5 w-5 shrink-0 text-indigo-500" />
            <div className="min-w-0">
              <h1 className="truncate text-lg font-semibold text-gray-900 dark:text-white">
                {isEdit
                  ? t('cinema.editMovie', 'Editar película')
                  : t('cinema.newMovie', 'Nueva película')}
              </h1>
            </div>
          </div>
        </div>

        {err && (
          <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800/60 dark:bg-red-950/40 dark:text-red-300">
            {err}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <SectionCard
            icon={Clapperboard}
            title={t('cinema.sectionBasicInfo', 'Información básica')}
            description={t('cinema.sectionBasicInfoDesc', 'Títulos, año de estreno y director')}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                id="movie-spanish-title"
                label={t('cinema.formSpanishTitle', 'Título en español *')}
              >
                <input
                  id="movie-spanish-title"
                  name="spanish_title"
                  required
                  value={form.spanish_title}
                  onChange={e => update('spanish_title', e.target.value)}
                  placeholder={t('cinema.placeholderSpanishTitle', 'Ej. El laberinto del fauno')}
                  className={inputClass}
                />
              </FormField>

              <FormField
                id="movie-original-title"
                label={t('cinema.formOriginalTitle', 'Título original *')}
              >
                <input
                  id="movie-original-title"
                  name="original_title"
                  required
                  value={form.original_title}
                  onChange={e => update('original_title', e.target.value)}
                  placeholder={t('cinema.placeholderOriginalTitle', 'Ej. Pan\'s Labyrinth')}
                  className={inputClass}
                />
              </FormField>

              <FormField
                id="movie-release-year"
                label={t('cinema.formReleaseYear', 'Año estreno *')}
                icon={Calendar}
              >
                <input
                  id="movie-release-year"
                  name="release_year"
                  type="number"
                  required
                  min="1888"
                  max="2100"
                  value={form.release_year}
                  onChange={e => update('release_year', e.target.value)}
                  className={inputClass}
                />
              </FormField>

              <FormField
                id="movie-director"
                label={t('cinema.formDirector', 'Director *')}
                icon={UserCircle}
              >
                <DirectorSelect
                  id="movie-director"
                  value={form.director_id}
                  onChange={v => update('director_id', v)}
                  size="lg"
                />
              </FormField>
            </div>
          </SectionCard>

          <SectionCard
            icon={Users}
            title={t('cinema.formCast', 'Reparto')}
            description={t('cinema.sectionCastDesc', 'Actores y personajes de la película')}
          >
            <ActorsCast cast={cast} onChange={setCast} size="lg" />
          </SectionCard>

          <div className="sticky bottom-0 flex items-center justify-end gap-2 rounded-xl border border-gray-200/80 bg-white/90 px-4 py-3 shadow-md backdrop-blur-sm dark:border-slate-700/80 dark:bg-slate-800/90">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              {t('common.cancel', 'Cancelar')}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:opacity-50"
            >
              <Check className="h-4 w-4" />
              {saving ? t('common.saving', 'Guardando...') : t('common.save', 'Guardar')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
