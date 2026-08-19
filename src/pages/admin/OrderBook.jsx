import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { orderStatusLabel } from '../../lib/orderStatus'
import { manualOrderStatusLabel } from '../../lib/manualOrderStatus'
import { formatCFA } from '../../lib/numberToWords'
import Pagination from '../../components/Pagination'
import { adminTitle, useDocumentTitle } from '../../lib/title'

const PER_PAGE = 20

const SOURCE_FILTERS = [
    { value: '', label: 'Toutes les origines' },
    { value: 'site', label: 'Commandes en ligne' },
    { value: 'manuelle', label: 'Commandes hors site' },
]

function formatDateTime(iso) {
    return new Date(iso).toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })
}

function statusLabel(row) {
    return row.source === 'site' ? orderStatusLabel(row.status) : manualOrderStatusLabel(row.status)
}

export default function OrderBook() {
    useDocumentTitle(adminTitle('Carnet de commandes'))
    const navigate = useNavigate()

    const [rows, setRows] = useState([])
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)
    const [source, setSource] = useState('')
    const [stats, setStats] = useState({ en_attente: 0, traitee: 0, annulee: 0 })

    const fetchStats = useCallback(async () => {
        const buckets = ['en_attente', 'traitee', 'annulee']
        const results = await Promise.all(
            buckets.map(async (bucket) => {
                let query = supabase.from('order_book').select('*', { count: 'exact', head: true }).eq('bucket', bucket)
                if (source) query = query.eq('source', source)
                const { count } = await query
                return [bucket, count ?? 0]
            })
        )
        setStats(Object.fromEntries(results))
    }, [source])

    useEffect(() => {
        fetchStats()
    }, [fetchStats])

    const fetchRows = useCallback(async () => {
        try {
            let query = supabase.from('order_book').select('*', { count: 'exact' })

            if (source) query = query.eq('source', source)

            const from = (page - 1) * PER_PAGE
            const to = from + PER_PAGE - 1

            const { data, count } = await query.order('created_at', { ascending: false }).range(from, to)

            setRows(data ?? [])
            setTotal(count ?? 0)
        } catch {
            setRows([])
            setTotal(0)
        }
    }, [source, page])

    useEffect(() => {
        fetchRows()
    }, [fetchRows])

    function openRow(row) {
        if (row.source === 'manuelle') navigate(`/admin/carnet-de-commandes/${row.id}`)
        else navigate('/admin/commandes')
    }

    async function handleDelete(row, e) {
        e.stopPropagation()
        if (!window.confirm(`Supprimer la commande de ${row.customer_name} ?`)) return
        await supabase.from('manual_orders').delete().eq('id', row.id)
        setRows((current) => current.filter((r) => !(r.source === 'manuelle' && r.id === row.id)))
        fetchStats()
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
                <h1>Carnet de commandes</h1>
                <Link to="/admin/carnet-de-commandes/nouvelle" className="btn-primary">
                    + Nouvelle commande
                </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 mb-6">
                <div className="card elev-sm p-5 border-l-4 border-accent-2">
                    <p className="text-xs uppercase font-bold text-neutral-500 mb-1">En attente</p>
                    <p className="text-3xl font-extrabold text-accent-2">{stats.en_attente}</p>
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

            <div className="field !mb-4 w-64">
                <select
                    className="input"
                    value={source}
                    onChange={(e) => {
                        setSource(e.target.value)
                        setPage(1)
                    }}
                >
                    {SOURCE_FILTERS.map((f) => (
                        <option key={f.value} value={f.value}>
                            {f.label}
                        </option>
                    ))}
                </select>
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
                                    key={`${row.source}-${row.id}`}
                                    onClick={() => openRow(row)}
                                    className="cursor-pointer hover:bg-neutral-100"
                                >
                                    <td className="whitespace-nowrap">{formatDateTime(row.created_at)}</td>
                                    <td>
                                        <span
                                            className={`inline-block px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide ${
                                                row.source === 'site'
                                                    ? 'bg-accent-100 text-accent-700'
                                                    : 'bg-neutral-200 text-neutral-700'
                                            }`}
                                        >
                                            {row.source === 'site' ? 'Site' : 'Manuelle'}
                                        </span>
                                    </td>
                                    <td>{row.customer_name}</td>
                                    <td className="whitespace-nowrap">
                                        {row.total_amount === null ? '—' : `${formatCFA(row.total_amount)} F CFA`}
                                    </td>
                                    <td>{statusLabel(row)}</td>
                                    <td className="text-right whitespace-nowrap">
                                        {row.source === 'manuelle' && (
                                            <button onClick={(e) => handleDelete(row, e)} className="btn-ghost !text-red-600">
                                                Supprimer
                                            </button>
                                        )}
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
