import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'

export function SortIcon({ colKey, sortCriteria = [] }) {
  const idx = sortCriteria.findIndex((s) => s.key === colKey)
  if (idx === -1) return <ChevronsUpDown className="h-3.5 w-3.5 opacity-30" />

  const dir = sortCriteria[idx].dir
  return (
    <span className="inline-flex items-center gap-0.5">
      {dir === 'asc'
        ? <ChevronUp className="h-3.5 w-3.5 text-indigo-500" />
        : <ChevronDown className="h-3.5 w-3.5 text-indigo-500" />}
      <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/50 px-1 text-[9px] font-bold leading-none text-indigo-700 dark:text-indigo-300">
        {idx + 1}
      </span>
    </span>
  )
}
