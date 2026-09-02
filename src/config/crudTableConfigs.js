import { DEFAULT_PER_PAGE, MAX_PER_PAGE } from './defaults'

export { DEFAULT_PER_PAGE, MAX_PER_PAGE }

export const PER_PAGE_OPTIONS = [25, DEFAULT_PER_PAGE, 100, MAX_PER_PAGE]

export const DEFAULT_MOVIES_SORT = [{ key: 'release_year', dir: 'desc' }]
export const DEFAULT_ACTORS_SORT = [{ key: 'last_name', dir: 'asc' }]
export const DEFAULT_DIRECTORS_SORT = [{ key: 'last_name', dir: 'asc' }]
