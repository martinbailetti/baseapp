import { useState } from 'react'
import { X, Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export function DirectorModal({ initial, onSave, onClose }) {
  const { t } = useTranslation()
  const [form, setForm] = useState({
    first_name: initial?.first_name ?? '',
    last_name:  initial?.last_name  ?? '',
  })
  const [saving, setSaving] = useState(false)
  const [err,    setErr]    = useState(null)
  const isEdit = !!initial?.id

  function update(k, v) { setForm(f => ({ ...f, [k]: v })) }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setErr(null)
    try {
      await onSave(form, initial?.id)
    } catch (ex) {
      setErr(ex.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center bg-black/50">
      <div className="rounded-xl bg-white dark:bg-slate-800 p-6 shadow-2xl w-full max-w-sm mx-4">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {isEdit ? t('cinema.editDirector', 'Editar director') : t('cinema.newDirector', 'Nuevo director')}
          </h2>
          <button onClick={onClose} className="rounded p-1 text-gray-400 hover:text-gray-600"><X className="h-4 w-4" /></button>
        </div>

        {err && <p className="mb-3 text-sm text-red-600">{err}</p>}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label htmlFor="director-first-name" className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1">{t('cinema.formFirstName', 'Nombre *')}</label>
            <input
              id="director-first-name"
              name="first_name"
              required
              value={form.first_name}
              onChange={e => update('first_name', e.target.value)}
              className="w-full rounded-md border border-gray-300 dark:border-slate-600 px-3 py-2 text-sm bg-white dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="director-last-name" className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1">{t('cinema.formLastName', 'Apellido *')}</label>
            <input
              id="director-last-name"
              name="last_name"
              required
              value={form.last_name}
              onChange={e => update('last_name', e.target.value)}
              className="w-full rounded-md border border-gray-300 dark:border-slate-600 px-3 py-2 text-sm bg-white dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="rounded-md px-4 py-2 text-sm font-medium text-gray-700 dark:text-slate-300 border border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
              {t('common.cancel', 'Cancelar')}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 transition-colors"
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
