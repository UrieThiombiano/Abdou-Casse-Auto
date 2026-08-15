import { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import AdminNavLink from './AdminNavLink'
import { useAuth } from '../context/AuthContext'
import { company } from '../lib/company'

export default function AdminLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const { signOut } = useAuth()
    const navigate = useNavigate()

    async function handleLogout(e) {
        e.preventDefault()
        await signOut()
        navigate('/admin/login')
    }

    return (
        <div className="bg-surface text-ink antialiased min-h-screen lg:flex">
            <aside
                className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-neutral-900 text-white flex flex-col transition-transform ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                }`}
            >
                <div className="flex items-center gap-3 px-4 h-16 border-b border-neutral-800">
                    <img src="/img/logo.jpg" alt={company.name} className="w-9 h-9 rounded-full object-cover" />
                    <span className="font-extrabold text-sm leading-tight">
                        ABDOU CASSE AUTO
                        <br />
                        <span className="text-accent text-xs">Espace admin</span>
                    </span>
                </div>

                <nav className="flex-1 py-4 space-y-1">
                    <AdminNavLink to="/admin/dashboard">Tableau de bord</AdminNavLink>
                    <AdminNavLink to="/admin/annonces">Annonces</AdminNavLink>
                    <AdminNavLink to="/admin/commandes">Commandes</AdminNavLink>
                </nav>

                <div className="p-4 border-t border-neutral-800">
                    <button
                        onClick={handleLogout}
                        className="btn-secondary btn-block !text-white !border-neutral-700 hover:!bg-neutral-800"
                    >
                        Se déconnecter
                    </button>
                </div>
            </aside>

            <div className="flex-1 min-w-0">
                <div className="lg:hidden sticky top-0 z-30 bg-neutral-900 text-white h-14 flex items-center justify-between px-4">
                    <span className="font-extrabold text-sm">ABDOU CASSE AUTO — Admin</span>
                    <button onClick={() => setSidebarOpen((o) => !o)} aria-label="Menu">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 6h18M3 12h18M3 18h18" />
                        </svg>
                    </button>
                </div>

                <main className="p-4 sm:p-8 max-w-6xl mx-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}
