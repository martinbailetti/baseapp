import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import es from './locales/es.json'
import ca from './locales/ca.json'
import en from './locales/en.json'
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGE_CODES } from '@/config/defaults'
import { LOCAL_STORAGE_KEYS } from '@/config/storageKeys'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      es: { translation: es },
      ca: { translation: ca },
      en: { translation: en },
    },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: LOCAL_STORAGE_KEYS.LANG,
      caches: ['localStorage'],
    },
    fallbackLng: DEFAULT_LANGUAGE,
    supportedLngs: SUPPORTED_LANGUAGE_CODES,
    interpolation: {
      escapeValue: false, // React ya escapa los valores
    },
  })

export default i18n
