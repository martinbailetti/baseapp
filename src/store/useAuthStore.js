import { create } from 'zustand'

/**
 * @typedef {Object} AuthState
 * @property {boolean} isAuthenticated
 * @property {boolean} isLoading
 * @property {Object|null} user
 * @property {string|null} token
 * @property {string|null} refreshToken
 * @property {string|null} error
 */

const useAuthStore = create((set) => ({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  token: null,
  refreshToken: null,
  error: null,

  setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
  setLoading: (isLoading) => set({ isLoading }),
  setUser: (user) => set({ user }),
  setToken: (token) => set({ token }),
  setRefreshToken: (refreshToken) => set({ refreshToken }),
  setError: (error) => set({ error }),

  reset: () =>
    set({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      token: null,
      refreshToken: null,
      error: null,
    }),
}))

export default useAuthStore
