import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { partRequestPhotoUrl } from '../../lib/imageUploader'
import { ORDER_STATUSES, orderStatusLabel } from '../../lib/orderStatus'
import Pagination from '../../components/Pagination'
import { adminTitle, useDocumentTitle } from '../../lib/title'

const PER_PAGE = 15

function formatDateTime(iso) {
    return new Date(iso).toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })
}

export default function PartRequestsManager() {
    useDocumentTitle(adminTitle('Demandes de pièces'))

    const [requests, setRequests] = useState([])
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)
    const [filterStatus, setFilterStatus] = useState('')
    const [selected, setSelected] = useState(null)

    const fetchRequests = useCallback(async () => {
        try {
            let query = supabase.from('part_requests').select('*', { count: 'exact' })

            if (filterStatus) query = query.eq('status', filterStatus)

            const from = (page - 1) * PER_PAGE
            const to = from + PER_PAGE - 1

            const { data, count } = await query.order('created_at', { ascending: false }).range(from, to)

            setRequests(data ?? [])
            setTotal(count ?? 0)
        } catch {
            setRequests([])
            setTotal(0)
        }
    }, [filterStatus, page])

    useEffect(() => {
        fetchRequests()
    }, [fetchRequests])

    function select(request) {
        setSelected((current) => (current?.id === request.id ? null : request))
    }

    async function setStatus(request, status) {
        await supabase.from('part_requests').update({ status }).eq('id', request.id)
        setSelected((current) => (current?.id === request.id ? { ...current, status } : current))
        setRequests((current) => current.map((r) => (r.id === request.id ? { ...r, status } : r)))
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
                <h1>Demandes de pièces</h1>
            </div>

            <div className="field !mb-4 w-52">
                <select
                    className="input"
                    value={filterStatus}
                    onChange={(e) => {
                        setFilterStatus(e.target.value)
                        setPage(1)
                    }}
                >
                    <option value="">Tous les statuts</option>
                    {ORDER_STATUSES.map((s) => (
                        <option key={s.value} value={s.value}>
                            {s.label}
                        </option>
                    ))}
                </select>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 card elev-sm overflow-x-auto">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Client</th>
                                <th>Message</th>
                                <th>Statut</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requests.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="text-center text-neutral-500 py-6">
                                        Aucune demande.
                                    </td>
                                </tr>
                            ) : (
                                requests.map((request) => (
                                    <tr
                                        key={request.id}
                                        onClick={() => select(request)}
                                        className={`cursor-pointer ${selected?.id === request.id ? 'bg-accent-100' : 'hover:bg-neutral-100'}`}
                                    >
                                        <td>{formatDateTime(request.created_at)}</td>
                                        <td>{request.customer_name}</td>
                                        <td className="max-w-xs truncate">{request.message}</td>
                                        <td>{orderStatusLabel(request.status)}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                    <div className="p-4">
                        <Pagination page={page} perPage={PER_PAGE} total={total} onChange={setPage} />
                    </div>
                </div>

                <div>
                    {selected ? (
                        <div className="card elev-sm p-5">
                            <h4 className="mb-4">Demande #{selected.id}</h4>

                            {selected.photo_path && (
                                <img
                                    src={partRequestPhotoUrl(selected.photo_path)}
                                    alt="Photo de la pièce"
                                    className="w-full aspect-square object-cover mb-4"
                                />
                            )}

                            <dl className="text-sm space-y-2 mb-5">
                                <div>
                                    <dt className="text-neutral-500">Client</dt>
                                    <dd className="font-bold">{selected.customer_name}</dd>
                                </div>
                                <div>
                                    <dt className="text-neutral-500">Téléphone</dt>
                                    <dd>
                                        <a href={`tel:${selected.customer_phone}`} className="hover:text-accent">
                                            {selected.customer_phone}
                                        </a>
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-neutral-500">Message</dt>
                                    <dd>{selected.message}</dd>
                                </div>
                            </dl>

                            <label className="block text-xs font-bold uppercase text-neutral-500 mb-2">Statut</label>
                            <div className="seg mb-4">
                                {ORDER_STATUSES.map((s) => (
                                    <button
                                        key={s.value}
                                        onClick={() => setStatus(selected, s.value)}
                                        className={`seg-opt ${selected.status === s.value ? 'is-active' : ''}`}
                                    >
                                        {s.label}
                                    </button>
                                ))}
                            </div>

                            <a
                                href={`https://wa.me/226${selected.customer_phone.replace(/\D/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-secondary btn-block"
                            >
                                Écrire sur WhatsApp
                            </a>
                        </div>
                    ) : (
                        <div className="card elev-sm p-5 text-center text-neutral-500 text-sm">
                            Sélectionnez une demande pour voir le détail.
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
