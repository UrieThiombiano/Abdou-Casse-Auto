import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { formatCFA } from '../../lib/numberToWords'
import { REPAIR_TICKET_STATUSES, repairTicketStatusLabel } from '../../lib/repairTicketStatus'
import { adminTitle, useDocumentTitle } from '../../lib/title'

function formatDateFr(isoDate) {
    if (!isoDate) return ''
    const [year, month, day] = isoDate.split('-')
    return `${day}/${month}/${year}`
}

export default function RepairsManager() {
    useDocumentTitle(adminTitle('Réparations'))

    const [tickets, setTickets] = useState([])
    const [loading, setLoading] = useState(true)
    const [filterStatus, setFilterStatus] = useState('en_cours')

    useEffect(() => {
        setLoading(true)
        let query = supabase.from('repair_tickets').select('*, brand:brands(name)')
        if (filterStatus) query = query.eq('status', filterStatus)

        query.order('created_at', { ascending: false }).then(({ data }) => {
            setTickets(data ?? [])
            setLoading(false)
        })
    }, [filterStatus])

    async function handleDelete(ticket) {
        if (!window.confirm(`Supprimer le ticket ${ticket.ticket_number} et toutes ses infos (lignes, paiements, PDF) ?`)) return
        await supabase.from('repair_tickets').delete().eq('id', ticket.id)
        setTickets((list) => list.filter((t) => t.id !== ticket.id))
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
                <h1>Réparations — Atelier</h1>
                <Link to="/admin/reparations/nouveau" className="btn-primary">
                    + Nouveau ticket
                </Link>
            </div>

            <div className="field !mb-4 w-52">
                <select className="input" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                    <option value="">Tous les statuts</option>
                    {REPAIR_TICKET_STATUSES.map((s) => (
                        <option key={s.value} value={s.value}>
                            {s.label}
                        </option>
                    ))}
                </select>
            </div>

            <div className="card elev-sm overflow-x-auto">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Ticket</th>
                            <th>Entrée</th>
                            <th>Client</th>
                            <th>Véhicule</th>
                            <th>Statut</th>
                            <th>Total</th>
                            <th>Solde</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={8} className="text-center text-neutral-500 py-6">
                                    Chargement…
                                </td>
                            </tr>
                        ) : tickets.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="text-center text-neutral-500 py-6">
                                    Aucun ticket.
                                </td>
                            </tr>
                        ) : (
                            tickets.map((t) => {
                                const balance = t.total_amount - t.amount_paid
                                return (
                                    <tr key={t.id}>
                                        <td className="font-bold">{t.ticket_number}</td>
                                        <td>{formatDateFr(t.entry_date)}</td>
                                        <td>{t.customer_name}</td>
                                        <td className="text-neutral-600">
                                            {t.brand?.name}
                                            {t.model ? ` ${t.model}` : ''}
                                            {t.registration_number ? ` · ${t.registration_number}` : ''}
                                        </td>
                                        <td className={t.status === 'sorti' ? 'text-neutral-500' : 'font-bold text-accent'}>
                                            {repairTicketStatusLabel(t.status)}
                                        </td>
                                        <td className="whitespace-nowrap">{formatCFA(t.total_amount)} F</td>
                                        <td className={`whitespace-nowrap font-bold ${balance > 0 ? 'text-red-600' : 'text-accent'}`}>
                                            {formatCFA(balance)} F
                                        </td>
                                        <td className="text-right whitespace-nowrap">
                                            <Link to={`/admin/reparations/${t.id}`} className="btn-ghost">
                                                Voir
                                            </Link>{' '}
                                            <button onClick={() => handleDelete(t)} className="btn-ghost !text-red-600">
                                                Supprimer
                                            </button>
                                        </td>
                                    </tr>
                                )
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
