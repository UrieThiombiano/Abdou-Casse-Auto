import { NavLink } from 'react-router-dom'

export default function PublicNavLink({ to, end = false, className = '', children }) {
    return (
        <NavLink
            to={to}
            end={end}
            className={({ isActive }) =>
                `text-sm font-bold uppercase tracking-wide ${isActive ? 'text-accent' : 'text-ink hover:text-accent'} ${className}`
            }
        >
            {children}
        </NavLink>
    )
}
