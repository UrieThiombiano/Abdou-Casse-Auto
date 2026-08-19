import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { formatCFA } from '../../lib/numberToWords'
import {
    SOURCE_TYPES,
    CONDITIONS,
    manualOrderStatusesFor,
    suggestDeliveryDate,
} from '../../lib/manualOrderStatus'
import { adminTitle, useDocumentTitle } from '../../lib/title'

function emptyForm() {
    return {
        customerName: '',
        customerPhone: '',
        sourceType: 'entrepot_bassinko',
        condition: 'neuf',
        description: '',
        totalAmount: '',
        depositAmount: '',
        estimatedDeliveryDate: suggestDeliveryDate('entrepot_bassinko'),
        status: 'en_cours',
    }
}

export default function ManualOrderForm() {
    const { id } = useParams()
    const navigate = useNavigate()

    const [form, setForm] = useState(emptyForm)
    const [dateTouched, setDateTouched] = useState(false)
    const [errors, setErrors] = useState({})
    const [saving, setSaving] = useState(false)
    const [loading, setLoading] = useState(Boolean(id))

    useDocumentTitle(adminTitle(id ? 'Modifier la commande' : 'Nouvelle commande'))

    useEffect(() => {
        if (!id) return

        supabase
            .from('manual_orders')
            .select('*')
            .eq('id', id)
            .maybeSingle()
            .then(({ data }) => {
                if (!data) {
                    navigate('/admin/carnet-de-commandes', { replace: true })
                    return
                }
                setDateTouched(true)
                setForm({
                    customerName: data.customer_name,
                    customerPhone: data.customer_phone,
                    sourceType: data.source_type,
                    condition: data.condition,
                    description: data.description,
                    totalAmount: String(data.total_amount),
                    depositAmount: String(data.deposit_amount),
                    estimatedDeliveryDate: data.estimated_delivery_date ?? '',
                    status: data.status,
                })
                setLoading(false)
            })
    }, [id, navigate])

    function set(field, value) {
        setForm((f) => ({ ...f, [field]: value }))
    }

    function setSourceType(value) {
        setForm((f) => ({
            ...f,
            sourceType: value,
            estimatedDeliveryDate: dateTouched ? f.estimatedDeliveryDate : suggestDeliveryDate(value),
            status: manualOrderStatusesFor(value).some((s) => s.value === f.status) ? f.status : 'en_cours',
        }))
    }

    const total = Number(form.totalAmount) || 0
    const deposit = Number(form.depositAmount) || 0
    const balance = Math.max(0, total - deposit)

    function validate() {
        const e = {}
        if (!form.customerName.trim()) e.customerName = 'Le nom du client est requis.'
        if (!form.customerPhone.trim()) e.customerPhone = 'Le téléphone est requis.'
        if (!form.description.trim()) e.description = 'La description de la commande est requise.'
        if (total <= 0) e.totalAmount = 'Le prix total doit être supérieur à 0.'
        if (deposit > total) e.depositAmount = "L'avance ne peut pas dépasser le prix total."
        setErrors(e)
        return Object.keys(e).length === 0
    }

    async function handleSubmit(e) {
        e.preventDefault()
        if (!validate()) return

        setSaving(true)

        const payload = {
            customer_name: form.customerName.trim(),
            customer_phone: form.customerPhone.trim(),
            source_type: form.sourceType,
            condition: form.condition,
            description: form.description.trim(),
            total_amount: total,
            deposit_amount: deposit,
            estimated_delivery_date: form.estimatedDeliveryDate || null,
            status: form.status,
        }

        const { error } = id
            ? await supabase.from('manual_orders').update(payload).eq('id', id)
            : await supabase.from('manual_orders').insert(payload)

        setSaving(false)

        if (error) {
            setErrors({ form: 'Une erreur est survenue, veuillez réessayer.' })
            return
        }

        navigate('/admin/carnet-de-commandes')
    }

    if (loading) {
        return <div className="text-neutral-500 py-12 text-center">Chargement…</div>
    }

    const availableStatuses = manualOrderStatusesFor(form.sourceType)

    return (
        <div>
            <Link to="/admin/carnet-de-commandes" className="btn-ghost mb-1 inline-flex">
                ← Carnet de commandes
            </Link>
            <h1 className="mb-6">{id ? 'Modifier la commande' : 'Nouvelle commande hors site'}</h1>

            <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
                <div className="card elev-sm p-6 space-y-4">
                    <h4>Client</h4>
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="field">
                            <label htmlFor="customerName">Nom et prénom *</label>
                            <input
                                id="customerName"
                                className="input"
                                value={form.customerName}
                                onChange={(e) => set('customerName', e.target.value)}
                                required
                            />
                            {errors.customerName && <p className="text-sm text-red-600 mt-1">{errors.customerName}</p>}
                        </div>
                        <div className="field">
                            <label htmlFor="customerPhone">Téléphone / WhatsApp *</label>
                            <input
                                id="customerPhone"
                                className="input"
                                value={form.customerPhone}
                                onChange={(e) => set('customerPhone', e.target.value)}
                                required
                            />
                            {errors.customerPhone && <p className="text-sm text-red-600 mt-1">{errors.customerPhone}</p>}
                        </div>
                    </div>
                </div>

                <div className="card elev-sm p-6 space-y-4">
                    <h4>Commande</h4>
                    <div className="field">
                        <label htmlFor="description">Pièce(s) commandée(s) *</label>
                        <textarea
                            id="description"
                            className="input"
                            rows={3}
                            value={form.description}
                            onChange={(e) => set('description', e.target.value)}
                            required
                        />
                        {errors.description && <p className="text-sm text-red-600 mt-1">{errors.description}</p>}
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="field">
                            <label htmlFor="sourceType">Origine *</label>
                            <select
                                id="sourceType"
                                className="input"
                                value={form.sourceType}
                                onChange={(e) => setSourceType(e.target.value)}
                            >
                                {SOURCE_TYPES.map((s) => (
                                    <option key={s.value} value={s.value}>
                                        {s.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="field">
                            <label htmlFor="condition">État de la pièce *</label>
                            <select
                                id="condition"
                                className="input"
                                value={form.condition}
                                onChange={(e) => set('condition', e.target.value)}
                            >
                                {CONDITIONS.map((c) => (
                                    <option key={c.value} value={c.value}>
                                        {c.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="field">
                        <label htmlFor="estimatedDeliveryDate">Délai de livraison estimé</label>
                        <input
                            id="estimatedDeliveryDate"
                            type="date"
                            className="input"
                            value={form.estimatedDeliveryDate}
                            onChange={(e) => {
                                setDateTouched(true)
                                set('estimatedDeliveryDate', e.target.value)
                            }}
                        />
                        <p className="text-xs text-neutral-500 mt-1">
                            Suggestion automatique : ~1 semaine pour l'entrepôt Bassinko, ~1 à 3 mois pour une commande
                            extérieure. Modifiable librement.
                        </p>
                    </div>

                    <div className="field">
                        <label htmlFor="status">Statut</label>
                        <select id="status" className="input" value={form.status} onChange={(e) => set('status', e.target.value)}>
                            {availableStatuses.map((s) => (
                                <option key={s.value} value={s.value}>
                                    {s.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="card elev-sm p-6 space-y-4">
                    <h4>Paiement</h4>
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="field">
                            <label htmlFor="totalAmount">Prix total (F CFA) *</label>
                            <input
                                id="totalAmount"
                                type="number"
                                min="0"
                                className="input"
                                value={form.totalAmount}
                                onChange={(e) => set('totalAmount', e.target.value)}
                                required
                            />
                            {errors.totalAmount && <p className="text-sm text-red-600 mt-1">{errors.totalAmount}</p>}
                        </div>
                        <div className="field">
                            <label htmlFor="depositAmount">Avance payée (F CFA)</label>
                            <input
                                id="depositAmount"
                                type="number"
                                min="0"
                                className="input"
                                value={form.depositAmount}
                                onChange={(e) => set('depositAmount', e.target.value)}
                            />
                            {errors.depositAmount && <p className="text-sm text-red-600 mt-1">{errors.depositAmount}</p>}
                        </div>
                    </div>
                    <div className="text-right pt-2 border-t border-neutral-200">
                        <span className="text-sm text-neutral-600 mr-2">Reste à payer :</span>
                        <span className="text-lg font-extrabold">{formatCFA(balance)} F CFA</span>
                    </div>
                </div>

                {errors.form && <p className="text-sm text-red-600">{errors.form}</p>}

                <div className="flex gap-3">
                    <button type="submit" className="btn-primary" disabled={saving}>
                        {saving ? 'Enregistrement…' : 'Enregistrer'}
                    </button>
                    <Link to="/admin/carnet-de-commandes" className="btn-secondary">
                        Annuler
                    </Link>
                </div>
            </form>
        </div>
    )
}
