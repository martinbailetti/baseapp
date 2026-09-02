export function EnvRow({ name, description, example, required = true }) {
  return (
    <tr className="border-t border-gray-100 dark:border-slate-700">
      <td className="py-2 pr-4 font-mono text-xs text-indigo-600 dark:text-indigo-400 whitespace-nowrap align-top">{name}</td>
      <td className="py-2 pr-4 text-sm text-gray-600 dark:text-slate-300 align-top">{description}</td>
      <td className="py-2 pr-4 font-mono text-xs text-gray-500 dark:text-slate-400 whitespace-nowrap align-top">{example}</td>
      <td className="py-2 align-top">
        {required
          ? <span className="rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-0.5 text-xs">requerido</span>
          : <span className="rounded-full bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400 px-2 py-0.5 text-xs">opcional</span>
        }
      </td>
    </tr>
  )
}
