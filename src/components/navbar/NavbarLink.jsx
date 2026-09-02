import { Link } from 'react-router-dom'
import { cn } from '@/utils/cn'

const NavbarLink = ({
  to,
  onClick,
  active,
  Icon,
  children,
  className,
  activeClassName,
  inactiveClassName,
  iconClassName = 'h-4 w-4',
}) => {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={cn(className, active ? activeClassName : inactiveClassName)}
    >
      {Icon && <Icon className={iconClassName} />}
      {children}
    </Link>
  )
}

export default NavbarLink