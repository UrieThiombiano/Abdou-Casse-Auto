import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { storePartRequestPhoto } from '../lib/imageUploader'
import { publicTitle, useDocumentTitle } from '../lib/title'

export default function PartRequestForm() {
    useDocumentTitle(publicTitle('Avez-vous cette pièce ?'))

    const [form, setForm] = useState({ customer_name: '', customer_phone: '', message: '' })
    const [photo, setPhoto] = useState(null)
    const [photoPreview, setPhotoPreview] = useState(null)
    const [errors, setErrors] = useState({})
    const [submitting, setSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState(false)

    function set(field, value) {
        setForm((f) => ({ ...f, [field]: value }))
    }

    function handlePhotoChange(e) {
        const file = e.target.files?.[0] ?? null
        setPhoto(file)
        setPhotoPreview(file ? URL.createObjectURL(file) : null)
    }

    function validate() {
        const e = {}
        if (!form.customer_name.trim()) e.customer_name = 'Le nom complet est requis.'
        else if (form.customer_name.length > 255) e.customer_name = '255 caractères maximum.'

        if (!form.customer_phone.trim()) e.customer_phone = 'Le téléphone est requis.'
        else if (form.customer_phone.length > 30) e.customer_phone = '30 caractères maximum.'

        if (!form.message.trim()) e.message = 'Décrivez la pièce recherchée.'
        else if (form.message.length > 2000) e.message = '2000 caractères maximum.'

        if (!photo) e.photo = 'Une photo de la pièce est requise.'
        else if (photo.size > 8 * 1024 * 1024) e.photo = 'La photo ne doit pas dépasser 8 Mo.'

        setErrors(e)
        return Object.keys(e).length === 0
    }

    async function handleSubmit(e) {
        e.preventDefault()
        if (!validate()) return

        setSubmitting(true)

        try {
            const photo_path = await storePartRequestPhoto(photo)

            const { error } = await supabase.from('part_requests').insert({
                customer_name: form.customer_name,
                customer_phone: form.customer_phone,
                message: form.message,
                photo_path,
            })

            if (error) throw error

            setSubmitted(true)
        } catch {
            setErrors({ form: 'Une erreur est survenue, veuillez réessayer.' })
        } finally {
            setSubmitting(false)
        }
    }

    if (submitted) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-12">
                <div className="text-center py-12">
                    <div
                        className="badge-circle w-20 h-20 bg-accent text-white mx-auto mb-6 flex items-center justify-center"
                        style={{ animation: 'scaleIn .4s ease both' }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                    </div>
                    <h1 className="mb-3">Votre demande a été envoyée</h1>
                    <p className="text-neutral-600 max-w-md mx-auto mb-8">
                        Notre équipe va vérifier la disponibilité de cette pièce et vous contactera rapidement.
                    </p>
                    <Link to="/" className="btn-primary">
                        Retour à l'accueil
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto px-4 py-12">
            <h1 className="mb-2">Avez-vous cette pièce ?</h1>
            <p className="text-neutral-600 mb-6">
                Joignez une photo de la pièce recherchée et décrivez votre besoin — notre équipe vérifie la
                disponibilité et vous recontacte. Aucun paiement en ligne n'est requis.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
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
                    <label htmlFor="message">Décrivez la pièce recherchée *</label>
                    <textarea
                        id="message"
                        className="input"
                        rows="4"
                        value={form.message}
                        onChange={(e) => set('message', e.target.value)}
                        placeholder="Ex : Retroviseur droit pour Toyota Corolla 2016, couleur gris"
                        required
                    />
                    {errors.message && <p className="text-sm text-red-600 mt-1">{errors.message}</p>}
                </div>

                <div className="field">
                    <label htmlFor="photo">Photo de la pièce *</label>
                    <input id="photo" type="file" className="input" accept="image/*" onChange={handlePhotoChange} required />
                    {errors.photo && <p className="text-sm text-red-600 mt-1">{errors.photo}</p>}
                    {photoPreview && (
                        <img src={photoPreview} alt="Aperçu" className="mt-3 w-full max-w-xs aspect-square object-cover" />
                    )}
                </div>

                {errors.form && <p className="text-sm text-red-600">{errors.form}</p>}

                <button type="submit" className="btn-primary btn-block" disabled={submitting}>
                    {submitting ? 'Envoi…' : 'Envoyer la demande'}
                </button>
            </form>
        </div>
    )
}
