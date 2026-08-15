import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { photoUrl } from '../lib/imageUploader'
import PhotoPlaceholder from '../components/PhotoPlaceholder'
import WhatsappLink from '../components/WhatsappLink'

export default function ProductDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [listing, setListing] = useState(undefined) // undefined = loading, null = not found
    const [active, setActive] = useState(0)

    useEffect(() => {
        let cancelled = false

        async function load() {
            setListing(undefined)
            setActive(0)

            try {
                const { data } = await supabase
                    .from('listings')
                    .select('*, brand:brands(*), photos:listing_photos(*)')
                    .eq('id', id)
                    .eq('is_active', true)
                    .maybeSingle()

                if (!cancelled) setListing(data ?? null)
            } catch {
                if (!cancelled) setListing(null)
            }
        }

        load()
        return () => {
            cancelled = true
        }
    }, [id])

    useEffect(() => {
        if (listing === null) {
            navigate('/', { replace: true })
        }
    }, [listing, navigate])

    if (!listing) {
        return <div className="max-w-6xl mx-auto px-4 py-16 text-center text-neutral-500">Chargement…</div>
    }

    const photos = [...(listing.photos ?? [])].sort((a, b) => a.position - b.position)
    const backTo = listing.category === 'neuf' ? '/pieces-neuves' : '/occasion'

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <Link to={backTo} className="btn-ghost mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                Retour au catalogue
            </Link>

            <div className="grid lg:grid-cols-2 gap-10">
                <div>
                    {photos.length > 0 ? (
                        <div>
                            <img
                                src={photoUrl(photos[active].path)}
                                alt={listing.title}
                                className="w-full aspect-[4/3] object-cover mb-3"
                            />
                            {photos.length > 1 && (
                                <div className="grid grid-cols-4 gap-2">
                                    {photos.map((photo, i) => (
                                        <button key={photo.id} type="button" onClick={() => setActive(i)}>
                                            <img
                                                src={photoUrl(photo.path)}
                                                alt=""
                                                className={`w-full aspect-square object-cover ${active === i ? 'ring-2 ring-accent' : ''}`}
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <PhotoPlaceholder className="w-full aspect-[4/3]" />
                    )}
                </div>

                <div>
                    {listing.category === 'neuf' ? (
                        <span className="tag-accent mb-3">Neuf</span>
                    ) : (
                        <span className="tag-accent-2 mb-3">Occasion · France au revoir</span>
                    )}

                    <h1 className="mb-2">{listing.title}</h1>
                    <p className="text-neutral-600 mb-6">
                        {listing.brand?.name}
                        {listing.model ? ` · ${listing.model}` : ''}
                        {listing.year_from
                            ? ` · ${listing.year_from}${
                                  listing.year_to && listing.year_to !== listing.year_from ? `–${listing.year_to}` : ''
                              }`
                            : ''}
                    </p>

                    {listing.description && <p className="text-neutral-700 mb-4">{listing.description}</p>}

                    {listing.item_condition && (
                        <p className="text-sm mb-6">
                            <span className="font-bold">État :</span> {listing.item_condition}
                        </p>
                    )}

                    <div className="bg-accent-100 border border-accent-200 p-4 text-sm mb-6">
                        <strong>Aucun prix affiché en ligne</strong> — paiement à la livraison uniquement. Notre équipe
                        vous contactera pour confirmer la disponibilité et le montant.
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <Link to={`/commander?piece=${listing.id}`} className="btn-primary">
                            Commander cette pièce
                        </Link>
                        <WhatsappLink text={`Bonjour, je suis intéressé(e) par : ${listing.title}`} />
                    </div>
                </div>
            </div>
        </div>
    )
}
