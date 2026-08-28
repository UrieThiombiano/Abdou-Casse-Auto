import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { formatCFA } from '../../lib/numberToWords'
import { REPAIR_ITEM_TYPES, repairItemTypeLabel, repairTicketStatusLabel } from '../../lib/repairTicketStatus'
import { downloadElementAsPdf } from '../../lib/pdfExport'
import RepairTicketDocument from '../../components/RepairTicketDocument'
import { adminTitle, useDocumentTitle } from '../../lib/title'

const EMPTY_ITEM = { type: 'piece', description: '', quantity: '1', unit_price: '' }
const EMPTY_PAYMENT = { amount: '', paid_at: new Date().toISOString().slice(0, 10), note: '' }

function formatDateFr(isoDate) {
    if (!isoDate) return ''
    const [year, month, day] = isoDate.split('-')
    return `${day}/${month}/${year}`
}

export default function RepairTicketDetail() {
    const { id } = useParams()
    const navigate = useNavigate()

    const [ticket, setTicket] = useState(null)
    const [items, setItems] = useState([])
    const [payments, setPayments] = useState([])
    const [loading, setLoading] = useState(true)

    const [itemForm, setItemForm] = useState(EMPTY_ITEM)
    const [paymentForm, setPaymentForm] = useState(EMPTY_PAYMENT)
    const [exitDate, setExitDate] = useState(new Date().toISOString().slice(0, 10))
    const [showClose, setShowClose] = useState(false)
    const [errors, setErrors] = useState({})
    const [downloading, setDownloading] = useState(false)

    useDocumentTitle(adminTitle(ticket ? `Ticket ${ticket.ticket_number}` : 'Réparation'))

    const load = useCallback(async () => {
        const [{ data: t }, { data: i }, { data: p }] = await Promise.all([
            supabase.from('repair_tickets').select('*, brand:brands(name)').eq('id', id).maybeSingle(),
            supabase.from('repair_ticket_items').select('*').eq('ticket_id', id).order('created_at'),
            supabase.from('repair_ticket_payments').select('*').eq('ticket_id', id).order('paid_at'),
        ])

        if (!t) {
            navigate('/admin/reparations', { replace: true })
            return
        }

        setTicket(t)
        setItems(i ?? [])
        setPayments(p ?? [])
        setLoading(false)
    }, [id, navigate])

    useEffect(() => {
        load()
    }, [load])

    async function addItem(e) {
        e.preventDefault()
        const quantity = Number(itemForm.quantity)
        const unitPrice = Number(itemForm.unit_price)

        if (!itemForm.description.trim() || !(quantity > 0) || !(unitPrice >= 0)) {
            setErrors({ item: 'Renseignez une désignation, une quantité et un prix valides.' })
            return
        }

        setErrors({})
        const { error } = await supabase.from('repair_ticket_items').insert({
            ticket_id: id,
            type: itemForm.type,
            description: itemForm.description.trim(),
            quantity,
            unit_price: unitPrice,
        })

        if (error) {
            setErrors({ item: 'Une erreur est survenue, veuillez réessayer.' })
            return
        }

        setItemForm({ ...EMPTY_ITEM, type: itemForm.type })
        load()
    }

    async function removeItem(itemId) {
        await supabase.from('repair_ticket_items').delete().eq('id', itemId)
        load()
    }

    async function addPayment(e) {
        e.preventDefault()
        const amount = Number(paymentForm.amount)

        if (!(amount > 0)) {
            setErrors({ payment: 'Le montant doit être supérieur à 0.' })
            return
        }

        setErrors({})
        const { error } = await supabase.from('repair_ticket_payments').insert({
            ticket_id: id,
            amount,
            paid_at: paymentForm.paid_at,
            note: paymentForm.note || null,
        })

        if (error) {
            setErrors({ payment: 'Une erreur est survenue, veuillez réessayer.' })
            return
        }

        setPaymentForm(EMPTY_PAYMENT)
        load()
    }

    async function removePayment(paymentId) {
        await supabase.from('repair_ticket_payments').delete().eq('id', paymentId)
        load()
    }

    async function closeTicket() {
        await supabase.from('repair_tickets').update({ status: 'sorti', exit_date: exitDate }).eq('id', id)
        setShowClose(false)
        load()
    }

    async function reopenTicket() {
        await supabase.from('repair_tickets').update({ status: 'en_cours', exit_date: null }).eq('id', id)
        load()
    }

    async function handleDownload() {
        setDownloading(true)
        try {
            await downloadElementAsPdf('repair-ticket-paper', `${ticket.ticket_number.replace(/\//g, '-')}.pdf`)
        } finally {
            setDownloading(false)
        }
    }

    if (loading) {
        return <div className="text-neutral-500 py-12 text-center">Chargement…</div>
    }

    const balance = ticket.total_amount - ticket.amount_paid
    const isOpen = ticket.status === 'en_cours'

    return (
        <div>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div>
                    <Link to="/admin/reparations" className="btn-ghost mb-1 inline-flex">
                        ← Réparations
                    </Link>
                    <h1>
                        {ticket.ticket_number} · {ticket.customer_name}
                    </h1>
                    <p className="text-sm text-neutral-600">
                        {ticket.brand?.name}
                        {ticket.model ? ` ${ticket.model}` : ''}
                        {ticket.registration_number ? ` · ${ticket.registration_number}` : ''} — Entré le{' '}
                        {formatDateFr(ticket.entry_date)}
                        {ticket.exit_date ? ` — Sorti le ${formatDateFr(ticket.exit_date)}` : ''}
                    </p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <button onClick={() => window.print()} className="btn-secondary">
                        Imprimer
                    </button>
                    <button onClick={handleDownload} className="btn-secondary" disabled={downloading}>
                        {downloading ? 'Génération…' : 'Télécharger PDF'}
                    </button>
                    {isOpen ? (
                        <button onClick={() => setShowClose(true)} className="btn-primary">
                            Clôturer — sortie du véhicule
                        </button>
                    ) : (
                        <button onClick={reopenTicket} className="btn-secondary">
                            Réouvrir le ticket
                        </button>
                    )}
                </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4 mb-6">
                <div className="card elev-sm p-4">
                    <p className="text-xs uppercase font-bold text-neutral-500 mb-1">Statut</p>
                    <p className={`text-lg font-extrabold ${isOpen ? 'text-accent' : 'text-neutral-700'}`}>
                        {repairTicketStatusLabel(ticket.status)}
                    </p>
                </div>
                <div className="card elev-sm p-4">
                    <p className="text-xs uppercase font-bold text-neutral-500 mb-1">Total dû</p>
                    <p className="text-lg font-extrabold">{formatCFA(ticket.total_amount)} F CFA</p>
                </div>
                <div className="card elev-sm p-4">
                    <p className="text-xs uppercase font-bold text-neutral-500 mb-1">Solde restant</p>
                    <p className={`text-lg font-extrabold ${balance > 0 ? 'text-red-600' : 'text-accent'}`}>
                        {formatCFA(balance)} F CFA
                    </p>
                </div>
            </div>

            {showClose && (
                <div className="card elev-sm p-5 mb-6 border-2 border-accent">
                    <h4 className="mb-3">Clôturer le ticket</h4>
                    {balance > 0 && (
                        <p className="text-sm text-red-600 mb-3">
                            Attention : il reste {formatCFA(balance)} F CFA à encaisser. Le véhicule peut sortir avec
                            un solde restant — celui-ci restera visible et à recouvrer.
                        </p>
                    )}
                    <div className="field max-w-xs">
                        <label htmlFor="exit_date">Date de sortie</label>
                        <input id="exit_date" type="date" className="input" value={exitDate} onChange={(e) => setExitDate(e.target.value)} />
                    </div>
                    <div className="flex gap-3 mt-3">
                        <button onClick={closeTicket} className="btn-primary">
                            Confirmer la sortie
                        </button>
                        <button onClick={() => setShowClose(false)} className="btn-secondary">
                            Annuler
                        </button>
                    </div>
                </div>
            )}

            {ticket.diagnosis && (
                <div className="card elev-sm p-5 mb-6">
                    <p className="text-xs uppercase font-bold text-neutral-500 mb-1">Motif / panne signalée</p>
                    <p>{ticket.diagnosis}</p>
                </div>
            )}

            <div className="card elev-sm p-6 mb-6 space-y-4">
                <h4>Lignes (pièces, main d'œuvre…)</h4>

                <div className="overflow-x-auto">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Type</th>
                                <th>Désignation</th>
                                <th className="w-24">Qté</th>
                                <th className="w-32">Prix unitaire</th>
                                <th className="w-32">Total</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center text-neutral-500 py-4">
                                        Aucune ligne pour le moment.
                                    </td>
                                </tr>
                            ) : (
                                items.map((it) => (
                                    <tr key={it.id}>
                                        <td className="text-neutral-600">{repairItemTypeLabel(it.type)}</td>
                                        <td>{it.description}</td>
                                        <td>{it.quantity}</td>
                                        <td className="text-right">{formatCFA(it.unit_price)}</td>
                                        <td className="text-right font-bold">{formatCFA(it.quantity * it.unit_price)}</td>
                                        <td>
                                            {isOpen && (
                                                <button onClick={() => removeItem(it.id)} className="btn-ghost !text-red-600">
                                                    Retirer
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {isOpen && (
                    <form onSubmit={addItem} className="grid sm:grid-cols-[140px_1fr_90px_130px_auto] gap-3 items-end pt-2 border-t border-neutral-200">
                        <div className="field !mb-0">
                            <label>Type</label>
                            <select
                                className="input"
                                value={itemForm.type}
                                onChange={(e) => setItemForm((f) => ({ ...f, type: e.target.value }))}
                            >
                                {REPAIR_ITEM_TYPES.map((t) => (
                                    <option key={t.value} value={t.value}>
                                        {t.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="field !mb-0">
                            <label>Désignation</label>
                            <input
                                className="input"
                                value={itemForm.description}
                                onChange={(e) => setItemForm((f) => ({ ...f, description: e.target.value }))}
                                placeholder="Ex : Plaquettes de frein avant"
                            />
                        </div>
                        <div className="field !mb-0">
                            <label>Qté</label>
                            <input
                                type="number"
                                min="0"
                                step="0.5"
                                className="input"
                                value={itemForm.quantity}
                                onChange={(e) => setItemForm((f) => ({ ...f, quantity: e.target.value }))}
                            />
                        </div>
                        <div className="field !mb-0">
                            <label>Prix unitaire</label>
                            <input
                                type="number"
                                min="0"
                                className="input"
                                value={itemForm.unit_price}
                                onChange={(e) => setItemForm((f) => ({ ...f, unit_price: e.target.value }))}
                            />
                        </div>
                        <button type="submit" className="btn-secondary">
                            + Ajouter
                        </button>
                    </form>
                )}
                {errors.item && <p className="text-sm text-red-600">{errors.item}</p>}
            </div>

            <div className="card elev-sm p-6 mb-6 space-y-4">
                <h4>Paiements / acomptes</h4>

                <div className="overflow-x-auto">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Montant</th>
                                <th>Note</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {payments.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="text-center text-neutral-500 py-4">
                                        Aucun paiement enregistré.
                                    </td>
                                </tr>
                            ) : (
                                payments.map((p) => (
                                    <tr key={p.id}>
                                        <td>{formatDateFr(p.paid_at)}</td>
                                        <td className="font-bold">{formatCFA(p.amount)} F</td>
                                        <td className="text-neutral-600">{p.note}</td>
                                        <td>
                                            <button onClick={() => removePayment(p.id)} className="btn-ghost !text-red-600">
                                                Retirer
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <form onSubmit={addPayment} className="grid sm:grid-cols-[160px_130px_1fr_auto] gap-3 items-end pt-2 border-t border-neutral-200">
                    <div className="field !mb-0">
                        <label>Date</label>
                        <input
                            type="date"
                            className="input"
                            value={paymentForm.paid_at}
                            onChange={(e) => setPaymentForm((f) => ({ ...f, paid_at: e.target.value }))}
                        />
                    </div>
                    <div className="field !mb-0">
                        <label>Montant</label>
                        <input
                            type="number"
                            min="0"
                            className="input"
                            value={paymentForm.amount}
                            onChange={(e) => setPaymentForm((f) => ({ ...f, amount: e.target.value }))}
                        />
                    </div>
                    <div className="field !mb-0">
                        <label>Note (optionnel)</label>
                        <input
                            className="input"
                            value={paymentForm.note}
                            onChange={(e) => setPaymentForm((f) => ({ ...f, note: e.target.value }))}
                            placeholder="Ex : Acompte espèces"
                        />
                    </div>
                    <button type="submit" className="btn-secondary">
                        + Ajouter
                    </button>
                </form>
                {errors.payment && <p className="text-sm text-red-600">{errors.payment}</p>}
            </div>

            <div className="card elev-sm p-4 sm:p-8 overflow-x-auto">
                <RepairTicketDocument ticket={ticket} items={items} payments={payments} />
            </div>
        </div>
    )
}
