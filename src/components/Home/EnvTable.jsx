import { EnvRow } from './EnvRow'

export function EnvTable({ rows }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="text-xs font-medium text-gray-400 dark:text-slate-500 uppercase tracking-wide">
            <th className="pb-2 pr-4">Variable</th>
            <th className="pb-2 pr-4">Descripcion</th>
            <th className="pb-2 pr-4">Ejemplo</th>
            <th className="pb-2">Estado</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => <EnvRow key={r.name} {...r} />)}
        </tbody>
      </table>
    </div>
  )
}
