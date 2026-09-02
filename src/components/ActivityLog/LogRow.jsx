import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/utils/cn'
import { ActionBadge } from './ActionBadge'
import { DetailsPanel } from './DetailsPanel'

function parseDetails(details) {
  if (!details) return null
  try { return typeof details === 'string' ? JSON.parse(details) : details } catch { return null }
}

export function LogRow({ row }) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const parsed = parseDetails(row.details)
  const hasDetails = parsed !== null

  return (
    <>
      <tr className={cn('hover:bg-gray-50 transition-colors', open && 'bg-indigo-50/40')}>
        <td className="px-3 py-2 text-gray-400 tabular-nums">{row.Id}</td>
        <td className="px-3 py-2 text-gray-700 max-w-[180px] truncate" title={row.user_email}>{row.user_email || '—'}</td>
        <td className="px-3 py-2"><ActionBadge action={row.action} /></td>
        <td className="px-3 py-2 text-gray-600">{row.entity || '—'}</td>
        <td className="px-3 py-2 text-gray-500 tabular-nums">{row.entity_id || '—'}</td>
        <td className="px-3 py-2">
          {hasDetails ? (
            <button
              onClick={() => setOpen(v => !v)}
              className={cn(
                'inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium transition-colors',
                open ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              {open ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              {open ? t('activityLog.hide') : t('activityLog.show')}
            </button>
          ) : (
            <span className="text-gray-400">—</span>
          )}
        </td>
        <td className="px-3 py-2 text-gray-500 tabular-nums whitespace-nowrap">{row.ip_address || '—'}</td>
        <td className="px-3 py-2 text-gray-500 tabular-nums whitespace-nowrap">
          {row.created_at ? row.created_at.replace('T', ' ').substring(0, 19) : '—'}
        </td>
      </tr>
      {open && hasDetails && (
        <tr className="bg-gray-50">
          <td colSpan={8} className="px-4 py-3">
            <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm overflow-auto max-h-72">
              <DetailsPanel parsed={parsed} />
            </div>
          </td>
        </tr>
      )}
    </>
  )
}
