import { NavLink } from 'react-router-dom'

export default function AdminNavLink({ to, children }) {
    return (
        <NavLink
            to={to}
            className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 text-sm font-bold uppercase tracking-wide ${
                    isActive ? 'bg-accent text-white' : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'
                }`
            }
        >
            {children}
        </NavLink>
    )
}
