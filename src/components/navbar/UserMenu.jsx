import { Link } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronDown, LogOut, User } from 'lucide-react'
import { cn } from '@/utils/cn'

const UserMenu = ({ user, onLogout }) => {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const userMenuRef = useRef(null)

  useEffect(() => {
    function handler(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) setOpen(false)
    }

    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={userMenuRef} className="relative hidden sm:block">
      <button
        onClick={() => setOpen((value) => !value)}
        className={cn(
          'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
          open
            ? 'bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white'
            : 'text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white'
        )}
      >
        <User className="h-4 w-4" />
        {user?.name || user?.preferred_username}
        <ChevronDown className={cn('h-3 w-3 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-44 rounded-md border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg z-dropdown">
          <Link
            to="/profile"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 rounded-t-md px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-100 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            <User className="h-4 w-4" />
            {t('nav.myAccount')}
          </Link>
          <button
            onClick={() => { setOpen(false); onLogout() }}
            className="flex w-full items-center gap-2 rounded-b-md px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
          >
            <LogOut className="h-4 w-4" />
            {t('nav.logout')}
          </button>
        </div>
      )}
    </div>
  )
}

export default UserMenu