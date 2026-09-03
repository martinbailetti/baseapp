import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockRender = vi.fn()
const state = { isLoading: true, isAuthenticated: false }
const listeners = []

vi.mock('react-dom/client', () => ({
  default: {
    createRoot: () => ({ render: mockRender }),
  },
}))

vi.mock('@/store/useAuthStore', () => ({
  default: {
    getState: () => ({
      setAuthenticated: vi.fn((value) => {
        state.isAuthenticated = value
      }),
      setUser: vi.fn(),
      setToken: vi.fn(),
      setRefreshToken: vi.fn(),
      setLoading: vi.fn((value) => {
        state.isLoading = value
        listeners.forEach((listener) => listener({ ...state }))
      }),
      setError: vi.fn(),
      reset: vi.fn(),
    }),
    subscribe: (listener) => {
      listeners.push(listener)
      return () => {}
    },
  },
}))

vi.mock('@/utils/tokenRefresh', () => ({
  applySession: vi.fn(),
  setupTokenRefresh: vi.fn(),
  tryRefreshToken: vi.fn(async () => false),
}))

vi.mock('@/utils/authSession', () => ({
  clearRefreshToken: vi.fn(),
  decodeJwtPayload: vi.fn(),
  getRefreshToken: vi.fn(() => null),
  isRememberMe: vi.fn(() => false),
  takeQrTokens: vi.fn(() => null),
}))

vi.mock('@/components/ErrorBoundary', () => ({
  default: ({ children }) => children,
}))

vi.mock('@/pages/LoadingPage', () => ({
  default: () => 'loading',
}))

vi.mock('@/App', () => ({
  default: () => 'app',
}))

describe('main bootstrap', () => {
  beforeEach(() => {
    vi.resetModules()
    mockRender.mockClear()
    state.isLoading = true
    state.isAuthenticated = false
    listeners.length = 0
  })

  it('renderiza la app cuando la sesión no existe y el loading termina', async () => {
    await import('../src/main.jsx')
    // setLoading(false) se llama síncronamente → subscribers ya registrados → App renderiza
    await Promise.resolve()

    // Primera llamada: LoadingPage; segunda: App
    expect(mockRender).toHaveBeenCalledTimes(2)
  })
})
