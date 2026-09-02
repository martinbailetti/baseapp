export function initVisibility(allColumns, prefs) {
  const saved = prefs.visibility || {}
  const result = {}
  allColumns.forEach(({ key, visible }) => {
    result[key] = key in saved ? saved[key] : (visible !== false)
  })
  return result
}

export function initColOrder(allColumns, prefs) {
  const saved = prefs.colOrder
  const allKeys = allColumns.map((c) => c.key)
  if (!saved) return allKeys
  const valid = saved.filter((k) => allKeys.includes(k))
  const missing = allKeys.filter((k) => !valid.includes(k))
  return [...valid, ...missing]
}

/**
 * @param {Array<{key: string, dir?: string}>|null|undefined} criteria
 * @param {string[]} allowedKeys
 * @returns {Array<{key: string, dir: 'asc'|'desc'}>}
 */
export function normalizeSortCriteria(criteria, allowedKeys) {
  if (!Array.isArray(criteria)) return []
  const allowed = new Set(allowedKeys)
  const seen = new Set()
  const normalized = []

  for (const item of criteria) {
    const key = item?.key
    if (!key || !allowed.has(key) || seen.has(key)) continue
    normalized.push({ key, dir: item?.dir === 'desc' ? 'desc' : 'asc' })
    seen.add(key)
  }

  return normalized
}

/**
 * @param {Array<{key: string}>} columns
 * @param {object} prefs
 * @param {Array<{key: string, dir?: string}>} defaultCriteria
 */
export function initSortCriteria(columns, prefs, defaultCriteria = []) {
  const keys = columns.map((c) => c.key)
  const restored = normalizeSortCriteria(prefs.sortCriteria, keys)
  if (restored.length > 0) return restored

  if (prefs.sortBy) {
    const fallback = normalizeSortCriteria(
      [{ key: prefs.sortBy, dir: prefs.sortDir || 'asc' }],
      keys
    )
    if (fallback.length > 0) return fallback
  }

  const defaults = normalizeSortCriteria(defaultCriteria, keys)
  if (defaults.length > 0) return defaults

  return [{ key: keys[0] || 'id', dir: 'asc' }]
}

/**
 * @param {URLSearchParams} params
 * @param {Array<{key: string, dir?: string}>} criteria
 * @param {string[]} allowedKeys
 */
export function appendSortCriteriaParams(params, criteria, allowedKeys) {
  const normalized = normalizeSortCriteria(criteria, allowedKeys)
  if (normalized.length === 0) return

  normalized.forEach(({ key, dir }) => {
    params.append('sort[]', key)
    params.append('direction[]', dir)
  })
}
