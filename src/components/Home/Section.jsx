export function Section({ icon: Icon, title, children }) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
        <Icon className="h-5 w-5 text-indigo-500" />
        {title}
      </h2>
      {children}
    </div>
  )
}
