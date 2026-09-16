import { company } from '../lib/company'

export default function ShopPhoto({ className = 'aspect-[4/3]' }) {
    return (
        <div className={`relative overflow-hidden border border-neutral-200 ${className}`}>
            <img
                src="/img/magasin.jpeg"
                alt={`Façade du magasin ${company.name}`}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-neutral-900/80 via-neutral-900/20 to-transparent px-4 pt-10 pb-4 pointer-events-none">
                <p className="text-white font-bold text-sm drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]">{company.name}</p>
                <p className="text-neutral-200 text-xs drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]">{company.address}</p>
            </div>
        </div>
    )
}
