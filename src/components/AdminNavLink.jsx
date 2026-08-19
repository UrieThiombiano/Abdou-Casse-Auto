import { NavLink } from 'react-router-dom'

export default function AdminNavLink({ to, icon: Icon, collapsed, children }) {
    return (
        <NavLink
            to={to}
            title={collapsed ? children : undefined}
            className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 text-sm font-bold uppercase tracking-wide ${
                    collapsed ? 'justify-center px-0' : ''
                } ${isActive ? 'bg-accent text-white' : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'}`
            }
        >
            {Icon && <Icon className="w-5 h-5 shrink-0" />}
            {!collapsed && <span>{children}</span>}
        </NavLink>
    )
}
