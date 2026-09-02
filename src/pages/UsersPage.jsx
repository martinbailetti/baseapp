import { useState, useEffect } from 'react'
import { Users, Mail, CheckCircle2, XCircle, Shield } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { apiFetch } from '@/utils/apiFetch'
import { cn } from '@/utils/cn'
import Spinner from '@/components/ui/Spinner'
import PageContainer from '@/components/ui/PageContainer'
import PageHeader from '@/components/ui/PageHeader'

const UsersPage = () => {
  const { t } = useTranslation()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await apiFetch('/api/keycloak-users')
        const data = await res.json()
        if (data.success && Array.isArray(data.data)) {
          setUsers(data.data)
        } else {
          setError('Respuesta inválida del servidor')
        }
      } catch (err) {
        console.error('Error fetching users:', err)
        setError(err.message || 'Error al cargar usuarios')
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  const formatDate = (timestamp) => {
    if (!timestamp) return '—'
    const d = new Date(timestamp)
    return d.toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' })
  }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
    <PageContainer>
      <PageHeader
        title={t('users.title', 'Usuarios con Roles')}
        subtitle={t('users.subtitle', 'Usuarios de Keycloak con roles del cliente basekit')}
        Icon={Users}
      />

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 p-4">
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Table */}
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
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-slate-700 bg-white dark:bg-slate-800">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500 dark:text-slate-400">
                        {t('users.empty', 'No hay usuarios con roles asignados')}
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-gray-400 dark:text-slate-500" />
                            <span className="text-sm font-medium text-gray-900 dark:text-slate-100">
                              {user.email || '—'}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-slate-300">
                          {[user.firstName, user.lastName].filter(Boolean).join(' ') || user.username || '—'}
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
                              {user.enabled ? (
                                <CheckCircle2 className="h-4 w-4" />
                              ) : (
                                <XCircle className="h-4 w-4" />
                              )}
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
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer con contador */}
            {users.length > 0 && (
              <div className="border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50 px-4 py-3">
                <p className="text-sm text-gray-600 dark:text-slate-400">
                  {t('users.total', 'Total de usuarios')}: <span className="font-semibold">{users.length}</span>
                </p>
              </div>
            )}
          </div>
        )}
    </PageContainer>
    </div>
  )
}

export default UsersPage
