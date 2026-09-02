/**
 * Mapa de rol → página home.
 * Orden importante: el primer rol que coincida gana.
 * Para añadir un nuevo rol, añadir una entrada a este array.
 */
const ROLE_HOME_MAP = [
  { role: 'super',  path: '/home' },
  { role: 'admin',  path: '/home' },
  { role: 'viewer', path: '/home' },
]

/** Ruta home cuando ningún rol de la lista coincide */
const DEFAULT_HOME = '/home'

/**
 * Devuelve la ruta home correspondiente al primer rol que tenga el usuario.
 * @param {(role: string) => boolean} hasRole  — función del hook useAuth
 * @returns {string} path de React Router
 */
export function getHomeForRoles(hasRole) {
  if (typeof hasRole !== 'function') return DEFAULT_HOME
  for (const { role, path } of ROLE_HOME_MAP) {
    if (hasRole(role)) return path
  }
  return DEFAULT_HOME
}
