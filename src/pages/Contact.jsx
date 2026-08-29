import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { company, telHref, mailHref } from '../lib/company'
import WhatsappLink from '../components/WhatsappLink'
import LocationMap from '../components/LocationMap'
import Reveal from '../components/Reveal'
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
            <Reveal as="h1" className="mb-8">
                Contact
            </Reveal>

            <div className="grid lg:grid-cols-2 gap-10">
                <Reveal direction="right">
                    <h4 className="mb-3">Coordonnées</h4>
                    <ul className="space-y-1 text-neutral-700 mb-6">
                        {company.phones.map((phone) => (
                            <li key={phone}>
                                <a href={telHref(phone)} onClick={() => trackEvent('phone_click')} className="hover:text-accent">
                                    {phone}
                                </a>
                            </li>
                        ))}
                        <li>
                            <a href={mailHref(company.email)} className="hover:text-accent">
                                {company.email}
                            </a>
                        </li>
                    </ul>

                    <p className="text-neutral-700 mb-1">
                        <span className="font-bold">Adresse :</span> {company.city}
                    </p>
                    <p className="text-neutral-700 mb-1">
                        <span className="font-bold">Horaires :</span> {company.hours}
                    </p>
                    <p className="text-neutral-500 text-sm mb-6">{company.hoursNote}</p>

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
                </Reveal>

                <Reveal direction="left" delay={0.1}>
                    <h4 className="mb-3">Localisation</h4>
                    <LocationMap />
                </Reveal>
            </div>
        </div>
    )
}
