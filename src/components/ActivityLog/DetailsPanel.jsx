import { useTranslation } from 'react-i18next'

export function DetailsPanel({ parsed }) {
  const { t } = useTranslation()
  
  // UPDATE clásico: { old_value: {}, new_value: {} }
  if (parsed.old_value !== undefined && parsed.new_value !== undefined &&
      typeof parsed.old_value === 'object' && typeof parsed.new_value === 'object' &&
      parsed.old_value !== null && parsed.new_value !== null) {
    const allKeys = [...new Set([...Object.keys(parsed.old_value), ...Object.keys(parsed.new_value)])]
    const changed = allKeys.filter(k => String(parsed.old_value[k] ?? '') !== String(parsed.new_value[k] ?? ''))
    const rows = changed.length > 0 ? changed : allKeys
    return (
      <div>
        <p className="mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">{t('activityLog.detailsModifiedFields')}</p>
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-gray-100 text-gray-600">
              <th className="px-3 py-1.5 text-left font-medium rounded-tl">{t('activityLog.detailsField')}</th>
              <th className="px-3 py-1.5 text-left font-medium text-red-600">{t('activityLog.detailsOldValue')}</th>
              <th className="px-3 py-1.5 text-left font-medium text-green-700 rounded-tr">{t('activityLog.detailsNewValue')}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((k, i) => (
              <tr key={k} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-3 py-1.5 font-mono text-gray-700 font-medium">{k}</td>
                <td className="px-3 py-1.5 text-red-700 line-through opacity-70">{String(parsed.old_value[k] ?? '—')}</td>
                <td className="px-3 py-1.5 text-green-700 font-medium">{String(parsed.new_value[k] ?? '—')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  // CASCADE UPDATE: { cascade_from, column, old_value, new_value, rows_updated }
  if (parsed.cascade_from !== undefined) {
    return (
      <p className="text-sm text-gray-700">
        {t('activityLog.detailsCascade', {
          from: parsed.cascade_from,
          column: parsed.column,
          oldVal: String(parsed.old_value),
          newVal: String(parsed.new_value),
          rows: parsed.rows_updated,
        })}
      </p>
    )
  }

  // CREATE / DELETE: { created_record: {} } o { deleted_record: {} }
  const recordKey = parsed.created_record ? 'created_record' : parsed.deleted_record ? 'deleted_record' : null
  if (recordKey) {
    const record = parsed[recordKey]
    const entries = Object.entries(record).filter(([, v]) => v !== null && v !== '' && v !== undefined)
    const label = recordKey === 'created_record' ? t('activityLog.detailsCreated') : t('activityLog.detailsDeleted')
    return (
      <div>
        <p className="mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
        <table className="w-full text-xs border-collapse">
          <tbody>
            {entries.map(([k, v], i) => (
              <tr key={k} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-3 py-1.5 font-mono text-gray-600 font-medium w-48">{k}</td>
                <td className="px-3 py-1.5 text-gray-800">{String(v)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  // CHANGE_PASSWORD
  if (parsed.username !== undefined) {
    return (
      <p className="text-sm text-gray-700">
        {t('activityLog.detailsPasswordChange', { username: parsed.username })}
      </p>
    )
  }

  // Fallback genèric: llista de clau→valor
  return (
    <table className="w-full text-xs border-collapse">
      <tbody>
        {Object.entries(parsed).map(([k, v], i) => (
          <tr key={k} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
            <td className="px-3 py-1.5 font-mono text-gray-600 font-medium w-48">{k}</td>
            <td className="px-3 py-1.5 text-gray-800">{typeof v === 'object' ? JSON.stringify(v) : String(v)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
