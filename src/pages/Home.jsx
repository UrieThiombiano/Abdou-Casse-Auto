import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { company, telHref } from '../lib/company'
import { publicTitle, useDocumentTitle } from '../lib/title'

const REASSURANCE_ITEMS = [
    { label: 'Service 24h/24', text: 'Dépannage et assistance à toute heure' },
    { label: 'Paiement livraison', text: 'Aucun paiement en ligne requis' },
    { label: 'Livraison Ouaga', text: company.deliveryZone },
    { label: 'Téléphone', text: company.phones[0] },
]

export default function Home() {
    useDocumentTitle(publicTitle('Accueil'))

    const [brands, setBrands] = useState([])
    const [brand, setBrand] = useState('')
    const navigate = useNavigate()

    useEffect(() => {
        supabase
            .from('brands')
            .select('id, name')
            .order('name')
            .then(({ data }) => setBrands(data ?? []))
    }, [])

    function handleSearch(e) {
        e.preventDefault()
        navigate(`/pieces-neuves${brand ? `?marque=${brand}` : ''}`)
    }

    return (
        <>
            <section className="bg-neutral-900 text-white">
                <div className="max-w-6xl mx-auto px-4 py-16 sm:py-24 grid lg:grid-cols-3 gap-10 items-center">
                    <div className="lg:col-span-2" style={{ animation: 'fadeInUp .6s ease both' }}>
                        <h1 className="text-white text-4xl sm:text-5xl mb-4">PIÈCES AUTO NEUVES &amp; D'OCCASION</h1>
                        <p className="text-neutral-300 text-lg mb-8 max-w-xl">
                            Trouvez la pièce qu'il vous faut par marque de véhicule. Commande en ligne, paiement à la
                            livraison uniquement — {company.deliveryZone}.
                        </p>

                        <form onSubmit={handleSearch} className="bg-white p-4 flex flex-col sm:flex-row gap-3 max-w-xl">
                            <div className="field flex-1 !mb-0">
                                <label htmlFor="hero-marque" className="!text-neutral-500">
                                    Marque
                                </label>
                                <select
                                    id="hero-marque"
                                    className="input !bg-surface !text-ink"
                                    value={brand}
                                    onChange={(e) => setBrand(e.target.value)}
                                >
                                    <option value="">Toutes les marques</option>
                                    {brands.map((b) => (
                                        <option key={b.id} value={b.id}>
                                            {b.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <button type="submit" className="btn-primary sm:self-end">
                                Rechercher
                            </button>
                        </form>

                        <Link to="/occasion" className="btn-secondary !border-neutral-600 !text-white mt-6 inline-flex">
                            Voir les pièces d'occasion — France au revoir
                        </Link>
                    </div>

                    <div className="bg-neutral-800 p-6 border-t-4 border-accent" style={{ animation: 'fadeInUp .6s .1s ease both' }}>
                        <div className="badge-circle w-14 h-14 bg-accent text-white font-extrabold text-xs text-center mb-4 flex items-center justify-center">
                            24h/24
                        </div>
                        <h3 className="text-white mb-2">Dépannage Service 24h/24</h3>
                        <p className="text-neutral-400 text-sm mb-4">
                            Une urgence sur la route ? Notre équipe de dépannage reste joignable à toute heure.
                        </p>
                        <a href={telHref(company.phones[0])} className="btn-secondary !border-neutral-600 !text-white btn-block">
                            {company.phones[0]}
                        </a>
                    </div>
                </div>
            </section>

            <section className="max-w-6xl mx-auto px-4 py-16">
                <div className="grid gap-5 sm:grid-cols-3">
                    <Link
                        to="/pieces-neuves"
                        className="card elev-sm border-t-4 border-accent p-6 hover:shadow-lg transition-shadow"
                        style={{ animation: 'fadeInUp .5s ease both' }}
                    >
                        <h3 className="mb-2">Pièces neuves</h3>
                        <p className="text-sm text-neutral-600 mb-4">Catalogue de pièces neuves, filtrable par marque et année.</p>
                        <span className="btn-ghost">Voir le catalogue →</span>
                    </Link>
                    <Link
                        to="/occasion"
                        className="card elev-sm border-t-4 border-accent-2 p-6 hover:shadow-lg transition-shadow"
                        style={{ animation: 'fadeInUp .5s .1s ease both' }}
                    >
                        <h3 className="mb-2">Occasion — France au revoir</h3>
                        <p className="text-sm text-neutral-600 mb-4">Pièces d'occasion importées, état vérifié, photos réelles.</p>
                        <span className="btn-ghost">Voir le catalogue →</span>
                    </Link>
                    <Link
                        to="/commander"
                        className="card elev-sm border-t-4 border-neutral-800 p-6 hover:shadow-lg transition-shadow"
                        style={{ animation: 'fadeInUp .5s .2s ease both' }}
                    >
                        <h3 className="mb-2">Commander</h3>
                        <p className="text-sm text-neutral-600 mb-4">Demandez la pièce qu'il vous faut, sans paiement en ligne.</p>
                        <span className="btn-ghost">Commander →</span>
                    </Link>
                </div>
            </section>

            <section className="bg-surface py-16">
                <div className="max-w-6xl mx-auto px-4 grid gap-8 sm:grid-cols-2 lg:grid-cols-4 text-center">
                    {REASSURANCE_ITEMS.map((item, i) => (
                        <div key={item.label} style={{ animation: `fadeInUp .5s ${i * 0.1}s ease both` }}>
                            <div className="badge-circle w-16 h-16 bg-accent text-white mx-auto mb-3 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" />
                                    <path d="M12 6v6l4 2" />
                                </svg>
                            </div>
                            <h5 className="mb-1">{item.label}</h5>
                            <p className="text-sm text-neutral-600">{item.text}</p>
                        </div>
                    ))}
                </div>
            </section>
        </>
    )
}
