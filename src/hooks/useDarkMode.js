import { useEffect, useRef, useState } from 'react'
import { apiFetch } from '@/utils/apiFetch'
import { LOCAL_STORAGE_KEYS, USER_PREFS_KEYS } from '@/config/storageKeys'

export function useDarkMode() {
  const [dark, setDark] = useState(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.DARK_MODE)
      if (stored !== null) return stored === 'true'
    } catch { /* noop */ }
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
  })

  // Aplicar clase al <html> y persistir en localStorage
  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    try { localStorage.setItem(LOCAL_STORAGE_KEYS.DARK_MODE, String(dark)) } catch { /* noop */ }
  }, [dark])

  // Cargar preferencia desde la BD al montar (una sola vez)
  const loadedFromDb = useRef(false)
  useEffect(() => {
    if (loadedFromDb.current) return
    loadedFromDb.current = true

    apiFetch(`/api/user-prefs?key=${USER_PREFS_KEYS.UI}`)
      .then((res) => res.ok ? res.json() : null)
      .then((json) => {
        if (json?.data && typeof json.data.dark_mode === 'boolean') {
          setDark(json.data.dark_mode)
        }
      })
      .catch(() => { /* noop: sin red o no autenticado */ })
  }, [])

  // Wrapper que actualiza estado + BD
  const toggle = (value) => {
    const next = typeof value === 'boolean' ? value : !dark
    setDark(next)
    apiFetch(`/api/user-prefs?key=${USER_PREFS_KEYS.UI}`, {
      method: 'POST',
      body: JSON.stringify({ dark_mode: next }),
    }).catch(() => { /* noop */ })
  }

  return [dark, toggle]
}
