import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { company, telHref } from '../lib/company'
import WhatsappLink from '../components/WhatsappLink'
import { publicTitle, useDocumentTitle } from '../lib/title'
import { trackEvent } from '../lib/analytics'

export default function Contact() {
    useDocumentTitle(publicTitle('Contact'))

    const [form, setForm] = useState({ name: '', message: '' })
    const [errors, setErrors] = useState({})
    const [status, setStatus] = useState(null)
    const [submitting, setSubmitting] = useState(false)

    function set(field, value) {
        setForm((f) => ({ ...f, [field]: value }))
    }

    function validate() {
        const e = {}
        if (!form.name.trim()) e.name = 'Le nom est requis.'
        else if (form.name.length > 255) e.name = '255 caractères maximum.'

        if (!form.message.trim()) e.message = 'Le message est requis.'
        else if (form.message.length > 2000) e.message = '2000 caractères maximum.'

        setErrors(e)
        return Object.keys(e).length === 0
    }

    async function handleSubmit(e) {
        e.preventDefault()
        if (!validate()) return

        setSubmitting(true)
        const { error } = await supabase.from('contact_messages').insert({ name: form.name, message: form.message })
        setSubmitting(false)

        if (!error) {
            setStatus('Votre message a été envoyé. Notre équipe vous répondra rapidement.')
            setForm({ name: '', message: '' })
            setErrors({})
        } else {
            setErrors({ form: 'Une erreur est survenue, veuillez réessayer.' })
        }
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-12">
            <h1 className="mb-8">Contact</h1>

            <div className="grid lg:grid-cols-2 gap-10">
                <div>
                    <h4 className="mb-3">Coordonnées</h4>
                    <ul className="space-y-1 text-neutral-700 mb-6">
                        {company.phones.map((phone) => (
                            <li key={phone}>
                                <a href={telHref(phone)} onClick={() => trackEvent('phone_click')} className="hover:text-accent">
                                    {phone}
                                </a>
                            </li>
                        ))}
                    </ul>

                    <p className="text-neutral-700 mb-1">
                        <span className="font-bold">Adresse :</span> {company.city}
                    </p>
                    <p className="text-neutral-700 mb-6">
                        <span className="font-bold">Horaires :</span> Service de dépannage 24h/24 — vente de pièces aux
                        heures ouvrées
                    </p>

                    <WhatsappLink className="btn-primary" />

                    {status && <p className="mt-6 text-sm font-bold text-accent">{status}</p>}

                    <form onSubmit={handleSubmit} className="space-y-4 mt-8">
                        <div className="field">
                            <label htmlFor="name">Nom</label>
                            <input id="name" className="input" value={form.name} onChange={(e) => set('name', e.target.value)} required />
                            {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
                        </div>
                        <div className="field">
                            <label htmlFor="message">Message</label>
                            <textarea
                                id="message"
                                className="input"
                                rows="4"
                                value={form.message}
                                onChange={(e) => set('message', e.target.value)}
                                required
                            />
                            {errors.message && <p className="text-sm text-red-600 mt-1">{errors.message}</p>}
                        </div>
                        {errors.form && <p className="text-sm text-red-600">{errors.form}</p>}
                        <button type="submit" className="btn-primary" disabled={submitting}>
                            {submitting ? 'Envoi…' : 'Envoyer'}
                        </button>
                    </form>
                </div>

                <div>
                    <h4 className="mb-3">Localisation</h4>
                    <a
                        href={company.mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => trackEvent('location_click')}
                        className="bg-surface aspect-[4/3] flex flex-col items-center justify-center gap-3 text-center p-6 border border-neutral-200 hover:border-accent transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0Z" />
                            <circle cx="12" cy="10" r="3" />
                        </svg>
                        <span className="font-bold text-ink">
                            {company.name} — {company.city}
                        </span>
                        <span className="btn-primary">Voir sur Google Maps</span>
                    </a>
                </div>
            </div>
        </div>
    )
}
