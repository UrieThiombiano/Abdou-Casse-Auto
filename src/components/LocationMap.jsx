import { company } from '../lib/company'
import { trackEvent } from '../lib/analytics'

export default function LocationMap({ className = 'aspect-[4/3]' }) {
    const query = encodeURIComponent(`${company.name}, ${company.city}`)

    return (
        <div className={`relative overflow-hidden border border-neutral-200 ${className}`}>
            <iframe
                title={`Localisation — ${company.name}`}
                src={`https://www.google.com/maps?q=${query}&output=embed`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0 w-full h-full"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-neutral-900/80 via-neutral-900/20 to-transparent px-4 pt-10 pb-4 pointer-events-none">
                <p className="text-white font-bold text-sm drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]">
                    {company.name} — {company.city}
                </p>
            </div>
            <a
                href={company.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent('location_click')}
                className="btn-primary absolute bottom-4 right-4 text-xs"
            >
                Voir sur Google Maps
            </a>
        </div>
    )
}
