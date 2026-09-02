import { cn } from '@/utils/cn'

/**
 * PageContainer
 * Standard wrapper for page content to ensure consistent spacing and width constraints.
 *
 * @param {object} props
 * @param {React.ReactNode} props.children - Child elements
 * @param {string} [props.maxWidth] - Custom tailwind max-width class (default: max-w-7xl)
 * @param {string} [props.className] - Additional classes
 */
export default function PageContainer({ children, maxWidth = 'max-w-7xl', className }) {
  return (
    <div className={cn("mx-auto w-full px-4 py-8 md:px-8", maxWidth, className)}>
      {children}
    </div>
  )
}
