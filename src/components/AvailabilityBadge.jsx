import { SUR_COMMANDE_DELAY } from '../lib/availability'

export default function AvailabilityBadge({ availability, compact = false, className = '' }) {
    const inStock = availability !== 'sur_commande'

    const text = inStock
        ? compact
            ? 'En stock'
            : 'En stock — disponible au magasin'
        : compact
          ? 'Sur commande'
          : `Sur commande — ${SUR_COMMANDE_DELAY}`

    return (
        <span className={`inline-flex items-center gap-1.5 text-xs font-bold ${inStock ? 'text-green-700' : 'text-accent-2-700'} ${className}`}>
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${inStock ? 'bg-green-600' : 'bg-accent-2'}`} />
            {text}
        </span>
    )
}
