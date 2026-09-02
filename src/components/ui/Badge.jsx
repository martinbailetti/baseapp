import { cn } from '@/utils/cn'

const variants = {
  default: 'bg-gray-100 text-gray-700',
  primary: 'bg-indigo-100 text-indigo-700',
  success: 'bg-green-100 text-green-700',
  warning: 'bg-yellow-100 text-yellow-700',
  danger: 'bg-red-100 text-red-700',
}

/**
 * @param {{
 *   children: import('react').ReactNode,
 *   variant?: 'default'|'primary'|'success'|'warning'|'danger',
 *   className?: string
 * }} props
 */
const Badge = ({ children, variant = 'default', className = '', ...props }) => (
  <span
    className={cn(
      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
      variants[variant],
      className
    )}
    {...props}
  >
    {children}
  </span>
)

export { Badge }
export default Badge
