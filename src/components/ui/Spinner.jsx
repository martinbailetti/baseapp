import { cn } from '@/utils/cn'

const sizes = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
}

/**
 * @param {{ size?: 'sm'|'md'|'lg', className?: string }} props
 */
const Spinner = ({ size = 'md', className = '', ...props }) => (
  <div
    role="status"
    aria-label="Cargando"
    className={cn(
      'animate-spin rounded-full border-2 border-gray-200 border-t-indigo-600',
      sizes[size],
      className
    )}
    {...props}
  />
)

export { Spinner }
export default Spinner
