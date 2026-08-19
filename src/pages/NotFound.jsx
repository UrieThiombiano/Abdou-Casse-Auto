import { Link } from 'react-router-dom'
import { publicTitle, useDocumentTitle } from '../lib/title'

export default function NotFound() {
    useDocumentTitle(publicTitle('Page introuvable'))

    return (
        <div className="max-w-2xl mx-auto px-4 py-24 text-center">
            <div className="badge-circle w-20 h-20 bg-accent-100 text-accent mx-auto mb-6 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.3-4.3M8 11h6" />
                </svg>
            </div>
            <p className="text-accent font-extrabold uppercase tracking-wide text-sm mb-2">Erreur 404</p>
            <h1 className="mb-3">Page introuvable</h1>
            <p className="text-neutral-600 max-w-md mx-auto mb-8">
                La page que vous cherchez n'existe pas ou plus. Elle a peut-être été déplacée, ou l'adresse comporte une
                erreur.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/" className="btn-primary">
                    Retour à l'accueil
                </Link>
                <Link to="/pieces-neuves" className="btn-secondary">
                    Voir le catalogue
                </Link>
            </div>
        </div>
    )
}
