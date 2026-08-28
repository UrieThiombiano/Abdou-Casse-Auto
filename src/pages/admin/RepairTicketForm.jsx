import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { adminTitle, useDocumentTitle } from '../../lib/title'

function suggestTicketNumber(existingNumbers) {
    const year = new Date().getFullYear()
    const suffix = `/${year}`
    const sequences = existingNumbers
        .filter((n) => n.endsWith(suffix))
        .map((n) => parseInt(n.split('-')[1], 10))
        .filter((n) => !Number.isNaN(n))
    const next = (sequences.length ? Math.max(...sequences) : 0) + 1
    return `ATL-${String(next).padStart(4, '0')}${suffix}`
}

export default function RepairTicketForm() {
    useDocumentTitle(adminTitle('Nouveau ticket réparation'))
    const navigate = useNavigate()

    const [brands, setBrands] = useState([])
    const [ticketNumber, setTicketNumber] = useState('')
    const [errors, setErrors] = useState({})
    const [saving, setSaving] = useState(false)

    const [form, setForm] = useState({
        customer_name: '',
        customer_phone: '',
        brand_id: '',
        model: '',
        registration_number: '',
        vin: '',
        diagnosis: '',
        entry_date: new Date().toISOString().slice(0, 10),
    })

    useEffect(() => {
        supabase
            .from('brands')
            .select('id, name')
            .order('name')
            .then(({ data }) => setBrands(data ?? []))

        supabase
            .from('repair_tickets')
            .select('ticket_number')
            .then(({ data }) => setTicketNumber(suggestTicketNumber((data ?? []).map((r) => r.ticket_number))))
    }, [])

    function set(field, value) {
        setForm((f) => ({ ...f, [field]: value }))
    }

    function validate() {
        const e = {}
        if (!form.customer_name.trim()) e.customer_name = 'Le nom complet est requis.'
        if (!form.customer_phone.trim()) e.customer_phone = 'Le téléphone est requis.'
        if (!form.brand_id) e.brand_id = 'La marque est requise.'
        if (form.vin.trim() && form.vin.trim().length !== 17)
            e.vin = `Le VIN doit comporter exactement 17 caractères (${form.vin.trim().length}/17 actuellement).`

        setErrors(e)
        return Object.keys(e).length === 0
    }

    async function handleSubmit(e) {
        e.preventDefault()
        if (!validate()) return

        setSaving(true)

        const { data, error } = await supabase
            .from('repair_tickets')
            .insert({
                ticket_number: ticketNumber,
                customer_name: form.customer_name.trim(),
                customer_phone: form.customer_phone.trim(),
                brand_id: Number(form.brand_id),
                model: form.model || null,
                registration_number: form.registration_number || null,
                vin: form.vin.trim() || null,
                diagnosis: form.diagnosis || null,
                entry_date: form.entry_date,
            })
            .select()
            .single()

        setSaving(false)

        if (error) {
            setErrors({ form: 'Une erreur est survenue, veuillez réessayer.' })
            return
        }

        navigate(`/admin/reparations/${data.id}`, { replace: true })
    }

    return (
        <div className="max-w-2xl">
            <Link to="/admin/reparations" className="btn-ghost mb-1 inline-flex">
                ← Réparations
            </Link>
            <h1 className="mb-6">Nouveau ticket réparation</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="card elev-sm p-6 space-y-4">
                    <div className="field">
                        <label>Numéro de ticket</label>
                        <input className="input" value={ticketNumber} disabled />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
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
                    </div>
                </div>

                <div className="card elev-sm p-6 space-y-4">
                    <h4>Véhicule</h4>
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
                            <label htmlFor="registration_number">Numéro d'immatriculation</label>
                            <input
                                id="registration_number"
                                className="input"
                                value={form.registration_number}
                                onChange={(e) => set('registration_number', e.target.value)}
                            />
                        </div>
                        <div className="field">
                            <label htmlFor="entry_date">Date d'entrée *</label>
                            <input
                                id="entry_date"
                                type="date"
                                className="input"
                                value={form.entry_date}
                                onChange={(e) => set('entry_date', e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="field">
                        <div className="flex items-baseline justify-between gap-2">
                            <label htmlFor="vin">VIN / N° de châssis (optionnel, mais recommandé)</label>
                            <span className={`text-xs font-bold ${form.vin.trim().length === 17 ? 'text-accent' : 'text-neutral-400'}`}>
                                {form.vin.trim().length}/17
                            </span>
                        </div>
                        <input id="vin" className="input" value={form.vin} onChange={(e) => set('vin', e.target.value)} maxLength={17} />
                        {errors.vin && <p className="text-sm text-red-600 mt-1">{errors.vin}</p>}
                    </div>

                    <div className="field">
                        <label htmlFor="diagnosis">Motif / panne signalée</label>
                        <textarea
                            id="diagnosis"
                            className="input"
                            rows="3"
                            value={form.diagnosis}
                            onChange={(e) => set('diagnosis', e.target.value)}
                            placeholder="Ex : Bruit moteur au démarrage, vidange à faire"
                        />
                    </div>
                </div>

                {errors.form && <p className="text-sm text-red-600">{errors.form}</p>}

                <div className="flex gap-3">
                    <button type="submit" className="btn-primary" disabled={saving}>
                        {saving ? 'Ouverture…' : 'Ouvrir le ticket'}
                    </button>
                    <Link to="/admin/reparations" className="btn-secondary">
                        Annuler
                    </Link>
                </div>
            </form>
        </div>
    )
}
