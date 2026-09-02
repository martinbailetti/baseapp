import { render } from '@testing-library/react'
import { routerFuture } from './routerFuture'

export let routerInitialEntries = ['/']

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    BrowserRouter: ({ children, future = routerFuture }) => (
      <actual.MemoryRouter initialEntries={routerInitialEntries} future={future}>
        {children}
      </actual.MemoryRouter>
    ),
  }
})

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}))

vi.mock('@/hooks/useDarkMode', () => ({
  useDarkMode: vi.fn(() => [false, vi.fn()]),
}))

vi.mock('@/hooks/useLanguage', () => ({
  useLanguage: vi.fn(() => ({ lang: 'es', changeLanguage: vi.fn() })),
}))

vi.mock('@/utils/apiFetch', () => ({
  apiFetch: vi.fn(),
  apiJson: vi.fn(),
}))

import { useAuth } from '@/hooks/useAuth'
import { apiFetch } from '@/utils/apiFetch'
import App from '@/App'

const defaultAuth = {
  isLoading: false,
  isAuthenticated: true,
  hasRequiredRoles: true,
  hasRole: (role) => role === 'super',
  user: { name: 'Test User', preferred_username: 'testuser' },
  login: vi.fn(),
  logout: vi.fn(),
  getTokenParsed: () => ({
    name: 'Test User',
    preferred_username: 'testuser',
    email: 'test@example.com',
  }),
}

export function setupApiFetchMock() {
  apiFetch.mockImplementation(async (path) => {
    if (path.startsWith('/api/user-prefs')) {
      return { ok: true, json: async () => ({ data: {} }) }
    }

    if (
      path.includes('/api/actors')
      || path.includes('/api/movies')
      || path.includes('/api/directors')
    ) {
      return {
        ok: true,
        json: async () => ({
          success: true,
          data: { items: [], pagination: { total: 0 } },
        }),
      }
    }

    if (path === '/api/users') {
      return { ok: true, json: async () => ({ success: true, data: [] }) }
    }

    if (path === '/api/push/public-key') {
      return {
        ok: true,
        json: async () => ({
          success: true,
          data: { enabled: true, public_key: 'YQ==' },
        }),
      }
    }

    if (path.startsWith('/api/activity-log/filters')) {
      return { ok: true, json: async () => ({ data: [] }) }
    }

    if (path.startsWith('/api/activity-log')) {
      return {
        ok: true,
        json: async () => ({
          success: true,
          data: { items: [], pagination: { total: 0 } },
        }),
      }
    }

    return { ok: true, json: async () => ({}) }
  })
}

export function setupAuth(overrides = {}) {
  const hasRole = overrides.hasRole ?? defaultAuth.hasRole
  useAuth.mockReturnValue({
    ...defaultAuth,
    ...overrides,
    hasRole,
  })
}

export function renderApp(path = '/', authOverrides = {}) {
  routerInitialEntries = [path]
  setupAuth(authOverrides)
  return render(<App />)
}
