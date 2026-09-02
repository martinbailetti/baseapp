import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/utils/cn'
import NavbarLink from './NavbarLink'
import { getVisibleSubitems } from './navVisibility'

const NavDropdown = ({ label, Icon: LabelIcon, subitems, pathname, hasRole }) => {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const visibleItems = getVisibleSubitems(subitems, hasRole)
  const isActive = visibleItems.some(({ to }) => pathname === to)

  useEffect(() => {
    const handler = (event) => {
      if (ref.current && !ref.current.contains(event.target)) setOpen(false)
    }

    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((value) => !value)}
        className={cn(
          'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
          isActive
            ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300'
            : 'text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white'
        )}
      >
        <LabelIcon className="h-4 w-4" />
        {label}
        <ChevronDown className={cn('h-3 w-3 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1 w-48 rounded-md border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg z-dropdown">
          {visibleItems.map(({ to, labelKey, Icon }) => (
            <NavbarLink
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              active={pathname === to}
              Icon={Icon}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors first:rounded-t-md last:rounded-b-md"
              activeClassName="bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300"
              inactiveClassName="text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700"
            >
              {t(labelKey)}
            </NavbarLink>
          ))}
        </div>
      )}
    </div>
  )
}

export default NavDropdown