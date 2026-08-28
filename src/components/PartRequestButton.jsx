import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { storePartRequestPhotos } from '../lib/imageUploader'

const EMPTY_FORM = { customer_name: '', customer_phone: '', vin: '', message: '' }
const MAX_PHOTOS = 5

export default function PartRequestButton() {
    const [open, setOpen] = useState(false)
    const [form, setForm] = useState(EMPTY_FORM)
    const [photos, setPhotos] = useState([])
    const [photoPreviews, setPhotoPreviews] = useState([])
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
        const files = Array.from(e.target.files ?? []).slice(0, MAX_PHOTOS)
        e.target.value = ''

        setPhotos((current) => {
            const next = [...current, ...files].slice(0, MAX_PHOTOS)
            setPhotoPreviews((previews) => {
                previews.forEach((url) => URL.revokeObjectURL(url))
                return next.map((f) => URL.createObjectURL(f))
            })
            return next
        })
    }

    function removePhoto(index) {
        setPhotos((current) => current.filter((_, i) => i !== index))
        setPhotoPreviews((current) => {
            URL.revokeObjectURL(current[index])
            return current.filter((_, i) => i !== index)
        })
    }

    function close() {
        setOpen(false)
        setForm(EMPTY_FORM)
        photoPreviews.forEach((url) => URL.revokeObjectURL(url))
        setPhotos([])
        setPhotoPreviews([])
        setErrors({})
        setSubmitted(false)
    }

    function validate() {
        const e = {}
        if (!form.customer_name.trim()) e.customer_name = 'Le nom complet est requis.'
        else if (form.customer_name.length > 255) e.customer_name = '255 caractères maximum.'

        if (!form.customer_phone.trim()) e.customer_phone = 'Le téléphone est requis.'
        else if (form.customer_phone.length > 30) e.customer_phone = '30 caractères maximum.'

        if (form.vin.trim() && form.vin.trim().length !== 17)
            e.vin = `Le VIN doit comporter exactement 17 caractères (${form.vin.trim().length}/17 actuellement).`

        if (!form.message.trim()) e.message = 'Décrivez la pièce recherchée.'
        else if (form.message.length > 2000) e.message = '2000 caractères maximum.'

        if (photos.length === 0) e.photo = 'Au moins une photo de la pièce est requise.'
        else if (photos.length > MAX_PHOTOS) e.photo = `${MAX_PHOTOS} photos maximum.`
        else if (photos.some((p) => p.size > 8 * 1024 * 1024)) e.photo = 'Chaque photo ne doit pas dépasser 8 Mo.'

        setErrors(e)
        return Object.keys(e).length === 0
    }

    async function handleSubmit(e) {
        e.preventDefault()
        if (!validate()) return

        setSubmitting(true)

        try {
            const photo_paths = await storePartRequestPhotos(photos)

            const { error } = await supabase.from('part_requests').insert({
                customer_name: form.customer_name,
                customer_phone: form.customer_phone,
                vin: form.vin.trim() || null,
                message: form.message,
                photo_paths,
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
                                    Joignez une ou plusieurs photos de la pièce recherchée et décrivez votre besoin — notre équipe
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
                                        <div className="flex items-baseline justify-between gap-2">
                                            <label htmlFor="pr_vin">VIN / N° de châssis (optionnel, mais recommandé)</label>
                                            <span className={`text-xs font-bold ${form.vin.trim().length === 17 ? 'text-accent' : 'text-neutral-400'}`}>
                                                {form.vin.trim().length}/17
                                            </span>
                                        </div>
                                        <input
                                            id="pr_vin"
                                            className="input"
                                            value={form.vin}
                                            onChange={(e) => set('vin', e.target.value)}
                                            maxLength={17}
                                        />
                                        <p className="text-xs text-neutral-500 mt-1">
                                            S'il est renseigné, le VIN doit comporter exactement 17 caractères — il
                                            nous permet de confirmer plus vite la compatibilité de la pièce.
                                        </p>
                                        {errors.vin && <p className="text-sm text-red-600 mt-1">{errors.vin}</p>}
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
                                        <label htmlFor="pr_photo">Photos de la pièce * ({photos.length}/{MAX_PHOTOS})</label>
                                        <input
                                            id="pr_photo"
                                            type="file"
                                            className="input"
                                            accept="image/*"
                                            multiple
                                            onChange={handlePhotoChange}
                                            disabled={photos.length >= MAX_PHOTOS}
                                            required={photos.length === 0}
                                        />
                                        <p className="text-xs text-neutral-500 mt-1">
                                            Jusqu'à {MAX_PHOTOS} photos. Pour une identification plus fiable, ajoutez
                                            si possible : la pièce elle-même, la partie concernée sur le véhicule, et
                                            le véhicule complet.
                                        </p>
                                        {errors.photo && <p className="text-sm text-red-600 mt-1">{errors.photo}</p>}
                                        {photoPreviews.length > 0 && (
                                            <div className="mt-3 flex flex-wrap gap-3">
                                                {photoPreviews.map((url, i) => (
                                                    <div key={url} className="relative">
                                                        <img
                                                            src={url}
                                                            alt={`Aperçu ${i + 1}`}
                                                            className="w-20 h-20 object-cover"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => removePhoto(i)}
                                                            aria-label="Retirer cette photo"
                                                            className="absolute -top-2 -right-2 w-5 h-5 bg-ink text-white text-xs flex items-center justify-center rounded-full"
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
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
