import { useState } from 'react'
import { Link, Outlet } from 'react-router-dom'
import PublicNavLink from './PublicNavLink'
import RouteTracker from './RouteTracker'
import SmoothScroll from './SmoothScroll'
import { company, telHref, mailHref } from '../lib/company'
import { trackEvent } from '../lib/analytics'

export default function PublicLayout() {
    const [mobileOpen, setMobileOpen] = useState(false)

    return (
        <div className="bg-bg text-ink antialiased min-h-screen flex flex-col">
            <SmoothScroll />
            <RouteTracker />
            <header className="sticky top-0 z-40 bg-white border-b border-neutral-200">
                <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
                    <Link to="/" className="flex items-center gap-3 shrink-0">
                        <img src="/img/logo.jpg" alt={company.name} className="w-10 h-10 rounded-full object-cover" />
                        <span className="font-sans font-extrabold tracking-tight leading-none hidden sm:block">
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

                    <button onClick={() => setMobileOpen((o) => !o)} className="lg:hidden" aria-label="Menu">
                        <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 6h18M3 12h18M3 18h18" />
                        </svg>
                    </button>
                </div>

                {mobileOpen && (
                    <div className="lg:hidden border-t border-neutral-200 bg-white px-4 py-4 space-y-3">
                        <PublicNavLink to="/" end className="block">
                            Accueil
                        </PublicNavLink>
                        <PublicNavLink to="/pieces-neuves" className="block">
                            Pièces neuves
                        </PublicNavLink>
                        <PublicNavLink to="/occasion" className="block">
                            Occasion
                        </PublicNavLink>
                        <PublicNavLink to="/contact" className="block">
                            Contact
                        </PublicNavLink>
                        <Link to="/commander" onClick={() => trackEvent('order_click')} className="btn-primary btn-block">
                            Commander une pièce
                        </Link>
                        <a
                            href={telHref(company.phones[0])}
                            onClick={() => trackEvent('phone_click')}
                            className="btn-secondary btn-block"
                        >
                            {company.phones[0]}
                        </a>
                    </div>
                )}
            </header>

            <main className="flex-1">
                <Outlet />
            </main>

            <footer className="bg-neutral-900 text-white mt-16">
                <div className="max-w-6xl mx-auto px-4 py-12 grid gap-8 sm:grid-cols-3">
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <img src="/img/logo.jpg" alt={company.name} className="w-10 h-10 rounded-full object-cover" />
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
                className="fixed bottom-5 right-5 z-30 btn-primary shadow-lg animate-[ctaPulse_2.4s_ease-in-out_infinite]"
            >
                Commander une pièce
            </Link>
        </div>
    )
}
