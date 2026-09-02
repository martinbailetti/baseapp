import { apiFetch } from '@/utils/apiFetch'
import { PREFS_SAVE_DEBOUNCE_MS } from '@/config/defaults'

// Cache por key: { loaded, prefs, listeners, saveTimer, loadPromise }
const _cache = {}

function getEntry(key) {
  if (!_cache[key]) {
    _cache[key] = { loaded: false, prefs: {}, listeners: new Set(), saveTimer: null, loadPromise: null }
  }
  return _cache[key]
}

/**
 * Carga las prefs de una key concreta desde la API (idempotente por sesión).
 * @param {string} key  storageKey de la tabla (p.ej. 'planning_v1')
 * @returns {Promise<object>}
 */
export function ensureLoaded(key) {
  const entry = getEntry(key)
  if (entry.loaded) return Promise.resolve(entry.prefs)
  if (entry.loadPromise) return entry.loadPromise

  entry.loadPromise = apiFetch(`/api/user-prefs?key=${encodeURIComponent(key)}`)
    .then((res) => res.json())
    .then((data) => {
      entry.prefs  = (data && data.data) ? data.data : {}
      entry.loaded = true
      entry.listeners.forEach((fn) => fn(entry.prefs))
      return entry.prefs
    })
    .catch(() => {
      entry.prefs  = {}
      entry.loaded = true
      entry.listeners.forEach((fn) => fn(entry.prefs))
      return {}
    })
    .finally(() => { entry.loadPromise = null })

  return entry.loadPromise
}

/**
 * Suscribirse a cambios de una key concreta.
 * @param {string}   key  storageKey de la tabla
 * @param {function} fn   Callback que recibe el objeto de prefs de esa key
 * @returns {function}    Función de unsubscribe
 */
export function subscribe(key, fn) {
  const entry = getEntry(key)
  entry.listeners.add(fn)
  if (entry.loaded) fn(entry.prefs)
  return () => entry.listeners.delete(fn)
}

/**
 * Actualiza las prefs de una key y programa el guardado (debounced).
 * @param {string} key    storageKey de la tabla
 * @param {object} prefs  Objeto de preferencias a guardar
 */
export function setPrefs(key, prefs) {
  const entry  = getEntry(key)
  entry.prefs  = prefs
  clearTimeout(entry.saveTimer)
  entry.saveTimer = setTimeout(() => flush(key), PREFS_SAVE_DEBOUNCE_MS)
}

async function flush(key) {
  const entry = _cache[key]
  if (!entry) return
  try {
    await apiFetch(`/api/user-prefs?key=${encodeURIComponent(key)}`, {
      method: 'POST',
      body:   JSON.stringify(entry.prefs),
    })
  } catch {
    // noop — si falla el guardado la app sigue funcionando con las prefs en memoria
  }
}
