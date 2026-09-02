import { Link } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const MobileAccountSection = ({ user, onLogout, onNavigate }) => {
  const { t } = useTranslation()

  return (
    <div className="mt-2 border-t border-gray-100 pt-2 dark:border-slate-700">
      <Link
        to="/profile"
        onClick={onNavigate}
        className="block px-3 py-1.5 text-sm text-gray-500 dark:text-slate-400"
      >
        {user?.name || user?.preferred_username}
      </Link>
      <button
        onClick={() => { onNavigate(); onLogout() }}
        className="flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
      >
        <LogOut className="h-4 w-4" />
        {t('nav.logout')}
      </button>
    </div>
  )
}

export default MobileAccountSection