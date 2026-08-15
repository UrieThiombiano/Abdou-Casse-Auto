import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { storeCompressedPhoto, deleteStoredPhoto, photoUrl } from '../../lib/imageUploader'
import Pagination from '../../components/Pagination'
import { adminTitle, useDocumentTitle } from '../../lib/title'

const PER_PAGE = 15
const CURRENT_YEAR = new Date().getFullYear()

const EMPTY_FORM = {
    title: '',
    category: 'neuf',
    brand_id: '',
    model: '',
    year_from: '',
    year_to: '',
    version_provenance: '',
    item_condition: '',
    description: '',
}

export default function ListingsManager() {
    useDocumentTitle(adminTitle('Annonces'))

    const [brands, setBrands] = useState([])
    const [listings, setListings] = useState([])
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)

    const [filterCategory, setFilterCategory] = useState('')
    const [filterBrand, setFilterBrand] = useState('')

    const [showForm, setShowForm] = useState(false)
    const [editingId, setEditingId] = useState(null)
    const [editingPhotos, setEditingPhotos] = useState([])
    const [form, setForm] = useState(EMPTY_FORM)
    const [newPhotos, setNewPhotos] = useState([])
    const [errors, setErrors] = useState({})
    const [saving, setSaving] = useState(false)
    const [uploading, setUploading] = useState(false)

    useEffect(() => {
        supabase
            .from('brands')
            .select('id, name')
            .order('name')
            .then(({ data }) => setBrands(data ?? []))
    }, [])

    const fetchListings = useCallback(async () => {
        try {
            let query = supabase.from('listings').select('*, brand:brands(*), photos:listing_photos(*)', { count: 'exact' })

            if (filterCategory) query = query.eq('category', filterCategory)
            if (filterBrand) query = query.eq('brand_id', filterBrand)

            const from = (page - 1) * PER_PAGE
            const to = from + PER_PAGE - 1

            const { data, count } = await query.order('created_at', { ascending: false }).range(from, to)

            setListings(data ?? [])
            setTotal(count ?? 0)
        } catch {
            setListings([])
            setTotal(0)
        }
    }, [filterCategory, filterBrand, page])

    useEffect(() => {
        fetchListings()
    }, [fetchListings])

    function set(field, value) {
        setForm((f) => ({ ...f, [field]: value }))
    }

    function resetForm() {
        setShowForm(false)
        setEditingId(null)
        setEditingPhotos([])
        setForm(EMPTY_FORM)
        setNewPhotos([])
        setErrors({})
    }

    function createNew() {
        resetForm()
        setShowForm(true)
    }

    function edit(listing) {
        setEditingId(listing.id)
        setEditingPhotos([...(listing.photos ?? [])].sort((a, b) => a.position - b.position))
        setForm({
            title: listing.title,
            category: listing.category,
            brand_id: String(listing.brand_id),
            model: listing.model ?? '',
            year_from: listing.year_from ?? '',
            year_to: listing.year_to ?? '',
            version_provenance: listing.version_provenance ?? '',
            item_condition: listing.item_condition ?? '',
            description: listing.description ?? '',
        })
        setNewPhotos([])
        setErrors({})
        setShowForm(true)
    }

    function validate() {
        const e = {}
        const maxYear = CURRENT_YEAR + 1

        if (!form.title.trim()) e.title = 'Le titre est requis.'
        if (!form.brand_id) e.brand_id = 'La marque est requise.'

        if (form.year_from && (form.year_from < 1980 || form.year_from > maxYear)) {
            e.year_from = `Année comprise entre 1980 et ${maxYear}.`
        }
        if (form.year_to && (form.year_to < 1980 || form.year_to > maxYear)) {
            e.year_to = `Année comprise entre 1980 et ${maxYear}.`
        }
        if (form.year_from && form.year_to && Number(form.year_to) < Number(form.year_from)) {
            e.year_to = "L'année 'à' doit être supérieure ou égale à l'année 'de'."
        }

        setErrors(e)
        return Object.keys(e).length === 0
    }

    async function handleSave(e) {
        e.preventDefault()
        if (!validate()) return

        setSaving(true)

        const payload = {
            title: form.title,
            category: form.category,
            brand_id: Number(form.brand_id),
            model: form.model || null,
            year_from: form.year_from ? Number(form.year_from) : null,
            year_to: form.year_to ? Number(form.year_to) : null,
            version_provenance: form.version_provenance || null,
            item_condition: form.item_condition || null,
            description: form.description || null,
        }

        let listingId = editingId

        if (editingId) {
            await supabase.from('listings').update(payload).eq('id', editingId)
        } else {
            const { data, error } = await supabase.from('listings').insert(payload).select().single()
            if (error) {
                setSaving(false)
                setErrors({ form: "Une erreur est survenue, veuillez réessayer." })
                return
            }
            listingId = data.id
        }

        if (newPhotos.length > 0) {
            setUploading(true)
            const { data: existing } = await supabase
                .from('listing_photos')
                .select('position')
                .eq('listing_id', listingId)
                .order('position', { ascending: false })
                .limit(1)

            let nextPosition = (existing?.[0]?.position ?? -1) + 1

            for (const file of newPhotos) {
                try {
                    const path = await storeCompressedPhoto(file, `listings/${listingId}`)
                    await supabase.from('listing_photos').insert({ listing_id: listingId, path, position: nextPosition++ })
                } catch {
                    // on continue meme si une photo echoue, comme cote PHP la validation bloque en amont
                }
            }
            setUploading(false)
        }

        setSaving(false)
        resetForm()
        fetchListings()
    }

    async function handleDeletePhoto(photo) {
        if (!window.confirm('Supprimer cette photo ?')) return

        await deleteStoredPhoto(photo.path)
        await supabase.from('listing_photos').delete().eq('id', photo.id)

        setEditingPhotos((photos) => photos.filter((p) => p.id !== photo.id))
        fetchListings()
    }

    async function handleDeleteListing(listing) {
        if (!window.confirm('Supprimer cette annonce ?')) return

        for (const photo of listing.photos ?? []) {
            await deleteStoredPhoto(photo.path)
        }
        await supabase.from('listings').delete().eq('id', listing.id)

        if (editingId === listing.id) resetForm()
        fetchListings()
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
                <h1>Annonces</h1>
                <button onClick={createNew} className="btn-primary">
                    + Nouvelle annonce
                </button>
            </div>

            {showForm && (
                <div className="card elev-sm p-6 mb-8">
                    <h4 className="mb-4">{editingId ? "Modifier l'annonce" : 'Nouvelle annonce'}</h4>

                    <form onSubmit={handleSave} className="space-y-4">
                        <div className="field">
                            <label htmlFor="title">Titre *</label>
                            <input id="title" className="input" value={form.title} onChange={(e) => set('title', e.target.value)} required />
                            {errors.title && <p className="text-sm text-red-600 mt-1">{errors.title}</p>}
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="field">
                                <label>Rubrique *</label>
                                <div className="seg">
                                    <button
                                        type="button"
                                        onClick={() => set('category', 'neuf')}
                                        className={`seg-opt ${form.category === 'neuf' ? 'is-active' : ''}`}
                                    >
                                        Neuf
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => set('category', 'occasion')}
                                        className={`seg-opt ${form.category === 'occasion' ? 'is-active' : ''}`}
                                    >
                                        Occasion
                                    </button>
                                </div>
                            </div>
                            <div className="field">
                                <label htmlFor="brand_id">Marque *</label>
                                <select id="brand_id" className="input" value={form.brand_id} onChange={(e) => set('brand_id', e.target.value)} required>
                                    <option value="">Sélectionner</option>
                                    {brands.map((b) => (
                                        <option key={b.id} value={b.id}>
                                            {b.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.brand_id && <p className="text-sm text-red-600 mt-1">{errors.brand_id}</p>}
                            </div>
                        </div>

                        <div className="grid sm:grid-cols-3 gap-4">
                            <div className="field">
                                <label htmlFor="model">Modèle</label>
                                <input id="model" className="input" value={form.model} onChange={(e) => set('model', e.target.value)} />
                            </div>
                            <div className="field">
                                <label htmlFor="year_from">Année (de)</label>
                                <input id="year_from" type="number" className="input" value={form.year_from} onChange={(e) => set('year_from', e.target.value)} />
                                {errors.year_from && <p className="text-sm text-red-600 mt-1">{errors.year_from}</p>}
                            </div>
                            <div className="field">
                                <label htmlFor="year_to">Année (à)</label>
                                <input id="year_to" type="number" className="input" value={form.year_to} onChange={(e) => set('year_to', e.target.value)} />
                                {errors.year_to && <p className="text-sm text-red-600 mt-1">{errors.year_to}</p>}
                            </div>
                        </div>

                        <div className="field">
                            <label htmlFor="version_provenance">Version / provenance</label>
                            <input
                                id="version_provenance"
                                className="input"
                                value={form.version_provenance}
                                onChange={(e) => set('version_provenance', e.target.value)}
                            />
                        </div>

                        <div className="field">
                            <label htmlFor="item_condition">État</label>
                            <input
                                id="item_condition"
                                className="input"
                                placeholder="Ex : Bon état, fonctionnel"
                                value={form.item_condition}
                                onChange={(e) => set('item_condition', e.target.value)}
                            />
                        </div>

                        <div className="field">
                            <label htmlFor="description">Description</label>
                            <textarea id="description" className="input" rows="4" value={form.description} onChange={(e) => set('description', e.target.value)} />
                        </div>

                        {editingId && editingPhotos.length > 0 && (
                            <div className="field">
                                <label>Photos actuelles</label>
                                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                                    {editingPhotos.map((photo) => (
                                        <div key={photo.id} className="relative group">
                                            <img src={photoUrl(photo.path)} className="w-full aspect-square object-cover" alt="" />
                                            <button
                                                type="button"
                                                onClick={() => handleDeletePhoto(photo)}
                                                className="absolute top-1 right-1 bg-neutral-900/80 text-white w-6 h-6 flex items-center justify-center text-xs"
                                            >
                                                &times;
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="field">
                            <label htmlFor="newPhotos">Ajouter des photos</label>
                            <input
                                id="newPhotos"
                                type="file"
                                className="input"
                                multiple
                                accept="image/*"
                                onChange={(e) => setNewPhotos(Array.from(e.target.files ?? []))}
                            />
                            {uploading && <div className="text-xs text-neutral-500 mt-1">Chargement des photos…</div>}
                        </div>

                        {errors.form && <p className="text-sm text-red-600">{errors.form}</p>}

                        <div className="flex gap-3">
                            <button type="submit" className="btn-primary" disabled={saving}>
                                {saving ? 'Enregistrement…' : editingId ? 'Enregistrer' : "Créer l'annonce"}
                            </button>
                            <button type="button" onClick={resetForm} className="btn-secondary">
                                Annuler
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="flex flex-wrap gap-4 mb-4">
                <div className="field !mb-0 w-44">
                    <select
                        className="input"
                        value={filterCategory}
                        onChange={(e) => {
                            setFilterCategory(e.target.value)
                            setPage(1)
                        }}
                    >
                        <option value="">Toutes les rubriques</option>
                        <option value="neuf">Neuf</option>
                        <option value="occasion">Occasion</option>
                    </select>
                </div>
                <div className="field !mb-0 w-44">
                    <select
                        className="input"
                        value={filterBrand}
                        onChange={(e) => {
                            setFilterBrand(e.target.value)
                            setPage(1)
                        }}
                    >
                        <option value="">Toutes les marques</option>
                        {brands.map((b) => (
                            <option key={b.id} value={b.id}>
                                {b.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="card elev-sm overflow-x-auto">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Titre</th>
                            <th>Rubrique</th>
                            <th>Marque</th>
                            <th>Année</th>
                            <th>Photos</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {listings.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="text-center text-neutral-500 py-6">
                                    Aucune annonce.
                                </td>
                            </tr>
                        ) : (
                            listings.map((listing) => (
                                <tr key={listing.id}>
                                    <td className="font-bold">{listing.title}</td>
                                    <td>{listing.category === 'neuf' ? 'Neuf' : 'Occasion'}</td>
                                    <td>{listing.brand?.name}</td>
                                    <td>
                                        {listing.year_from ?? '—'}
                                        {listing.year_to && listing.year_to !== listing.year_from ? `–${listing.year_to}` : ''}
                                    </td>
                                    <td>{listing.photos?.length ?? 0}</td>
                                    <td className="text-right whitespace-nowrap">
                                        <button onClick={() => edit(listing)} className="btn-ghost">
                                            Modifier
                                        </button>{' '}
                                        <button onClick={() => handleDeleteListing(listing)} className="btn-ghost !text-red-600">
                                            Supprimer
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="mt-4">
                <Pagination page={page} perPage={PER_PAGE} total={total} onChange={setPage} />
            </div>
        </div>
    )
}
