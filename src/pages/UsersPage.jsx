import { useState, useEffect, useCallback } from 'react'
import { Users, Mail, CheckCircle2, XCircle, Shield, Plus, Pencil, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { apiJson, apiFetch } from '@/utils/apiFetch'
import { cn } from '@/utils/cn'
import Spinner from '@/components/ui/Spinner'
import PageContainer from '@/components/ui/PageContainer'
import PageHeader from '@/components/ui/PageHeader'
import { UserModal } from '@/components/Users/UserModal'

const UsersPage = () => {
  const { t } = useTranslation()
  const [users, setUsers]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)
  const [modal, setModal]       = useState(null)   // null | { editing: row|null }
  const [deleting, setDeleting] = useState(null)   // user to confirm delete
  const [deleteErr, setDeleteErr] = useState(null)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res  = await apiFetch('/api/users')
      const data = await res.json()
      if (data.success && Array.isArray(data.data)) {
        setUsers(data.data)
      } else {
        setError('Respuesta inválida del servidor')
      }
    } catch (err) {
      setError(err.message || 'Error al cargar usuarios')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  async function handleSave(form, id) {
    await apiJson(id ? `/api/users/${id}` : '/api/users', {
      method: id ? 'PUT' : 'POST',
      body: JSON.stringify(form),
    })
    setModal(null)
    load()
  }

  async function confirmDelete() {
    if (!deleting) return
    setDeleteErr(null)
    try {
      await apiJson(`/api/users/${deleting.id}`, { method: 'DELETE' })
      setDeleting(null)
      load()
    } catch (ex) {
      setDeleteErr(ex.message)
    }
  }

  const formatDate = (ts) => {
    if (!ts) return '—'
    return new Date(ts).toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' })
  }

  return (
    <>
    <div className="min-h-0 flex-1 overflow-y-auto">
    <PageContainer>
      <PageHeader
        title={t('users.title', 'Usuarios con Roles')}
        subtitle={t('users.subtitle', 'Usuarios de la aplicación con roles asignados')}
        Icon={Users}
        actions={
          <button
            onClick={() => setModal({ editing: null })}
            className="flex items-center gap-1.5 rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
            {t('users.new', 'Nuevo usuario')}
          </button>
        }
      />


        {loading && (
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
          </div>
        )}

        {error && !loading && (
          <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 p-4">
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                <thead className="bg-gray-50 dark:bg-slate-900/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-slate-300">
                      {t('users.colEmail', 'Email')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-slate-300">
                      {t('users.colName', 'Nombre')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-slate-300">
                      {t('users.colRoles', 'Roles')}
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-slate-300">
                      {t('users.colStatus', 'Estado')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-slate-300">
                      {t('users.colCreated', 'Creado')}
                    </th>
                    <th className="px-4 py-3 w-20" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-slate-700 bg-white dark:bg-slate-800">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500 dark:text-slate-400">
                        {t('users.empty', 'No hay usuarios')}
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 shrink-0 text-gray-400 dark:text-slate-500" />
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-slate-100">{user.email || '—'}</p>
                              <p className="text-xs text-gray-500 dark:text-slate-400">{user.username}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-slate-300">
                          {[user.firstName, user.lastName].filter(Boolean).join(' ') || '—'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1.5">
                            {user.roles && user.roles.length > 0 ? (
                              user.roles.map((role) => (
                                <span
                                  key={role}
                                  className="inline-flex items-center gap-1 rounded-full bg-indigo-100 dark:bg-indigo-900/40 px-2.5 py-0.5 text-xs font-medium text-indigo-700 dark:text-indigo-300"
                                >
                                  <Shield className="h-3 w-3" />
                                  {role}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-gray-400 dark:text-slate-500">—</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-3">
                            <div
                              className={cn(
                                'flex items-center gap-1 text-xs font-medium',
                                user.enabled ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                              )}
                              title={user.enabled ? t('users.enabled', 'Habilitado') : t('users.disabled', 'Deshabilitado')}
                            >
                              {user.enabled
                                ? <CheckCircle2 className="h-4 w-4" />
                                : <XCircle className="h-4 w-4" />}
                            </div>
                            {user.emailVerified ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-green-100 dark:bg-green-900/30 px-2 py-0.5 text-xs font-medium text-green-700 dark:text-green-400">
                                <Mail className="h-3 w-3" />
                                {t('users.verified', 'Verificado')}
                              </span>
                            ) : (
                              <span className="text-xs text-gray-400 dark:text-slate-500">
                                {t('users.notVerified', 'No verificado')}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500 dark:text-slate-400 tabular-nums">
                          {formatDate(user.createdTimestamp)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setModal({ editing: user })}
                              title={t('common.edit', 'Editar')}
                              className="rounded p-1.5 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-slate-700"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => { setDeleteErr(null); setDeleting(user) }}
                              title={t('common.delete', 'Eliminar')}
                              className="rounded p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-slate-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {users.length > 0 && (
              <div className="border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50 px-4 py-3">
                <p className="text-sm text-gray-600 dark:text-slate-400">
                  {t('users.total', 'Total')}: <span className="font-semibold">{users.length}</span>
                </p>
              </div>
            )}
          </div>
        )}
    </PageContainer>
    </div>

    {/* Modal crear / editar */}
    {modal && (
      <UserModal
        initial={modal.editing}
        onSave={handleSave}
        onClose={() => setModal(null)}
      />
    )}

    {/* Modal confirmar borrado */}
    {deleting && (
      <div className="fixed inset-0 z-modal flex items-center justify-center bg-black/50 p-4">
        <div className="rounded-xl bg-white dark:bg-slate-800 p-6 shadow-2xl w-full max-w-sm">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-2">
            {t('users.deleteTitle', 'Eliminar usuario')}
          </h2>
          <p className="text-sm text-gray-600 dark:text-slate-300 mb-1">
            {t('users.deleteConfirm', '¿Seguro que quieres eliminar')} <strong>{deleting.email}</strong>?
          </p>
          <p className="text-xs text-gray-400 dark:text-slate-500 mb-4">
            {t('users.deleteWarning', 'Esta acción no se puede deshacer.')}
          </p>
          {deleteErr && <p className="mb-3 text-sm text-red-600">{deleteErr}</p>}
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setDeleting(null)}
              className="rounded-md border border-gray-300 dark:border-slate-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700"
            >
              {t('common.cancel', 'Cancelar')}
            </button>
            <button
              onClick={confirmDelete}
              className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              {t('common.delete', 'Eliminar')}
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  )
}

export default UsersPage
