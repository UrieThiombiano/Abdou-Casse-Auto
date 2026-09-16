import { useEffect, useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import PublicNavLink from './PublicNavLink'
import RouteTracker from './RouteTracker'
import SmoothScroll from './SmoothScroll'
import { company, telHref, mailHref } from '../lib/company'
import { trackEvent } from '../lib/analytics'

export default function PublicLayout() {
    const [mobileOpen, setMobileOpen] = useState(false)
    const location = useLocation()

    // Referme le menu mobile a chaque changement de page.
    useEffect(() => {
        setMobileOpen(false)
    }, [location.pathname])

    // Empeche le scroll du fond pendant que le menu mobile est ouvert.
    useEffect(() => {
        if (!mobileOpen) return
        const previous = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        return () => {
            document.body.style.overflow = previous
        }
    }, [mobileOpen])

    return (
        <div className="bg-bg text-ink antialiased min-h-screen flex flex-col overflow-x-hidden">
            <SmoothScroll />
            <RouteTracker />
            <header className="sticky top-0 z-40 bg-white border-b border-neutral-200">
                <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
                    <Link to="/" className="flex items-center gap-2.5 shrink-0 min-w-0">
                        <img src="/img/logo.png" alt={company.name} className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover shrink-0" />
                        <span className="font-sans font-extrabold tracking-tight leading-tight text-[11px] sm:text-base truncate">
                            ABDOU CASSE
                            <br />
                            AUTO
                        </span>
                    </Link>

                    <nav className="hidden lg:flex items-center gap-6">
                        <PublicNavLink to="/" end>
                            Accueil
                        </PublicNavLink>
                        <PublicNavLink to="/pieces-neuves">Pièces neuves</PublicNavLink>
                        <PublicNavLink to="/occasion">Occasion</PublicNavLink>
                        <PublicNavLink to="/contact">Contact</PublicNavLink>
                    </nav>

                    <div className="hidden lg:flex items-center gap-3 shrink-0">
                        <a
                            href={telHref(company.phones[0])}
                            onClick={() => trackEvent('phone_click')}
                            className="btn-secondary"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                            </svg>
                            {company.phones[0]}
                        </a>
                        <Link to="/commander" onClick={() => trackEvent('order_click')} className="btn-primary">
                            Commander une pièce
                        </Link>
                    </div>

                    <button
                        onClick={() => setMobileOpen((o) => !o)}
                        className="lg:hidden relative z-50 w-10 h-10 -mr-2 flex items-center justify-center shrink-0"
                        aria-label={mobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
                        aria-expanded={mobileOpen}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            {mobileOpen ? <path d="M18 6 6 18M6 6l12 12" /> : <path d="M3 6h18M3 12h18M3 18h18" />}
                        </svg>
                    </button>
                </div>

                {mobileOpen && (
                    <div
                        className="lg:hidden fixed inset-x-0 top-16 bottom-0 z-40 bg-black/40"
                        onClick={() => setMobileOpen(false)}
                        aria-hidden="true"
                    />
                )}

                <div
                    className={`lg:hidden fixed inset-x-0 top-16 z-40 bg-white border-t border-neutral-200 shadow-xl overflow-y-auto transition-transform duration-200 ease-out ${
                        mobileOpen ? 'translate-y-0' : '-translate-y-4 opacity-0 pointer-events-none'
                    }`}
                >
                    <nav className="flex flex-col divide-y divide-neutral-100 px-4">
                        <PublicNavLink to="/" end className="block w-full !text-base py-4">
                            Accueil
                        </PublicNavLink>
                        <PublicNavLink to="/pieces-neuves" className="block w-full !text-base py-4">
                            Pièces neuves
                        </PublicNavLink>
                        <PublicNavLink to="/occasion" className="block w-full !text-base py-4">
                            Occasion
                        </PublicNavLink>
                        <PublicNavLink to="/contact" className="block w-full !text-base py-4">
                            Contact
                        </PublicNavLink>
                    </nav>
                    <div className="px-4 pb-6 pt-2 space-y-3">
                        <Link to="/commander" onClick={() => trackEvent('order_click')} className="btn-primary btn-block">
                            Commander une pièce
                        </Link>
                        <a
                            href={telHref(company.phones[0])}
                            onClick={() => trackEvent('phone_click')}
                            className="btn-secondary btn-block"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                            </svg>
                            {company.phones[0]}
                        </a>
                    </div>
                </div>
            </header>

            <main className="flex-1">
                <Outlet />
            </main>

            <footer className="bg-neutral-900 text-white mt-16">
                <div className="max-w-6xl mx-auto px-4 py-12 grid gap-10 sm:gap-8 sm:grid-cols-3 text-center sm:text-left">
                    <div>
                        <div className="flex items-center justify-center sm:justify-start gap-3 mb-3">
                            <img src="/img/logo.png" alt={company.name} className="w-10 h-10 rounded-full object-cover" />
                            <span className="font-extrabold">ABDOU CASSE AUTO</span>
                        </div>
                        <p className="text-sm text-neutral-400">
                            {company.tagline} — {company.city}
                        </p>
                    </div>
                    <div>
                        <h6 className="text-xs font-extrabold uppercase tracking-wide text-neutral-400 mb-3">Contact</h6>
                        <ul className="space-y-1 text-sm">
                            {company.phones.map((phone) => (
                                <li key={phone}>
                                    <a href={telHref(phone)} onClick={() => trackEvent('phone_click')} className="hover:text-accent">
                                        {phone}
                                    </a>
                                </li>
                            ))}
                            <li>
                                <a href={mailHref(company.email)} className="hover:text-accent">
                                    {company.email}
                                </a>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h6 className="text-xs font-extrabold uppercase tracking-wide text-neutral-400 mb-3">Liens</h6>
                        <ul className="space-y-1 text-sm">
                            <li>
                                <Link to="/pieces-neuves" className="hover:text-accent">
                                    Pièces neuves
                                </Link>
                            </li>
                            <li>
                                <Link to="/occasion" className="hover:text-accent">
                                    Occasion — France au revoir
                                </Link>
                            </li>
                            <li>
                                <Link to="/contact" className="hover:text-accent">
                                    Contact
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="border-t border-neutral-800 px-4 py-4 text-center text-xs text-neutral-500">
                    &copy; {new Date().getFullYear()} {company.name} — Paiement à la livraison uniquement. Aucun prix n'est affiché en ligne. ·{' '}
                    <Link to="/admin/login" className="hover:text-accent">
                        Connexion admin
                    </Link>
                </div>
            </footer>

            <Link
                to="/commander"
                onClick={() => trackEvent('order_click')}
                style={{ bottom: 'max(1.25rem, env(safe-area-inset-bottom))' }}
                className="fixed right-5 z-30 btn-primary !px-3.5 !py-2.5 sm:!px-4 shadow-lg animate-[ctaPulse_2.4s_ease-in-out_infinite]"
            >
                <span className="sm:hidden">Commander</span>
                <span className="hidden sm:inline">Commander une pièce</span>
            </Link>
        </div>
    )
}
