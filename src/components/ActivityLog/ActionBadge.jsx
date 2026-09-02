import { cn } from '@/utils/cn'
import { ACTION_COLORS } from '@/config/pageConfigs'

export function ActionBadge({ action }) {
  return (
    <span className={cn('inline-flex rounded-full px-2 py-0.5 text-xs font-medium', ACTION_COLORS[action] || 'bg-gray-100 text-gray-600')}>
      {action}
    </span>
  )
}
