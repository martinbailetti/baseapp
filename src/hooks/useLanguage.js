import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { apiFetch } from '@/utils/apiFetch'
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGE_CODES } from '@/config/defaults'
import { USER_PREFS_KEYS } from '@/config/storageKeys'

/**
 * Hook que sincroniza el idioma activo con la BD (user_prefs).
 *
 * - Al montar: carga el idioma guardado en BD y lo aplica.
 * - Al llamar changeLanguage(lang): cambia idioma + guarda en BD.
 *
 * Uso:
 *   const { lang, changeLanguage } = useLanguage()
 */
export function useLanguage () {
  const { i18n } = useTranslation()
  const loadedRef = useRef(false)

  // Cargar desde BD al montar (una sola vez)
  useEffect(() => {
    if (loadedRef.current) return
    loadedRef.current = true

    apiFetch(`/api/user-prefs?key=${USER_PREFS_KEYS.LANG}`)
      .then((res) => res.ok ? res.json() : null)
      .then((json) => {
        const lang = json?.data?.lang
        if (lang && SUPPORTED_LANGUAGE_CODES.includes(lang) && lang !== i18n.resolvedLanguage) {
          i18n.changeLanguage(lang)
        }
      })
      .catch(() => { /* noop: sin red o no autenticado */ })
  }, [i18n])

  const changeLanguage = (lang) => {
    if (!SUPPORTED_LANGUAGE_CODES.includes(lang)) return
    i18n.changeLanguage(lang)
    apiFetch(`/api/user-prefs?key=${USER_PREFS_KEYS.LANG}`, {
      method: 'POST',
      body: JSON.stringify({ lang }),
    }).catch(() => { /* noop */ })
  }

  return { lang: i18n.resolvedLanguage || DEFAULT_LANGUAGE, changeLanguage }
}
