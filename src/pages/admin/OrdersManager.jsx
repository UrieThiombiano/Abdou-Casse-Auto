import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
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

async function exportOrdersCsv() {
    const { data: orders } = await supabase
        .from('orders')
        .select('*, brand:brands(*), listing:listings(*)')
        .order('created_at', { ascending: false })

    const header = [
        'ID', 'Date', 'Statut', 'Client', 'Telephone', 'VIN/Chassis',
        'Marque', 'Modele', 'Version/Provenance', 'Annee', 'Piece liee', 'Commentaire',
    ]

    const escape = (value) => {
        const str = value === null || value === undefined ? '' : String(value)
        return /[;"\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str
    }

    const rows = (orders ?? []).map((order) =>
        [
            order.id,
            formatDateTime(order.created_at),
            orderStatusLabel(order.status),
            order.customer_name,
            order.customer_phone,
            order.vin,
            order.brand?.name,
            order.model,
            order.version_provenance,
            order.year,
            order.listing?.title,
            order.comment,
        ]
            .map(escape)
            .join(';')
    )

    const csv = '﻿' + [header.join(';'), ...rows].join('\r\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = url
    a.download = 'commandes_abdou_casse_auto.csv'
    a.click()
    URL.revokeObjectURL(url)
}

export default function OrdersManager() {
    useDocumentTitle(adminTitle('Commandes'))

    const [orders, setOrders] = useState([])
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)
    const [filterStatus, setFilterStatus] = useState('')
    const [selectedOrder, setSelectedOrder] = useState(null)

    const fetchOrders = useCallback(async () => {
        try {
            let query = supabase.from('orders').select('*, brand:brands(*), listing:listings(*)', { count: 'exact' })

            if (filterStatus) query = query.eq('status', filterStatus)

            const from = (page - 1) * PER_PAGE
            const to = from + PER_PAGE - 1

            const { data, count } = await query.order('created_at', { ascending: false }).range(from, to)

            setOrders(data ?? [])
            setTotal(count ?? 0)
        } catch {
            setOrders([])
            setTotal(0)
        }
    }, [filterStatus, page])

    useEffect(() => {
        fetchOrders()
    }, [fetchOrders])

    function select(order) {
        setSelectedOrder((current) => (current?.id === order.id ? null : order))
    }

    async function setStatus(order, status) {
        await supabase.from('orders').update({ status }).eq('id', order.id)
        setSelectedOrder((current) => (current?.id === order.id ? { ...current, status } : current))
        setOrders((current) => current.map((o) => (o.id === order.id ? { ...o, status } : o)))
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
                <h1>Commandes</h1>
                <button onClick={exportOrdersCsv} className="btn-secondary">
                    Exporter en Excel (CSV)
                </button>
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
                                <th>Marque</th>
                                <th>Statut</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="text-center text-neutral-500 py-6">
                                        Aucune commande.
                                    </td>
                                </tr>
                            ) : (
                                orders.map((order) => (
                                    <tr
                                        key={order.id}
                                        onClick={() => select(order)}
                                        className={`cursor-pointer ${selectedOrder?.id === order.id ? 'bg-accent-100' : 'hover:bg-neutral-100'}`}
                                    >
                                        <td>{formatDateTime(order.created_at)}</td>
                                        <td>{order.customer_name}</td>
                                        <td>{order.brand?.name}</td>
                                        <td>{orderStatusLabel(order.status)}</td>
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
                    {selectedOrder ? (
                        <div className="card elev-sm p-5">
                            <h4 className="mb-4">Commande #{selectedOrder.id}</h4>

                            <dl className="text-sm space-y-2 mb-5">
                                <div>
                                    <dt className="text-neutral-500">Client</dt>
                                    <dd className="font-bold">{selectedOrder.customer_name}</dd>
                                </div>
                                <div>
                                    <dt className="text-neutral-500">Téléphone</dt>
                                    <dd>
                                        <a href={`tel:${selectedOrder.customer_phone}`} className="hover:text-accent">
                                            {selectedOrder.customer_phone}
                                        </a>
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-neutral-500">VIN / châssis</dt>
                                    <dd>{selectedOrder.vin}</dd>
                                </div>
                                <div>
                                    <dt className="text-neutral-500">Véhicule</dt>
                                    <dd>
                                        {selectedOrder.brand?.name} {selectedOrder.model} {selectedOrder.year}
                                    </dd>
                                </div>
                                {selectedOrder.version_provenance && (
                                    <div>
                                        <dt className="text-neutral-500">Version / provenance</dt>
                                        <dd>{selectedOrder.version_provenance}</dd>
                                    </div>
                                )}
                                {selectedOrder.listing && (
                                    <div>
                                        <dt className="text-neutral-500">Pièce liée</dt>
                                        <dd>{selectedOrder.listing.title}</dd>
                                    </div>
                                )}
                                {selectedOrder.comment && (
                                    <div>
                                        <dt className="text-neutral-500">Commentaire</dt>
                                        <dd>{selectedOrder.comment}</dd>
                                    </div>
                                )}
                            </dl>

                            <label className="block text-xs font-bold uppercase text-neutral-500 mb-2">Statut</label>
                            <div className="seg mb-4">
                                {ORDER_STATUSES.map((s) => (
                                    <button
                                        key={s.value}
                                        onClick={() => setStatus(selectedOrder, s.value)}
                                        className={`seg-opt ${selectedOrder.status === s.value ? 'is-active' : ''}`}
                                    >
                                        {s.label}
                                    </button>
                                ))}
                            </div>

                            <a
                                href={`https://wa.me/226${selectedOrder.customer_phone.replace(/\D/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-secondary btn-block"
                            >
                                Écrire sur WhatsApp
                            </a>
                        </div>
                    ) : (
                        <div className="card elev-sm p-5 text-center text-neutral-500 text-sm">
                            Sélectionnez une commande pour voir le détail.
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
