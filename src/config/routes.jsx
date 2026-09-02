import { lazy } from 'react'
import { Film, Users, Clapperboard, ScrollText, BellRing } from 'lucide-react'

// Lazy loaded page components to optimize bundle size and page loading speed
const HomePage = lazy(() => import('@/pages/HomePage'))
const ProfilePage = lazy(() => import('@/pages/ProfilePage'))
const ActivityLogPage = lazy(() => import('@/pages/ActivityLogPage'))
const UsersPage = lazy(() => import('@/pages/UsersPage'))
const PushNotificationsPage = lazy(() => import('@/pages/PushNotificationsPage'))
const MoviesPage = lazy(() => import('@/pages/MoviesPage'))
const MovieFormPage = lazy(() => import('@/pages/MovieFormPage'))
const ActorsPage = lazy(() => import('@/pages/ActorsPage'))
const DirectorsPage = lazy(() => import('@/pages/DirectorsPage'))
const QrConfirmPage = lazy(() => import('@/pages/QrConfirmPage'))

/**
 * Array of application route definitions.
 * Adding a new page is as simple as adding a new object to this array.
 * 
 * Route properties:
 * @typedef {object} RouteDefinition
 * @property {string} path - The URL path for this route.
 * @property {React.ComponentType} element - The component to render (lazy loaded).
 * @property {boolean} protected - Whether authentication is required via <ProtectedRoute>.
 * @property {string|string[]} [requiredRole] - Optional role or array of roles required to access the route.
 * @property {boolean} layout - Whether this route should be wrapped in <AppLayout>.
 * @property {object} [nav] - Navigation menu configuration if it should appear in Navbar.
 * @property {string} nav.labelKey - Translation key for the menu label (i18n).
 * @property {string} nav.labelFallback - Fallback text if the key is not translated yet.
 * @property {React.ComponentType} nav.Icon - Lucide icon component.
 * @property {string} [nav.dropdownKey] - Key of the dropdown it belongs to (e.g. 'cinema'). If omitted, renders as a top-level link.
 * @property {number} nav.order - Ordering weight in the navigation bar/dropdown (ascending).
 * @property {string} [nav.enabledEnv] - Optional env variable name. The link is only shown if this env is 'true' (e.g. 'VITE_ENABLE_USERS_PAGE').
 */
export const routes = [
  {
    path: '/home',
    element: HomePage,
    protected: true,
    layout: true,
  },
  {
    path: '/profile',
    element: ProfilePage,
    protected: true,
    layout: true,
  },
  {
    path: '/peliculas/nueva',
    element: MovieFormPage,
    protected: true,
    requiredRole: ['super'],
    layout: true,
  },
  {
    path: '/peliculas/:id/editar',
    element: MovieFormPage,
    protected: true,
    requiredRole: ['super'],
    layout: true,
  },
  {
    path: '/peliculas',
    element: MoviesPage,
    protected: true,
    requiredRole: ['super'],
    layout: true,
    nav: {
      labelKey: 'nav.movies',
      labelFallback: 'Películas',
      Icon: Film,
      dropdownKey: 'cinema',
      order: 10,
    }
  },
  {
    path: '/actores',
    element: ActorsPage,
    protected: true,
    requiredRole: ['super'],
    layout: true,
    nav: {
      labelKey: 'nav.actors',
      labelFallback: 'Actores',
      Icon: Users,
      dropdownKey: 'cinema',
      order: 20,
    }
  },
  {
    path: '/directores',
    element: DirectorsPage,
    protected: true,
    requiredRole: ['super'],
    layout: true,
    nav: {
      labelKey: 'nav.directors',
      labelFallback: 'Directores',
      Icon: Clapperboard,
      dropdownKey: 'cinema',
      order: 30,
    }
  },
  {
    path: '/activity-log',
    element: ActivityLogPage,
    protected: true,
    requiredRole: ['super'],
    layout: true,
    nav: {
      labelKey: 'nav.activityLog',
      labelFallback: 'Registro de Actividad',
      Icon: ScrollText,
      order: 20,
    }
  },
  {
    path: '/users',
    element: UsersPage,
    protected: true,
    requiredRole: ['super'],
    layout: true,
    nav: {
      labelKey: 'nav.users',
      labelFallback: 'Usuarios',
      Icon: Users,
      order: 30,
      enabledEnv: 'VITE_ENABLE_USERS_PAGE',
    }
  },
  {
    path: '/push-notifications',
    element: PushNotificationsPage,
    protected: true,
    requiredRole: ['super'],
    layout: true,
    nav: {
      labelKey: 'nav.pushNotifications',
      labelFallback: 'Notificaciones',
      Icon: BellRing,
      order: 40,
    }
  },
  {
    path: '/qr-confirm',
    element: QrConfirmPage,
    protected: true,
    layout: false,
  }
]
