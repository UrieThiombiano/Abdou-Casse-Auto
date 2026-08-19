import { brandLogoPath } from '../lib/brandLogos'

// Logo vectoriel de la marque, si disponible dans le jeu d'icones (ne rend
// rien sinon : l'appelant affiche alors seulement le nom de la marque).
export default function BrandLogo({ name, className = 'w-8 h-8' }) {
    const path = brandLogoPath(name)
    if (!path) return null

    return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className} role="img" aria-label={name}>
            <path d={path} />
        </svg>
    )
}
