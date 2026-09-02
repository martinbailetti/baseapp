import { cn } from '@/utils/cn'

/**
 * PageHeader
 * Reusable header component for standardizing pages look & feel.
 *
 * @param {object} props
 * @param {React.ReactNode} props.title - The title text or element
 * @param {React.ReactNode} [props.subtitle] - The subtitle text or element
 * @param {React.ComponentType<{className?: string}>} [props.Icon] - Lucide icon component
 * @param {React.ReactNode} [props.actions] - Buttons or action items to show on the right
 * @param {string} [props.className] - Additional classes
 */
export default function PageHeader({ title, subtitle, Icon, actions, className }) {
  return (
    <div className={cn("mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200/60 dark:border-slate-800 pb-5", className)}>
      <div className="flex items-start sm:items-center gap-3">
        {Icon && (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100/80 dark:from-indigo-950/40 dark:to-indigo-900/25 border border-indigo-100/55 dark:border-indigo-800/30 text-indigo-600 dark:text-indigo-400 shadow-sm shadow-indigo-100/10">
            <Icon className="h-6 w-6" />
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {actions && (
        <div className="flex items-center gap-2 sm:self-center">
          {actions}
        </div>
      )}
    </div>
  )
}
