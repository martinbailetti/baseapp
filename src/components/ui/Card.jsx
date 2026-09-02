import { cn } from '@/utils/cn'

/**
 * @param {{ children: import('react').ReactNode, className?: string }} props
 */
const Card = ({ children, className = '', ...props }) => (
  <div
    className={cn('bg-white rounded-xl shadow-md border border-gray-100', className)}
    {...props}
  >
    {children}
  </div>
)

/**
 * @param {{ children: import('react').ReactNode, className?: string }} props
 */
const CardHeader = ({ children, className = '', ...props }) => (
  <div className={cn('px-6 py-4 border-b border-gray-100', className)} {...props}>
    {children}
  </div>
)

/**
 * @param {{ children: import('react').ReactNode, className?: string }} props
 */
const CardBody = ({ children, className = '', ...props }) => (
  <div className={cn('px-6 py-4', className)} {...props}>
    {children}
  </div>
)

/**
 * @param {{ children: import('react').ReactNode, className?: string }} props
 */
const CardFooter = ({ children, className = '', ...props }) => (
  <div className={cn('px-6 py-4 border-t border-gray-100', className)} {...props}>
    {children}
  </div>
)

export { Card, CardHeader, CardBody, CardFooter }
export default Card
