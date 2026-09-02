/**
 * Claves de persistencia de preferencias de tablas (keycloakPrefs).
 *
 * Centralizadas aquí para evitar colisiones y facilitar migraciones.
 * El sufijo `_vN` permite invalidar prefs antiguas si cambia el formato.
 */
export const STORAGE_KEYS = {
  MOVIES: 'movies_v2',
  ACTORS: 'actors_v1',
  DIRECTORS: 'directors_v1',
  ACTIVITY_LOG: 'activity_log_v1',
}

/** Claves de user_prefs en la API (/api/user-prefs?key=...) */
export const USER_PREFS_KEYS = {
  LANG: 'lang',
  UI: 'ui_prefs',
}

/** Claves de localStorage del navegador */
export const LOCAL_STORAGE_KEYS = {
  DARK_MODE: 'dark_mode',
  LANG: 'lang',
}
