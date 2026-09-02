export function CodeBlock({ children }) {
  return (
    <div className="rounded-lg bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 px-4 py-3 font-mono text-sm text-gray-800 dark:text-slate-200 space-y-1">
      {children}
    </div>
  )
}
