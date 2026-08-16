import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { storePartRequestPhoto } from '../lib/imageUploader'

const EMPTY_FORM = { customer_name: '', customer_phone: '', message: '' }

export default function PartRequestButton() {
    const [open, setOpen] = useState(false)
    const [form, setForm] = useState(EMPTY_FORM)
    const [photo, setPhoto] = useState(null)
    const [photoPreview, setPhotoPreview] = useState(null)
    const [errors, setErrors] = useState({})
    const [submitting, setSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState(false)

    useEffect(() => {
        if (!open) return

        function onKeyDown(e) {
            if (e.key === 'Escape') close()
        }
        document.addEventListener('keydown', onKeyDown)
        return () => document.removeEventListener('keydown', onKeyDown)
    }, [open])

    function set(field, value) {
        setForm((f) => ({ ...f, [field]: value }))
    }

    function handlePhotoChange(e) {
        const file = e.target.files?.[0] ?? null
        setPhoto(file)
        setPhotoPreview(file ? URL.createObjectURL(file) : null)
    }

    function close() {
        setOpen(false)
        setForm(EMPTY_FORM)
        setPhoto(null)
        setPhotoPreview(null)
        setErrors({})
        setSubmitted(false)
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

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="fixed bottom-5 left-5 z-30 btn-secondary !bg-white shadow-lg"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                </svg>
                Avez-vous cette pièce ?
            </button>

            {open && (
                <div
                    className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
                    onClick={(e) => e.target === e.currentTarget && close()}
                >
                    <div className="bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 sm:p-8 relative">
                        <button
                            type="button"
                            onClick={close}
                            aria-label="Fermer"
                            className="absolute top-4 right-4 text-neutral-500 hover:text-ink"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M18 6 6 18M6 6l12 12" />
                            </svg>
                        </button>

                        {submitted ? (
                            <div className="text-center py-8">
                                <div
                                    className="badge-circle w-16 h-16 bg-accent text-white mx-auto mb-5 flex items-center justify-center"
                                    style={{ animation: 'scaleIn .4s ease both' }}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                </div>
                                <h3 className="mb-2">Votre demande a été envoyée</h3>
                                <p className="text-neutral-600 text-sm mb-6">
                                    Notre équipe va vérifier la disponibilité de cette pièce et vous contactera rapidement.
                                </p>
                                <button type="button" onClick={close} className="btn-primary">
                                    Fermer
                                </button>
                            </div>
                        ) : (
                            <>
                                <h3 className="mb-2">Avez-vous cette pièce ?</h3>
                                <p className="text-sm text-neutral-600 mb-5">
                                    Joignez une photo de la pièce recherchée et décrivez votre besoin — notre équipe
                                    vérifie la disponibilité et vous recontacte.
                                </p>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="field">
                                        <label htmlFor="pr_customer_name">Nom complet *</label>
                                        <input
                                            id="pr_customer_name"
                                            className="input"
                                            value={form.customer_name}
                                            onChange={(e) => set('customer_name', e.target.value)}
                                            required
                                        />
                                        {errors.customer_name && <p className="text-sm text-red-600 mt-1">{errors.customer_name}</p>}
                                    </div>

                                    <div className="field">
                                        <label htmlFor="pr_customer_phone">Téléphone / WhatsApp *</label>
                                        <input
                                            id="pr_customer_phone"
                                            className="input"
                                            value={form.customer_phone}
                                            onChange={(e) => set('customer_phone', e.target.value)}
                                            required
                                        />
                                        {errors.customer_phone && <p className="text-sm text-red-600 mt-1">{errors.customer_phone}</p>}
                                    </div>

                                    <div className="field">
                                        <label htmlFor="pr_message">Décrivez la pièce recherchée *</label>
                                        <textarea
                                            id="pr_message"
                                            className="input"
                                            rows="3"
                                            value={form.message}
                                            onChange={(e) => set('message', e.target.value)}
                                            placeholder="Ex : Retroviseur droit pour Toyota Corolla 2016, couleur gris"
                                            required
                                        />
                                        {errors.message && <p className="text-sm text-red-600 mt-1">{errors.message}</p>}
                                    </div>

                                    <div className="field">
                                        <label htmlFor="pr_photo">Photo de la pièce *</label>
                                        <input
                                            id="pr_photo"
                                            type="file"
                                            className="input"
                                            accept="image/*"
                                            onChange={handlePhotoChange}
                                            required
                                        />
                                        {errors.photo && <p className="text-sm text-red-600 mt-1">{errors.photo}</p>}
                                        {photoPreview && (
                                            <img src={photoPreview} alt="Aperçu" className="mt-3 w-full max-w-[160px] aspect-square object-cover" />
                                        )}
                                    </div>

                                    {errors.form && <p className="text-sm text-red-600">{errors.form}</p>}

                                    <button type="submit" className="btn-primary btn-block" disabled={submitting}>
                                        {submitting ? 'Envoi…' : 'Envoyer la demande'}
                                    </button>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    )
}
