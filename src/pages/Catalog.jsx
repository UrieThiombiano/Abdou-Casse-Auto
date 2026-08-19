import { useCallback, useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabaseClient'
import { photoUrl } from '../lib/imageUploader'
import PhotoPlaceholder from '../components/PhotoPlaceholder'
import Pagination from '../components/Pagination'
import PartRequestButton from '../components/PartRequestButton'
import AvailabilityBadge from '../components/AvailabilityBadge'
import Reveal from '../components/Reveal'
import { publicTitle, useDocumentTitle } from '../lib/title'

const MotionLink = motion(Link)

const PER_PAGE = 12
const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: CURRENT_YEAR - 1990 + 1 }, (_, i) => CURRENT_YEAR - i)

const HEADER_BACKGROUNDS = {
    neuf: {
        src: '/img/catalogue-neuf.jpg',
        alt: 'Pièces auto neuves rangées en atelier',
    },
    occasion: {
        src: '/img/catalogue-occasion.jpg',
        alt: "Moteurs et pièces d'occasion récupérés",
    },
}

export default function Catalog({ category }) {
    const [searchParams, setSearchParams] = useSearchParams()
    const brand = searchParams.get('marque') ?? ''
    const year = searchParams.get('annee') ?? ''
    const page = Number(searchParams.get('page') ?? '1')

    const [brands, setBrands] = useState([])
    const [listings, setListings] = useState([])
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        supabase
            .from('brands')
            .select('id, name')
            .order('name')
            .then(({ data }) => setBrands(data ?? []))
    }, [])

    const fetchListings = useCallback(async () => {
        setLoading(true)

        try {
            let query = supabase
                .from('listings')
                .select('*, brand:brands(*), photos:listing_photos(*)', { count: 'exact' })
                .eq('is_active', true)
                .eq('category', category)

            if (brand) query = query.eq('brand_id', brand)
            if (year) {
                query = query
                    .or(`year_from.is.null,year_from.lte.${year}`)
                    .or(`year_to.is.null,year_to.gte.${year}`)
            }

            const from = (page - 1) * PER_PAGE
            const to = from + PER_PAGE - 1

            const { data, count } = await query.order('created_at', { ascending: false }).range(from, to)

            setListings(data ?? [])
            setTotal(count ?? 0)
        } catch {
            setListings([])
            setTotal(0)
        } finally {
            setLoading(false)
        }
    }, [category, brand, year, page])

    useEffect(() => {
        fetchListings()
    }, [fetchListings])

    function updateParam(key, value) {
        const next = new URLSearchParams(searchParams)
        if (value) next.set(key, value)
        else next.delete(key)
        next.delete('page')
        setSearchParams(next)
    }

    function goToPage(p) {
        const next = new URLSearchParams(searchParams)
        next.set('page', String(p))
        setSearchParams(next)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const title = category === 'neuf' ? 'Pièces neuves' : "Occasion — France au revoir"
    const headerBg = HEADER_BACKGROUNDS[category]
    useDocumentTitle(publicTitle(title))

    const otherCategoryPath = category === 'neuf' ? '/occasion' : '/pieces-neuves'
    const otherCategoryLabel = category === 'neuf' ? 'occasion' : 'neuf'

    return (
        <div>
            <div className="relative overflow-hidden bg-neutral-900 text-white">
                <div className="absolute inset-0">
                    <img src={headerBg.src} alt={headerBg.alt} className="w-full h-full object-cover opacity-90" />
                    <div className="absolute inset-0 bg-gradient-to-r from-neutral-900/85 via-neutral-900/55 to-neutral-900/15" />
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/60 via-transparent to-transparent" />
                </div>

                <div className="relative max-w-6xl mx-auto px-4 py-14 sm:py-20">
                    <Reveal as="h1" className="mb-6 text-white">
                        {title}
                    </Reveal>
                    <Reveal delay={0.1}>
                        <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 flex flex-wrap gap-4 shadow-xl max-w-xl">
                            <div className="field !mb-0 w-44">
                                <label className="!text-white/90">Marque</label>
                                <select
                                    className="input input-glass"
                                    value={brand}
                                    onChange={(e) => updateParam('marque', e.target.value)}
                                >
                                    <option value="">Toutes les marques</option>
                                    {brands.map((b) => (
                                        <option key={b.id} value={b.id}>
                                            {b.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="field !mb-0 w-32">
                                <label className="!text-white/90">Année</label>
                                <select
                                    className="input input-glass"
                                    value={year}
                                    onChange={(e) => updateParam('annee', e.target.value)}
                                >
                                    <option value="">Toutes</option>
                                    {YEARS.map((y) => (
                                        <option key={y} value={y}>
                                            {y}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </Reveal>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-8">
                {loading ? (
                    <div className="text-sm text-neutral-500 mb-6">Chargement…</div>
                ) : (
                    <>
                        <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
                            <p className="text-sm text-neutral-600">
                                {total} résultat{total > 1 ? 's' : ''}
                            </p>
                            {brand && (
                                <Link to={`${otherCategoryPath}?marque=${brand}`} className="btn-ghost">
                                    Voir aussi en {otherCategoryLabel} →
                                </Link>
                            )}
                        </div>

                        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {listings.length === 0 ? (
                                <p className="col-span-full text-neutral-500 py-12 text-center">
                                    Aucune annonce ne correspond à ces critères pour le moment.
                                </p>
                            ) : (
                                listings.map((listing, i) => {
                                    const sortedPhotos = [...(listing.photos ?? [])].sort((a, b) => a.position - b.position)
                                    const firstPhoto = sortedPhotos[0]

                                    return (
                                        <Reveal key={listing.id} delay={Math.min(i, 8) * 0.05} amount={0.1}>
                                            <MotionLink
                                                whileHover={{ y: -6 }}
                                                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                                to={`/produit/${listing.id}`}
                                                className="card elev-sm hover:shadow-xl transition-shadow overflow-hidden block h-full"
                                            >
                                                {firstPhoto ? (
                                                    <img
                                                        src={photoUrl(firstPhoto.path)}
                                                        alt={listing.title}
                                                        className="w-full aspect-[4/3] object-cover"
                                                    />
                                                ) : (
                                                    <PhotoPlaceholder />
                                                )}
                                                <div className="p-4">
                                                    <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                                                        {listing.category === 'neuf' ? (
                                                            <span className="tag-accent">Neuf</span>
                                                        ) : (
                                                            <span className="tag-accent-2">Occasion · France au revoir</span>
                                                        )}
                                                        <AvailabilityBadge availability={listing.availability} compact />
                                                    </div>
                                                    <h4 className="mb-1">{listing.title}</h4>
                                                    <p className="text-sm text-neutral-600">
                                                        {listing.brand?.name}
                                                        {listing.model ? ` · ${listing.model}` : ''}
                                                        {listing.year_from
                                                            ? ` · ${listing.year_from}${
                                                                  listing.year_to && listing.year_to !== listing.year_from
                                                                      ? `–${listing.year_to}`
                                                                      : ''
                                                              }`
                                                            : ''}
                                                    </p>
                                                </div>
                                            </MotionLink>
                                        </Reveal>
                                    )
                                })
                            )}
                        </div>

                        <div className="mt-8">
                            <Pagination page={page} perPage={PER_PAGE} total={total} onChange={goToPage} />
                        </div>
                    </>
                )}
            </div>

            <PartRequestButton />
        </div>
    )
}
