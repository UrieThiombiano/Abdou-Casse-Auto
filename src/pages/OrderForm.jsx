import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabaseClient'
import { company } from '../lib/company'
import Reveal from '../components/Reveal'
import { useDocumentTitle } from '../lib/title'

const CURRENT_YEAR = new Date().getFullYear()

export default function OrderForm() {
    useDocumentTitle(`Commander une pièce — ${company.name}`)

    const [searchParams] = useSearchParams()
    const pieceId = searchParams.get('piece')

    const [brands, setBrands] = useState([])
    const [selectedListing, setSelectedListing] = useState(null)
    const [submitted, setSubmitted] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [errors, setErrors] = useState({})

    const [form, setForm] = useState({
        customer_name: '',
        customer_phone: '',
        vin: '',
        brand_id: '',
        model: '',
        version_provenance: '',
        year: '',
        comment: '',
    })

    useEffect(() => {
        supabase
            .from('brands')
            .select('id, name')
            .order('name')
            .then(({ data }) => setBrands(data ?? []))
    }, [])

    useEffect(() => {
        if (!pieceId) return

        supabase
            .from('listings')
            .select('*, brand:brands(*)')
            .eq('id', pieceId)
            .maybeSingle()
            .then(({ data }) => {
                if (!data) return
                setSelectedListing(data)
                setForm((f) => ({ ...f, brand_id: String(data.brand_id), model: data.model ?? '' }))
            })
    }, [pieceId])

    function set(field, value) {
        setForm((f) => ({ ...f, [field]: value }))
    }

    function validate() {
        const e = {}
        if (!form.customer_name.trim()) e.customer_name = 'Le nom complet est requis.'
        else if (form.customer_name.length > 255) e.customer_name = '255 caractères maximum.'

        if (!form.customer_phone.trim()) e.customer_phone = 'Le téléphone est requis.'
        else if (form.customer_phone.length > 30) e.customer_phone = '30 caractères maximum.'

        if (!form.vin.trim()) e.vin = 'Le VIN / n° de châssis est obligatoire.'
        else if (form.vin.trim().length !== 17)
            e.vin = `Le VIN doit comporter exactement 17 caractères (${form.vin.trim().length}/17 actuellement).`

        if (!form.brand_id) e.brand_id = 'La marque est requise.'

        if (form.year) {
            const y = Number(form.year)
            if (!Number.isInteger(y) || y < 1980 || y > CURRENT_YEAR + 1) {
                e.year = `L'année doit être comprise entre 1980 et ${CURRENT_YEAR + 1}.`
            }
        }

        if (form.comment.length > 2000) e.comment = '2000 caractères maximum.'

        setErrors(e)
        return Object.keys(e).length === 0
    }

    async function handleSubmit(e) {
        e.preventDefault()
        if (!validate()) return

        setSubmitting(true)

        const { error } = await supabase.from('orders').insert({
            listing_id: selectedListing?.id ?? null,
            customer_name: form.customer_name,
            customer_phone: form.customer_phone,
            vin: form.vin,
            brand_id: Number(form.brand_id),
            model: form.model || null,
            version_provenance: form.version_provenance || null,
            year: form.year ? Number(form.year) : null,
            comment: form.comment || null,
        })

        setSubmitting(false)

        if (!error) {
            setSubmitted(true)
        } else {
            setErrors({ form: "Une erreur est survenue, veuillez réessayer." })
        }
    }

    if (submitted) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-12">
                <div className="text-center py-12">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.7 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                        className="badge-circle w-20 h-20 bg-accent text-white mx-auto mb-6 flex items-center justify-center"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.15 }}
                        className="mb-3"
                    >
                        Votre demande a été envoyée
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.22 }}
                        className="text-neutral-600 max-w-md mx-auto mb-8"
                    >
                        Notre équipe vous contactera pour confirmer la disponibilité et organiser la livraison. Paiement
                        à la livraison uniquement — aucun paiement en ligne n'est requis.
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                    >
                        <Link to="/" className="btn-primary">
                            Retour à l'accueil
                        </Link>
                    </motion.div>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto px-4 py-12">
            <Reveal as="h1" className="mb-2">
                Commander une pièce
            </Reveal>
            <p className="text-neutral-600 mb-3">
                Aucun paiement en ligne n'est requis. Le règlement se fait uniquement à la livraison.
            </p>
            <p className="border-l-4 border-accent bg-accent/5 px-4 py-3 text-sm text-neutral-700 mb-6">
                {company.guarantee}
            </p>

            {selectedListing && (
                <div className="bg-surface border border-neutral-200 p-4 mb-6 flex items-center justify-between gap-4">
                    <div>
                        <p className="text-xs uppercase font-bold text-neutral-500 mb-1">Pièce sélectionnée</p>
                        <p className="font-bold">{selectedListing.title}</p>
                        <p className="text-sm text-neutral-600">
                            {selectedListing.brand?.name}
                            {selectedListing.model ? ` · ${selectedListing.model}` : ''}
                        </p>
                    </div>
                </div>
            )}

            <Reveal delay={0.1} as="form" onSubmit={handleSubmit} className="space-y-4">
                <div className="field">
                    <label htmlFor="customer_name">Nom complet *</label>
                    <input
                        id="customer_name"
                        className="input"
                        value={form.customer_name}
                        onChange={(e) => set('customer_name', e.target.value)}
                        required
                    />
                    {errors.customer_name && <p className="text-sm text-red-600 mt-1">{errors.customer_name}</p>}
                </div>

                <div className="field">
                    <label htmlFor="customer_phone">Téléphone / WhatsApp *</label>
                    <input
                        id="customer_phone"
                        className="input"
                        value={form.customer_phone}
                        onChange={(e) => set('customer_phone', e.target.value)}
                        required
                    />
                    {errors.customer_phone && <p className="text-sm text-red-600 mt-1">{errors.customer_phone}</p>}
                </div>

                <div className="field">
                    <div className="flex items-baseline justify-between gap-2">
                        <label htmlFor="vin">VIN / N° de châssis *</label>
                        <span className={`text-xs font-bold ${form.vin.trim().length === 17 ? 'text-accent' : 'text-neutral-400'}`}>
                            {form.vin.trim().length}/17
                        </span>
                    </div>
                    <input
                        id="vin"
                        className="input"
                        value={form.vin}
                        onChange={(e) => set('vin', e.target.value)}
                        minLength={17}
                        maxLength={17}
                        required
                    />
                    <p className="text-xs text-neutral-500 mt-1">
                        Ce numéro identifie formellement le véhicule et conditionne la conformité de la pièce livrée.
                        Merci de le vérifier scrupuleusement avant l'envoi : toute erreur de saisie invalidera la
                        commande.
                    </p>
                    {errors.vin && <p className="text-sm text-red-600 mt-1">{errors.vin}</p>}
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
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
                    <div className="field">
                        <label htmlFor="model">Modèle</label>
                        <input id="model" className="input" value={form.model} onChange={(e) => set('model', e.target.value)} />
                    </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
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
                        <label htmlFor="year">Année de fabrication</label>
                        <input id="year" type="number" className="input" value={form.year} onChange={(e) => set('year', e.target.value)} />
                        {errors.year && <p className="text-sm text-red-600 mt-1">{errors.year}</p>}
                    </div>
                </div>

                <div className="field">
                    <label htmlFor="comment">Commentaire (optionnel)</label>
                    <textarea id="comment" className="input" rows="3" value={form.comment} onChange={(e) => set('comment', e.target.value)} />
                    {errors.comment && <p className="text-sm text-red-600 mt-1">{errors.comment}</p>}
                </div>

                {errors.form && <p className="text-sm text-red-600">{errors.form}</p>}

                <button type="submit" className="btn-primary btn-block" disabled={submitting || form.vin.trim().length !== 17}>
                    {submitting ? 'Envoi…' : 'Envoyer la demande'}
                </button>
            </Reveal>
        </div>
    )
}
