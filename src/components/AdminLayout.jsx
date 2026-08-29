import { useEffect, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import AdminNavLink from './AdminNavLink'
import { useAuth } from '../context/AuthContext'
import { company } from '../lib/company'
import {
    IconChevronLeft,
    IconChevronRight,
    IconDashboard,
    IconListings,
    IconLogout,
    IconMenu,
    IconOrderBook,
    IconOrdersOnline,
    IconPartRequests,
    IconProforma,
    IconRepairs,
    IconWhatsapp,
} from './AdminIcons'

const NAV_ITEMS = [
    { to: '/admin/dashboard', label: 'Tableau de bord', icon: IconDashboard },
    { to: '/admin/annonces', label: 'Annonces', icon: IconListings },
    { to: '/admin/commandes', label: 'Commandes en ligne', icon: IconOrdersOnline },
    { to: '/admin/carnet-de-commandes', label: 'Carnet de commandes', icon: IconOrderBook },
    { to: '/admin/demandes', label: 'Demandes de pièces', icon: IconPartRequests },
    { to: '/admin/reparations', label: 'Réparations', icon: IconRepairs },
    { to: '/admin/proformas', label: 'Proforma', icon: IconProforma },
    { to: '/admin/whatsapp', label: 'Chatbot WhatsApp', icon: IconWhatsapp },
]

const COLLAPSE_KEY = 'admin-sidebar-collapsed'

export default function AdminLayout() {
    const [mobileOpen, setMobileOpen] = useState(false)
    const [collapsed, setCollapsed] = useState(() => localStorage.getItem(COLLAPSE_KEY) === '1')
    const { signOut } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        localStorage.setItem(COLLAPSE_KEY, collapsed ? '1' : '0')
    }, [collapsed])

    async function handleLogout(e) {
        e.preventDefault()
        await signOut()
        navigate('/admin/login')
    }

    return (
        <div className="bg-surface text-ink antialiased min-h-screen">
            <aside
                className={`fixed inset-y-0 left-0 z-40 bg-neutral-900 text-white flex flex-col transition-all duration-200 w-64 ${
                    collapsed ? 'lg:w-20' : 'lg:w-64'
                } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
            >
                <div className={`flex items-center gap-3 px-4 h-16 border-b border-neutral-800 shrink-0 ${collapsed ? 'lg:justify-center lg:px-0' : ''}`}>
                    <img src="/img/logo.png" alt={company.name} className="w-9 h-9 rounded-full object-cover shrink-0" />
                    <span className={`font-extrabold text-sm leading-tight ${collapsed ? 'lg:hidden' : ''}`}>
                        ABDOU CASSE AUTO
                        <br />
                        <span className="text-accent text-xs">Espace admin</span>
                    </span>
                </div>

                <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
                    {NAV_ITEMS.map((item) => (
                        <AdminNavLink key={item.to} to={item.to} icon={item.icon} collapsed={collapsed}>
                            {item.label}
                        </AdminNavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-neutral-800 shrink-0 space-y-2">
                    <button
                        onClick={() => setCollapsed((c) => !c)}
                        className={`hidden lg:flex btn-secondary btn-block !text-white !border-neutral-700 hover:!bg-neutral-800 ${
                            collapsed ? 'lg:!px-0' : ''
                        }`}
                        aria-label={collapsed ? 'Agrandir le menu' : 'Réduire le menu'}
                        title={collapsed ? 'Agrandir le menu' : 'Réduire le menu'}
                    >
                        {collapsed ? <IconChevronRight className="w-4 h-4 shrink-0" /> : <IconChevronLeft className="w-4 h-4 shrink-0" />}
                        <span className={collapsed ? 'lg:hidden' : ''}>Réduire</span>
                    </button>

                    <button
                        onClick={handleLogout}
                        title="Se déconnecter"
                        className={`btn-secondary btn-block !text-white !border-neutral-700 hover:!bg-neutral-800 ${
                            collapsed ? 'lg:!px-0' : ''
                        }`}
                    >
                        <IconLogout className="w-4 h-4 shrink-0" />
                        <span className={collapsed ? 'lg:hidden' : ''}>Se déconnecter</span>
                    </button>
                </div>
            </aside>

            <div className={`min-w-0 transition-all duration-200 ${collapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
                <div className="lg:hidden sticky top-0 z-30 bg-neutral-900 text-white h-14 flex items-center justify-between px-4">
                    <span className="font-extrabold text-sm">ABDOU CASSE AUTO — Admin</span>
                    <button onClick={() => setMobileOpen((o) => !o)} aria-label="Menu">
                        <IconMenu className="w-6 h-6" />
                    </button>
                </div>

                <main className="p-4 sm:p-8 max-w-6xl mx-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}
