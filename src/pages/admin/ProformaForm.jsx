import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import ProformaDocument from '../../components/ProformaDocument'
import { downloadElementAsPdf } from '../../lib/pdfExport'
import { formatCFA } from '../../lib/numberToWords'
import { adminTitle, useDocumentTitle } from '../../lib/title'

const EMPTY_ITEM = { designation: '', quantity: '', unitPrice: '' }

function emptyForm() {
    return {
        number: '',
        issueDate: new Date().toISOString().slice(0, 10),
        clientName: '',
        clientAddress: '',
        clientPhone: '',
        clientRccm: '',
        clientIfu: '',
        clientRni: '',
        object: '',
        registrationNumber: '',
        chassisNumber: '',
        items: [{ ...EMPTY_ITEM }],
    }
}

function suggestNumber(existingNumbers) {
    const year = new Date().getFullYear()
    const suffix = `/${year}`
    const sequences = existingNumbers
        .filter((n) => n.endsWith(suffix))
        .map((n) => parseInt(n.split('/')[0], 10))
        .filter((n) => !Number.isNaN(n))
    const next = (sequences.length ? Math.max(...sequences) : 0) + 1
    return `${String(next).padStart(4, '0')}${suffix}`
}

export default function ProformaForm() {
    const { id } = useParams()
    const navigate = useNavigate()

    const [form, setForm] = useState(emptyForm)
    const [mode, setMode] = useState(id ? 'preview' : 'edit')
    const [recordId, setRecordId] = useState(id ? Number(id) : null)
    const [errors, setErrors] = useState({})
    const [saving, setSaving] = useState(false)
    const [loading, setLoading] = useState(Boolean(id))
    const [downloading, setDownloading] = useState(false)

    useDocumentTitle(adminTitle(id ? `Proforma ${form.number || ''}` : 'Nouvelle proforma'))

    useEffect(() => {
        if (!id) {
            supabase
                .from('proformas')
                .select('number')
                .then(({ data }) => {
                    setForm((f) => ({ ...f, number: suggestNumber((data ?? []).map((r) => r.number)) }))
                })
            return
        }

        supabase
            .from('proformas')
            .select('*')
            .eq('id', id)
            .maybeSingle()
            .then(({ data }) => {
                if (!data) {
                    navigate('/admin/proformas', { replace: true })
                    return
                }
                setRecordId(data.id)
                setForm({
                    number: data.number,
                    issueDate: data.issue_date,
                    clientName: data.client_name,
                    clientAddress: data.client_address ?? '',
                    clientPhone: data.client_phone ?? '',
                    clientRccm: data.client_rccm ?? '',
                    clientIfu: data.client_ifu ?? '',
                    clientRni: data.client_rni ?? '',
                    object: data.object ?? '',
                    registrationNumber: data.registration_number ?? '',
                    chassisNumber: data.chassis_number ?? '',
                    items: data.items?.length ? data.items : [{ ...EMPTY_ITEM }],
                })
                setLoading(false)
            })
    }, [id, navigate])

    function set(field, value) {
        setForm((f) => ({ ...f, [field]: value }))
    }

    function setItem(index, field, value) {
        setForm((f) => {
            const items = [...f.items]
            items[index] = { ...items[index], [field]: value }
            return { ...f, items }
        })
    }

    function addItem() {
        setForm((f) => ({ ...f, items: [...f.items, { ...EMPTY_ITEM }] }))
    }

    function removeItem(index) {
        setForm((f) => ({ ...f, items: f.items.filter((_, i) => i !== index) }))
    }

    const total = form.items.reduce((sum, it) => sum + (Number(it.quantity) || 0) * (Number(it.unitPrice) || 0), 0)

    function validate() {
        const e = {}
        if (!form.number.trim()) e.number = 'Le numéro est requis.'
        if (!form.clientName.trim()) e.clientName = 'Le client est requis.'

        const validItems = form.items.filter(
            (it) => it.designation.trim() && Number(it.quantity) > 0 && Number(it.unitPrice) > 0
        )
        if (validItems.length === 0) {
            e.items = 'Ajoutez au moins une désignation avec quantité et prix unitaire.'
        }

        setErrors(e)
        return Object.keys(e).length === 0
    }

    async function handlePreview(e) {
        e.preventDefault()
        if (!validate()) return

        setSaving(true)

        const payload = {
            number: form.number.trim(),
            issue_date: form.issueDate,
            client_name: form.clientName.trim(),
            client_address: form.clientAddress || null,
            client_phone: form.clientPhone || null,
            client_rccm: form.clientRccm || null,
            client_ifu: form.clientIfu || null,
            client_rni: form.clientRni || null,
            object: form.object || null,
            registration_number: form.registrationNumber || null,
            chassis_number: form.chassisNumber || null,
            items: form.items.filter((it) => it.designation.trim() || it.quantity || it.unitPrice),
            total_amount: total,
        }

        let error
        let savedId = recordId

        if (recordId) {
            ;({ error } = await supabase.from('proformas').update(payload).eq('id', recordId))
        } else {
            const { data, error: insertError } = await supabase.from('proformas').insert(payload).select().single()
            error = insertError
            if (data) {
                savedId = data.id
                setRecordId(data.id)
            }
        }

        setSaving(false)

        if (error) {
            setErrors({
                form: error.code === '23505' ? 'Ce numéro de facture existe déjà.' : 'Une erreur est survenue, veuillez réessayer.',
            })
            return
        }

        setMode('preview')
        if (!id && savedId) navigate(`/admin/proformas/${savedId}`, { replace: true })
    }

    async function handleDownload() {
        setDownloading(true)
        try {
            await downloadElementAsPdf('proforma-paper', `proforma-${form.number.replace(/\//g, '-')}.pdf`)
        } finally {
            setDownloading(false)
        }
    }

    if (loading) {
        return <div className="text-neutral-500 py-12 text-center">Chargement…</div>
    }

    const documentData = {
        number: form.number,
        issueDate: form.issueDate,
        clientName: form.clientName,
        clientAddress: form.clientAddress,
        clientPhone: form.clientPhone,
        clientRccm: form.clientRccm,
        clientIfu: form.clientIfu,
        clientRni: form.clientRni,
        object: form.object,
        registrationNumber: form.registrationNumber,
        chassisNumber: form.chassisNumber,
        items: form.items.filter((it) => it.designation || it.quantity || it.unitPrice),
    }

    if (mode === 'preview') {
        return (
            <div>
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <div>
                        <Link to="/admin/proformas" className="btn-ghost mb-1 inline-flex">
                            ← Historique des proformas
                        </Link>
                        <h1>Proforma {form.number}</h1>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <button onClick={() => setMode('edit')} className="btn-secondary">
                            Modifier
                        </button>
                        <button onClick={() => window.print()} className="btn-secondary">
                            Imprimer
                        </button>
                        <button onClick={handleDownload} className="btn-primary" disabled={downloading}>
                            {downloading ? 'Génération…' : 'Télécharger PDF'}
                        </button>
                    </div>
                </div>

                <div className="card elev-sm p-4 sm:p-8 overflow-x-auto">
                    <ProformaDocument data={documentData} />
                </div>
            </div>
        )
    }

    return (
        <div>
            <h1 className="mb-6">{id ? 'Modifier la proforma' : 'Nouvelle proforma'}</h1>

            <form onSubmit={handlePreview} className="space-y-6">
                <div className="card elev-sm p-6 space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="field">
                            <label htmlFor="number">Numéro de facture *</label>
                            <input
                                id="number"
                                className="input"
                                value={form.number}
                                onChange={(e) => set('number', e.target.value)}
                                required
                            />
                            {errors.number && <p className="text-sm text-red-600 mt-1">{errors.number}</p>}
                        </div>
                        <div className="field">
                            <label htmlFor="issueDate">Date *</label>
                            <input
                                id="issueDate"
                                type="date"
                                className="input"
                                value={form.issueDate}
                                onChange={(e) => set('issueDate', e.target.value)}
                                required
                            />
                        </div>
                    </div>
                </div>

                <div className="card elev-sm p-6 space-y-4">
                    <h4>Client</h4>
                    <div className="field">
                        <label htmlFor="clientName">Nom / raison sociale *</label>
                        <input
                            id="clientName"
                            className="input"
                            value={form.clientName}
                            onChange={(e) => set('clientName', e.target.value)}
                            required
                        />
                        {errors.clientName && <p className="text-sm text-red-600 mt-1">{errors.clientName}</p>}
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="field">
                            <label htmlFor="clientAddress">Adresse</label>
                            <input
                                id="clientAddress"
                                className="input"
                                value={form.clientAddress}
                                onChange={(e) => set('clientAddress', e.target.value)}
                            />
                        </div>
                        <div className="field">
                            <label htmlFor="clientPhone">Téléphone</label>
                            <input
                                id="clientPhone"
                                className="input"
                                value={form.clientPhone}
                                onChange={(e) => set('clientPhone', e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="grid sm:grid-cols-3 gap-4">
                        <div className="field">
                            <label htmlFor="clientRccm">RCCM</label>
                            <input
                                id="clientRccm"
                                className="input"
                                value={form.clientRccm}
                                onChange={(e) => set('clientRccm', e.target.value)}
                            />
                        </div>
                        <div className="field">
                            <label htmlFor="clientIfu">IFU</label>
                            <input id="clientIfu" className="input" value={form.clientIfu} onChange={(e) => set('clientIfu', e.target.value)} />
                        </div>
                        <div className="field">
                            <label htmlFor="clientRni">RNI</label>
                            <input id="clientRni" className="input" value={form.clientRni} onChange={(e) => set('clientRni', e.target.value)} />
                        </div>
                    </div>
                </div>

                <div className="card elev-sm p-6 space-y-4">
                    <h4>Objet de la facture</h4>
                    <div className="field">
                        <label htmlFor="object">Objet</label>
                        <input
                            id="object"
                            className="input"
                            placeholder="Ex : Fourniture de pièces HILUX"
                            value={form.object}
                            onChange={(e) => set('object', e.target.value)}
                        />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="field">
                            <label htmlFor="registrationNumber">Numéro d'immatriculation</label>
                            <input
                                id="registrationNumber"
                                className="input"
                                value={form.registrationNumber}
                                onChange={(e) => set('registrationNumber', e.target.value)}
                            />
                        </div>
                        <div className="field">
                            <label htmlFor="chassisNumber">Numéro de châssis</label>
                            <input
                                id="chassisNumber"
                                className="input"
                                value={form.chassisNumber}
                                onChange={(e) => set('chassisNumber', e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="card elev-sm p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h4>Désignations</h4>
                        <button type="button" onClick={addItem} className="btn-ghost">
                            + Ajouter une ligne
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Désignation</th>
                                    <th className="w-28">Quantité</th>
                                    <th className="w-36">Prix unitaire</th>
                                    <th className="w-36">Prix total</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {form.items.map((item, i) => (
                                    <tr key={i}>
                                        <td>
                                            <input
                                                className="input"
                                                value={item.designation}
                                                onChange={(e) => setItem(i, 'designation', e.target.value)}
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="number"
                                                min="0"
                                                className="input"
                                                value={item.quantity}
                                                onChange={(e) => setItem(i, 'quantity', e.target.value)}
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="number"
                                                min="0"
                                                className="input"
                                                value={item.unitPrice}
                                                onChange={(e) => setItem(i, 'unitPrice', e.target.value)}
                                            />
                                        </td>
                                        <td className="text-right font-bold px-3">
                                            {item.quantity && item.unitPrice
                                                ? formatCFA(Number(item.quantity) * Number(item.unitPrice))
                                                : ''}
                                        </td>
                                        <td>
                                            {form.items.length > 1 && (
                                                <button type="button" onClick={() => removeItem(i)} className="btn-ghost !text-red-600">
                                                    Retirer
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {errors.items && <p className="text-sm text-red-600">{errors.items}</p>}

                    <div className="text-right pt-2 border-t border-neutral-200">
                        <span className="text-sm text-neutral-600 mr-2">Total général :</span>
                        <span className="text-lg font-extrabold">{formatCFA(total)} F CFA</span>
                    </div>
                </div>

                {errors.form && <p className="text-sm text-red-600">{errors.form}</p>}

                <div className="flex gap-3">
                    <button type="submit" className="btn-primary" disabled={saving}>
                        {saving ? 'Enregistrement…' : 'Aperçu — Lire le proforma'}
                    </button>
                    <Link to="/admin/proformas" className="btn-secondary">
                        Annuler
                    </Link>
                </div>
            </form>
        </div>
    )
}
