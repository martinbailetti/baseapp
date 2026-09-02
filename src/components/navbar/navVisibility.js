export const getVisibleSubitems = (subitems, hasRole) => {
  const toArray = (value) => (Array.isArray(value) ? value : [value])

  return subitems.filter(({ requiredRole, anyRole, excludeRole }) => {
    if (excludeRole) {
      const roles = toArray(excludeRole)
      if (roles.some((role) => hasRole(role))) return false
    }

    if (anyRole) {
      const roles = toArray(anyRole)
      return roles.some((role) => hasRole(role))
    }

    if (!requiredRole) return true

    const roles = toArray(requiredRole)
    return roles.some((role) => hasRole(role))
  })
}