/**
 * Valores predeterminados centralizados de la aplicación.
 * Preferir importar desde aquí en lugar de repetir magic numbers o fallbacks de env.
 */

// ── Paginación ──────────────────────────────────────────────────────────────
export const DEFAULT_PER_PAGE = 50
export const MAX_PER_PAGE = 200

// ── Timeouts (ms) ────────────────────────────────────────────────────────────
export const PREFS_LOAD_FALLBACK_MS = 2_000
export const TOAST_DISMISS_MS = 3_500
export const INFO_MESSAGE_MS = 4_000
export const KEYCLOAK_PREFS_SAVE_DEBOUNCE_MS = 1_500
export const QR_REDIRECT_DELAY_MS = 1_200
export const QR_WS_SUBSCRIBE_INTERVAL_MS = 500
export const QR_WS_SUBSCRIBE_MAX_ATTEMPTS = 20
export const TOKEN_REFRESH_INTERVAL_MS = 30_000

// ── Auth / tokens ────────────────────────────────────────────────────────────
/** Segundos mínimos de validez del JWT antes de renovarlo proactivamente. */
export const TOKEN_MIN_VALIDITY_SECONDS = 60

// ── i18n ─────────────────────────────────────────────────────────────────────
export const DEFAULT_LANGUAGE = 'es'
export const SUPPORTED_LANGUAGE_CODES = ['es', 'ca', 'en']

// ── Z-index (capas de UI) ────────────────────────────────────────────────────
export const Z_INDEX = {
  dropdown: 50,
  modal: 150,
  toast: 200,
  offlineBanner: 300,
  infoToast: 350,
}

// ── Identidad / env fallbacks ────────────────────────────────────────────────
export const DEFAULT_APP_NAME = 'BaseKit'
export const DEFAULT_APP_TOKEN = 'basekit'
export const DEFAULT_KEYCLOAK_URL = 'http://localhost:8080'
export const DEFAULT_KEYCLOAK_REALM = 'demo'
export const DEFAULT_KEYCLOAK_CLIENT_ID = 'basekit'

// ── Valores resueltos desde env ──────────────────────────────────────────────
export const API_URL = import.meta.env.VITE_API_URL || ''
export const APP_NAME = import.meta.env.VITE_APP_NAME || DEFAULT_APP_NAME
export const APP_TOKEN = import.meta.env.VITE_APP_TOKEN || DEFAULT_APP_TOKEN
export const SMI_MSG_WS_URL = import.meta.env.VITE_SMI_MSG_WS_URL || ''
export const KEYCLOAK_CONFIG = {
  url: import.meta.env.VITE_KEYCLOAK_URL || DEFAULT_KEYCLOAK_URL,
  realm: import.meta.env.VITE_KEYCLOAK_REALM || DEFAULT_KEYCLOAK_REALM,
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || DEFAULT_KEYCLOAK_CLIENT_ID,
}
