import { cn } from '@/utils/cn'

/**
 * @param {{
 *   label?: string,
 *   error?: string,
 *   id?: string,
 *   className?: string
 * }} props
 */
const Input = ({ label, error, className = '', id, name, ...props }) => (
  <div className="flex flex-col gap-1">
    {label && (
      <label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label}
      </label>
    )}
    <input
      id={id}
      name={name ?? id}
      className={cn(
        'rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm',
        'placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500',
        'disabled:bg-gray-50 disabled:text-gray-500',
        error && 'border-red-400 focus:border-red-500 focus:ring-red-500',
        className
      )}
      {...props}
    />
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
)

export { Input }
export default Input
