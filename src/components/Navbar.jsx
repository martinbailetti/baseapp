import { Link, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Menu, X, Film } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/hooks/useAuth'
import { getHomeForRoles } from '@/utils/roleHome'
import { APP_NAME } from '@/utils/appConfig'
import NavbarLink from '@/components/navbar/NavbarLink'
import NavDropdown from '@/components/navbar/NavDropdown'
import MobileAccordion from '@/components/navbar/MobileAccordion'
import UserMenu from '@/components/navbar/UserMenu'
import MobileAccountSection from '@/components/navbar/MobileAccountSection'
import { routes } from '@/config/routes'

const DROPDOWNS = {
  cinema: {
    labelKey: 'nav.cinema',
    labelFallback: 'Cine',
    Icon: Film,
    order: 10,
  }
}

const hasAnyRole = (requiredRole, hasRoleFn) => {
  if (!requiredRole) return true
  const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
  return roles.some((r) => hasRoleFn(r))
}

const Navbar = () => {
  const { t } = useTranslation()
  const { user, logout, hasRole } = useAuth()
  const hasRoleFn = typeof hasRole === 'function' ? hasRole : () => false
  const { pathname } = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const homeUrl = getHomeForRoles(hasRoleFn)

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  // Filtrar y estructurar ítems de menú basándose en la configuración de rutas
  const enabledNavRoutes = routes.filter(
    (route) =>
      route.nav &&
      (!route.nav.enabledEnv || import.meta.env[route.nav.enabledEnv] === 'true')
  )

  const dropdownGroups = {}
  const topLevelLinks = []

  enabledNavRoutes.forEach((route) => {
    const { dropdownKey, labelKey, labelFallback, Icon, order } = route.nav
    const item = {
      to: route.path,
      labelKey,
      labelFallback,
      Icon,
      requiredRole: route.requiredRole,
      order,
    }

    if (dropdownKey) {
      if (!dropdownGroups[dropdownKey]) {
        dropdownGroups[dropdownKey] = []
      }
      dropdownGroups[dropdownKey].push(item)
    } else {
      topLevelLinks.push(item)
    }
  })

  // Ordenar sub-ítems
  Object.keys(dropdownGroups).forEach((key) => {
    dropdownGroups[key].sort((a, b) => a.order - b.order)
  })

  // Unificar menú items ordenados
  const menuItems = [
    ...topLevelLinks.map((link) => ({
      type: 'link',
      ...link,
    })),
    ...Object.keys(dropdownGroups).map((key) => {
      const groupDef = DROPDOWNS[key] || {
        labelKey: `nav.${key}`,
        labelFallback: key,
        Icon: Film,
        order: 99,
      }
      return {
        type: 'dropdown',
        key,
        labelKey: groupDef.labelKey,
        labelFallback: groupDef.labelFallback,
        Icon: groupDef.Icon,
        order: groupDef.order,
        subitems: dropdownGroups[key],
      }
    }),
  ]

  menuItems.sort((a, b) => a.order - b.order)

  return (
    <nav className="shrink-0 border-b border-gray-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-center justify-between px-4 py-3 md:px-8">
        {/* Logo */}
        <div className="flex items-center gap-6">
          <Link to={homeUrl} className="flex items-center">
            <img src="/images/logo.png"      alt={APP_NAME} className="h-8 object-contain dark:hidden" />
            <img src="/images/logo-dark.png" alt={APP_NAME} className="h-8 object-contain hidden dark:block" />
          </Link>

          {/* Links desktop */}
          <div className="hidden items-center gap-1 sm:flex">
            {menuItems.map((item) => {
              if (item.type === 'link') {
                if (item.requiredRole && !hasAnyRole(item.requiredRole, hasRoleFn)) return null
                return (
                  <NavbarLink
                    key={item.to}
                    to={item.to}
                    active={pathname === item.to}
                    Icon={item.Icon}
                    className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
                    activeClassName="bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300"
                    inactiveClassName="text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white"
                  >
                    {t(item.labelKey, item.labelFallback)}
                  </NavbarLink>
                )
              } else if (item.type === 'dropdown') {
                return (
                  <NavDropdown
                    key={item.key}
                    label={t(item.labelKey, item.labelFallback)}
                    Icon={item.Icon}
                    subitems={item.subitems}
                    pathname={pathname}
                    hasRole={hasRoleFn}
                  />
                )
              }
              return null
            })}
          </div>
        </div>

        {/* Lado derecho */}
        <div className="flex items-center gap-2">
          <UserMenu user={user} onLogout={logout} />
          {/* Hamburguesa — solo móvil */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="flex items-center justify-center rounded-md p-1.5 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 sm:hidden"
            aria-label={t('nav.menu')}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Menú móvil desplegable */}
      {mobileOpen && (
        <div className="border-t border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 pb-4 pt-2 sm:hidden">
          <div className="flex flex-col gap-0.5">
            {menuItems.map((item) => {
              if (item.type === 'link') {
                if (item.requiredRole && !hasAnyRole(item.requiredRole, hasRoleFn)) return null
                return (
                  <NavbarLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileOpen(false)}
                    active={pathname === item.to}
                    Icon={item.Icon}
                    className="flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium transition-colors"
                    activeClassName="bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300"
                    inactiveClassName="text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800"
                  >
                    {t(item.labelKey, item.labelFallback)}
                  </NavbarLink>
                )
              } else if (item.type === 'dropdown') {
                return (
                  <MobileAccordion
                    key={item.key}
                    label={t(item.labelKey, item.labelFallback)}
                    Icon={item.Icon}
                    subitems={item.subitems}
                    pathname={pathname}
                    hasRole={hasRoleFn}
                    onNavigate={() => setMobileOpen(false)}
                  />
                )
              }
              return null
            })}
            <MobileAccountSection user={user} onLogout={logout} onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar
