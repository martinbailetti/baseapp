import { User } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'

/**
 * @param {{
 *   user: {
 *     name?: string,
 *     preferred_username?: string,
 *     email?: string,
 *     email_verified?: boolean
 *   },
 *   fields: Array<{label: string, value: string|null|undefined}>
 * }} props
 */
const UserDetailsCard = ({ user, fields }) => {
  const { t } = useTranslation()

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
            <User className="h-6 w-6" />
          </div>
          <div>
            <p className="font-semibold text-gray-800">
              {user?.name || user?.preferred_username}
            </p>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
        </div>
      </CardHeader>
      <CardBody>
        <dl className="divide-y divide-gray-100">
          {fields.map(
            ({ label, value }) =>
              value && (
                <div
                  key={label}
                  className="flex flex-col gap-0.5 py-3 sm:flex-row sm:gap-4"
                >
                  <dt className="w-40 shrink-0 text-sm font-medium text-gray-500">
                    {label}
                  </dt>
                  <dd className="text-sm text-gray-800 break-all">{value}</dd>
                </div>
              )
          )}
          <div className="flex flex-col gap-0.5 py-3 sm:flex-row sm:gap-4">
            <dt className="w-40 shrink-0 text-sm font-medium text-gray-500">
              {t('profile.emailVerified')}
            </dt>
            <dd>
              <Badge variant={user?.email_verified ? 'success' : 'warning'}>
                {user?.email_verified ? t('profile.verified') : t('profile.notVerified')}
              </Badge>
            </dd>
          </div>
        </dl>
      </CardBody>
    </Card>
  )
}

export default UserDetailsCard