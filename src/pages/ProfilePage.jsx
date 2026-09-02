import { useTranslation } from 'react-i18next'
import { useAuth } from '@/hooks/useAuth'
import { usePushNotifications } from '@/hooks/usePushNotifications'
import DarkModeSwitch from '@/components/profile/DarkModeSwitch'
import LanguageSelector from '@/components/profile/LanguageSelector'
import NotificationsCard from '@/components/profile/NotificationsCard'
import UserDetailsCard from '@/components/profile/UserDetailsCard'

const ProfilePage = () => {
  const { t } = useTranslation()
  const { user, getTokenParsed } = useAuth()
  const {
    supported,
    enabled,
    permission,
    subscribed,
    loading,
    error,
    subscribe,
    unsubscribe,
  } = usePushNotifications()
  const tokenParsed = getTokenParsed()

  const fields = [
    { label: t('profile.fullName'),  value: tokenParsed?.name },
    { label: t('profile.firstName'), value: tokenParsed?.given_name },
    { label: t('profile.lastName'),  value: tokenParsed?.family_name },
    { label: t('profile.username'),  value: tokenParsed?.preferred_username },
    { label: t('profile.email'),     value: tokenParsed?.email },
    { label: t('profile.sub'),       value: tokenParsed?.sub },
    {
      label: t('profile.issuedAt'),
      value: tokenParsed?.iat
        ? new Date(tokenParsed.iat * 1000).toLocaleString()
        : null,
    },
    {
      label: t('profile.expiresAt'),
      value: tokenParsed?.exp
        ? new Date(tokenParsed.exp * 1000).toLocaleString()
        : null,
    },
  ]

  return (
    <div className="min-h-0 flex-1 overflow-y-auto bg-gray-50 p-4 dark:bg-slate-900 md:p-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-slate-100 md:text-3xl">{t('profile.title')}</h1>

        <DarkModeSwitch />

        <LanguageSelector />

        <NotificationsCard
          supported={supported}
          enabled={enabled}
          permission={permission}
          subscribed={subscribed}
          loading={loading}
          error={error}
          subscribe={subscribe}
          unsubscribe={unsubscribe}
        />

        <UserDetailsCard user={user} fields={fields} />
      </div>
    </div>
  )
}

export default ProfilePage
