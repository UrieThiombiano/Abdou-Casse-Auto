import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { manualOrderStatusLabel, sourceTypeLabel } from '../../lib/manualOrderStatus'
import { formatCFA } from '../../lib/numberToWords'
import Pagination from '../../components/Pagination'
import { adminTitle, useDocumentTitle } from '../../lib/title'

const PER_PAGE = 20
const PENDING_STATUSES = ['en_cours', 'expediee', 'douane', 'recue_magasin']

function formatDateTime(iso) {
    return new Date(iso).toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })
}

export default function OrderBook() {
    useDocumentTitle(adminTitle('Carnet de commandes'))
    const navigate = useNavigate()

    const [rows, setRows] = useState([])
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)
    const [stats, setStats] = useState({
        enAttente: 0,
        traitee: 0,
        annulee: 0,
        amountDue: 0,
        overdue: 0,
        revenueThisMonth: 0,
        bassinko: 0,
        exterieure: 0,
    })

    const fetchStats = useCallback(async () => {
        const today = new Date().toISOString().slice(0, 10)
        const monthStart = new Date()
        monthStart.setDate(1)
        monthStart.setHours(0, 0, 0, 0)

        const [
            { count: enAttente },
            { count: traitee },
            { count: annulee },
            { data: unpaid },
            { count: overdue },
            { data: delivered },
            { count: bassinko },
            { count: exterieure },
        ] = await Promise.all([
            supabase.from('manual_orders').select('id', { count: 'exact' }).in('status', PENDING_STATUSES),
            supabase.from('manual_orders').select('id', { count: 'exact' }).eq('status', 'livree'),
            supabase.from('manual_orders').select('id', { count: 'exact' }).eq('status', 'annulee'),
            supabase.from('manual_orders').select('total_amount, deposit_amount').neq('status', 'annulee'),
            supabase
                .from('manual_orders')
                .select('id', { count: 'exact' })
                .lt('estimated_delivery_date', today)
                .not('status', 'in', '(livree,annulee)'),
            supabase
                .from('manual_orders')
                .select('total_amount')
                .eq('status', 'livree')
                .gte('updated_at', monthStart.toISOString()),
            supabase
                .from('manual_orders')
                .select('id', { count: 'exact' })
                .eq('source_type', 'entrepot_bassinko')
                .neq('status', 'annulee'),
            supabase
                .from('manual_orders')
                .select('id', { count: 'exact' })
                .eq('source_type', 'commande_exterieure')
                .neq('status', 'annulee'),
        ])

        setStats({
            enAttente: enAttente ?? 0,
            traitee: traitee ?? 0,
            annulee: annulee ?? 0,
            amountDue: (unpaid ?? []).reduce((sum, o) => sum + (o.total_amount - o.deposit_amount), 0),
            overdue: overdue ?? 0,
            revenueThisMonth: (delivered ?? []).reduce((sum, o) => sum + o.total_amount, 0),
            bassinko: bassinko ?? 0,
            exterieure: exterieure ?? 0,
        })
    }, [])

    useEffect(() => {
        fetchStats()
    }, [fetchStats])

    const fetchRows = useCallback(async () => {
        try {
            const from = (page - 1) * PER_PAGE
            const to = from + PER_PAGE - 1

            const { data, count } = await supabase
                .from('manual_orders')
                .select('*', { count: 'exact' })
                .order('created_at', { ascending: false })
                .range(from, to)

            setRows(data ?? [])
            setTotal(count ?? 0)
        } catch {
            setRows([])
            setTotal(0)
        }
    }, [page])

    useEffect(() => {
        fetchRows()
    }, [fetchRows])

    async function handleDelete(row, e) {
        e.stopPropagation()
        if (!window.confirm(`Supprimer la commande de ${row.customer_name} ?`)) return
        await supabase.from('manual_orders').delete().eq('id', row.id)
        setRows((current) => current.filter((r) => r.id !== row.id))
        fetchStats()
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-1 gap-4 flex-wrap">
                <h1>Carnet de commandes</h1>
                <Link to="/admin/carnet-de-commandes/nouvelle" className="btn-primary">
                    + Nouvelle commande
                </Link>
            </div>
            <p className="text-sm text-neutral-500 mb-6">
                Commandes prises hors du site (entrepôt Bassinko ou commande extérieure). Les commandes passées sur le
                site se gèrent dans « Commandes en ligne ».
            </p>

            <div className="grid gap-4 sm:grid-cols-3 mb-6">
                <div className="card elev-sm p-5 border-l-4 border-accent-2">
                    <p className="text-xs uppercase font-bold text-neutral-500 mb-1">En attente</p>
                    <p className="text-3xl font-extrabold text-accent-2">{stats.enAttente}</p>
                </div>
                <div className="card elev-sm p-5">
                    <p className="text-xs uppercase font-bold text-neutral-500 mb-1">Traitées</p>
                    <p className="text-3xl font-extrabold text-accent">{stats.traitee}</p>
                </div>
                <div className="card elev-sm p-5">
                    <p className="text-xs uppercase font-bold text-neutral-500 mb-1">Annulées</p>
                    <p className="text-3xl font-extrabold">{stats.annulee}</p>
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                <div className="card elev-sm p-5">
                    <p className="text-xs uppercase font-bold text-neutral-500 mb-1">Montant à encaisser</p>
                    <p className="text-3xl font-extrabold">{formatCFA(stats.amountDue)}</p>
                    <p className="text-xs text-neutral-500 mt-1">F CFA</p>
                </div>
                <div className={`card elev-sm p-5 ${stats.overdue > 0 ? 'border-l-4 border-red-500' : ''}`}>
                    <p className="text-xs uppercase font-bold text-neutral-500 mb-1">Commandes en retard</p>
                    <p className={`text-3xl font-extrabold ${stats.overdue > 0 ? 'text-red-600' : ''}`}>{stats.overdue}</p>
                </div>
                <div className="card elev-sm p-5">
                    <p className="text-xs uppercase font-bold text-neutral-500 mb-1">CA du mois (livrées)</p>
                    <p className="text-3xl font-extrabold text-accent">{formatCFA(stats.revenueThisMonth)}</p>
                    <p className="text-xs text-neutral-500 mt-1">F CFA</p>
                </div>
                <div className="card elev-sm p-5">
                    <p className="text-xs uppercase font-bold text-neutral-500 mb-1">Bassinko / Extérieur</p>
                    <p className="text-3xl font-extrabold">
                        {stats.bassinko} <span className="text-base font-bold text-neutral-400">/</span> {stats.exterieure}
                    </p>
                </div>
            </div>

            <div className="card elev-sm overflow-x-auto">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Origine</th>
                            <th>Client</th>
                            <th>Montant</th>
                            <th>Statut</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="text-center text-neutral-500 py-6">
                                    Aucune commande.
                                </td>
                            </tr>
                        ) : (
                            rows.map((row) => (
                                <tr
                                    key={row.id}
                                    onClick={() => navigate(`/admin/carnet-de-commandes/${row.id}`)}
                                    className="cursor-pointer hover:bg-neutral-100"
                                >
                                    <td className="whitespace-nowrap">{formatDateTime(row.created_at)}</td>
                                    <td>{sourceTypeLabel(row.source_type)}</td>
                                    <td>{row.customer_name}</td>
                                    <td className="whitespace-nowrap">{formatCFA(row.total_amount)} F CFA</td>
                                    <td>{manualOrderStatusLabel(row.status)}</td>
                                    <td className="text-right whitespace-nowrap">
                                        <button onClick={(e) => handleDelete(row, e)} className="btn-ghost !text-red-600">
                                            Supprimer
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
                <div className="p-4">
                    <Pagination page={page} perPage={PER_PAGE} total={total} onChange={setPage} />
                </div>
            </div>
        </div>
    )
}
