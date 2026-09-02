import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/utils/cn'
import NavbarLink from './NavbarLink'
import { getVisibleSubitems } from './navVisibility'

const MobileAccordion = ({ label, Icon: LabelIcon, subitems, pathname, hasRole, onNavigate }) => {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const visibleItems = getVisibleSubitems(subitems, hasRole)

  if (!visibleItems.length) return null

  const isActive = visibleItems.some(({ to }) => pathname === to)

  return (
    <div>
      <button
        onClick={() => setOpen((value) => !value)}
        className={cn(
          'flex w-full items-center justify-between rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
          isActive
            ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300'
            : 'text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800'
        )}
      >
        <span className="flex items-center gap-2">
          <LabelIcon className="h-4 w-4" />
          {label}
        </span>
        <ChevronDown className={cn('h-4 w-4 transition-transform text-gray-400', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="ml-6 mt-0.5 flex flex-col gap-0.5">
          {visibleItems.map(({ to, labelKey, Icon }) => (
            <NavbarLink
              key={to}
              to={to}
              onClick={onNavigate}
              active={pathname === to}
              Icon={Icon}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors"
              activeClassName="bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-medium"
              inactiveClassName="text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800"
            >
              {t(labelKey)}
            </NavbarLink>
          ))}
        </div>
      )}
    </div>
  )
}

export default MobileAccordion