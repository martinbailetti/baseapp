import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { apiFetch } from '@/utils/apiFetch'

const FIELD = 'w-full rounded-md border border-gray-300 dark:border-slate-600 px-3 py-2 text-sm bg-white dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500'
const LABEL = 'block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1'

export function UserModal({ initial, onSave, onClose }) {
  const { t } = useTranslation()
  const isEdit = !!initial?.id

  const [form, setForm] = useState({
    username:      initial?.username      ?? '',
    email:         initial?.email         ?? '',
    firstName:     initial?.firstName     ?? '',
    lastName:      initial?.lastName      ?? '',
    password:      '',
    enabled:       initial?.enabled       ?? true,
    emailVerified: initial?.emailVerified ?? false,
    roles:         initial?.roles         ?? [],
  })
  const [availableRoles, setAvailableRoles] = useState([])
  const [saving, setSaving] = useState(false)
  const [err, setErr]       = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})

  useEffect(() => {
    apiFetch('/api/users/roles')
      .then(r => r.json())
      .then(json => { if (json.success) setAvailableRoles(json.data) })
      .catch(() => {})
  }, [])

  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }

  function toggleRole(name) {
    setForm(f => ({
      ...f,
      roles: f.roles.includes(name) ? f.roles.filter(r => r !== name) : [...f.roles, name],
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setErr(null)
    setFieldErrors({})
    try {
      await onSave(form, initial?.id)
    } catch (ex) {
      if (ex.errors && typeof ex.errors === 'object') {
        setFieldErrors(ex.errors)
      } else {
        setErr(ex.message)
      }
    } finally {
      setSaving(false)
    }
  }

  function fe(k) {
    const msgs = fieldErrors[k]
    return msgs ? <p className="mt-0.5 text-xs text-red-600">{msgs[0]}</p> : null
  }

  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center bg-black/50 p-4">
      <div className="rounded-xl bg-white dark:bg-slate-800 p-6 shadow-2xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {isEdit ? t('users.editTitle', 'Editar usuario') : t('users.newTitle', 'Nuevo usuario')}
          </h2>
          <button onClick={onClose} className="rounded p-1 text-gray-400 hover:text-gray-600 dark:hover:text-slate-200">
            <X className="h-4 w-4" />
          </button>
        </div>

        {err && <p className="mb-3 text-sm text-red-600 dark:text-red-400">{err}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LABEL}>{t('users.formUsername', 'Usuario *')}</label>
              <input
                required
                autoComplete="off"
                value={form.username}
                onChange={e => set('username', e.target.value)}
                className={FIELD}
              />
              {fe('username')}
            </div>
            <div>
              <label className={LABEL}>{t('users.formEmail', 'Email *')}</label>
              <input
                type="email"
                required
                autoComplete="off"
                value={form.email}
                onChange={e => set('email', e.target.value)}
                className={FIELD}
              />
              {fe('email')}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LABEL}>{t('users.formFirstName', 'Nombre')}</label>
              <input
                value={form.firstName}
                onChange={e => set('firstName', e.target.value)}
                className={FIELD}
              />
            </div>
            <div>
              <label className={LABEL}>{t('users.formLastName', 'Apellido')}</label>
              <input
                value={form.lastName}
                onChange={e => set('lastName', e.target.value)}
                className={FIELD}
              />
            </div>
          </div>

          <div>
            <label className={LABEL}>
              {isEdit
                ? t('users.formPasswordOptional', 'Contraseña (dejar vacío para no cambiar)')
                : t('users.formPassword', 'Contraseña *')}
            </label>
            <input
              type="password"
              required={!isEdit}
              autoComplete="new-password"
              value={form.password}
              onChange={e => set('password', e.target.value)}
              placeholder={isEdit ? '••••••' : ''}
              className={FIELD}
            />
            {fe('password')}
          </div>

          {availableRoles.length > 0 && (
            <div>
              <p className={LABEL}>{t('users.formRoles', 'Roles')}</p>
              <div className="flex flex-wrap gap-3">
                {availableRoles.map(role => (
                  <label key={role.name} className="flex items-center gap-1.5 cursor-pointer select-none text-sm text-gray-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={form.roles.includes(role.name)}
                      onChange={() => toggleRole(role.name)}
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    {role.name}
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer select-none text-sm text-gray-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={form.enabled}
                onChange={e => set('enabled', e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              {t('users.formEnabled', 'Habilitado')}
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none text-sm text-gray-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={form.emailVerified}
                onChange={e => set('emailVerified', e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              {t('users.formEmailVerified', 'Email verificado')}
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-gray-300 dark:border-slate-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700"
            >
              {t('common.cancel', 'Cancelar')}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {saving ? t('common.saving', 'Guardando...') : (isEdit ? t('common.save', 'Guardar') : t('common.create', 'Crear'))}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
