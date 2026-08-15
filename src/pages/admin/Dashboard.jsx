import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { orderStatusLabel } from '../../lib/orderStatus'
import { adminTitle, useDocumentTitle } from '../../lib/title'

const CHART_W = 600
const CHART_H = 160

function formatDay(date) {
    return date.toISOString().slice(0, 10)
}

function formatLabel(date) {
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
}

function formatDateTime(iso) {
    return new Date(iso).toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })
}

export default function Dashboard() {
    useDocumentTitle(adminTitle('Tableau de bord'))

    const [stats, setStats] = useState(null)
    const [error, setError] = useState(false)

    useEffect(() => {
        async function load() {
            try {
                const today = new Date()
                today.setHours(0, 0, 0, 0)
                const start = new Date(today)
                start.setDate(start.getDate() - 13)

                const [
                    { count: totalOrders },
                    { count: treatedOrders },
                    { count: pendingOrders },
                    { count: activeListings },
                    { data: recentOrders },
                    { data: latestOrders },
                ] = await Promise.all([
                    supabase.from('orders').select('*', { count: 'exact', head: true }),
                    supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'traitee'),
                    supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'en_attente'),
                    supabase.from('listings').select('*', { count: 'exact', head: true }).eq('is_active', true),
                    supabase.from('orders').select('created_at').gte('created_at', start.toISOString()),
                    supabase
                        .from('orders')
                        .select('*, brand:brands(*)')
                        .order('created_at', { ascending: false })
                        .limit(8),
                ])

                const ordersByDay = {}
                for (const order of recentOrders ?? []) {
                    const day = order.created_at.slice(0, 10)
                    ordersByDay[day] = (ordersByDay[day] ?? 0) + 1
                }

                const days = Array.from({ length: 14 }, (_, i) => {
                    const d = new Date(start)
                    d.setDate(d.getDate() + i)
                    return d
                })

                const chartPoints = days.map((d) => ({
                    label: formatLabel(d),
                    value: ordersByDay[formatDay(d)] ?? 0,
                }))

                setStats({
                    totalOrders: totalOrders ?? 0,
                    treatedOrders: treatedOrders ?? 0,
                    pendingOrders: pendingOrders ?? 0,
                    activeListings: activeListings ?? 0,
                    chartPoints,
                    latestOrders: latestOrders ?? [],
                })
            } catch {
                setError(true)
            }
        }

        load()
    }, [])

    if (error) {
        return <div className="text-red-600">Impossible de charger le tableau de bord.</div>
    }

    if (!stats) {
        return <div className="text-neutral-500">Chargement…</div>
    }

    const max = Math.max(1, ...stats.chartPoints.map((p) => p.value))
    const stepX = stats.chartPoints.length > 1 ? CHART_W / (stats.chartPoints.length - 1) : 0
    const points = stats.chartPoints
        .map((p, i) => {
            const x = Math.round(i * stepX * 10) / 10
            const y = Math.round((CHART_H - (p.value / max) * (CHART_H - 20) - 5) * 10) / 10
            return `${x},${y}`
        })
        .join(' ')

    return (
        <div>
            <h1 className="mb-6">Tableau de bord</h1>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                <div className="card elev-sm p-5">
                    <p className="text-xs uppercase font-bold text-neutral-500 mb-1">Total commandes</p>
                    <p className="text-3xl font-extrabold">{stats.totalOrders}</p>
                </div>
                <div className="card elev-sm p-5">
                    <p className="text-xs uppercase font-bold text-neutral-500 mb-1">Traitées</p>
                    <p className="text-3xl font-extrabold text-accent">{stats.treatedOrders}</p>
                </div>
                <div className="card elev-sm p-5 border-l-4 border-accent-2">
                    <p className="text-xs uppercase font-bold text-neutral-500 mb-1">En attente</p>
                    <p className="text-3xl font-extrabold text-accent-2">{stats.pendingOrders}</p>
                </div>
                <div className="card elev-sm p-5">
                    <p className="text-xs uppercase font-bold text-neutral-500 mb-1">Annonces actives</p>
                    <p className="text-3xl font-extrabold">{stats.activeListings}</p>
                </div>
            </div>

            <div className="card elev-sm p-5 mb-8">
                <h4 className="mb-4">Commandes — 14 derniers jours</h4>
                <svg viewBox={`0 0 ${CHART_W} ${CHART_H}`} className="w-full h-40" preserveAspectRatio="none">
                    <polyline points={points} fill="none" stroke="#F26A21" strokeWidth="2.5" />
                </svg>
                <div className="flex justify-between text-xs text-neutral-500 mt-2">
                    <span>{stats.chartPoints[0]?.label ?? ''}</span>
                    <span>{stats.chartPoints[stats.chartPoints.length - 1]?.label ?? ''}</span>
                </div>
            </div>

            <div className="card elev-sm p-5">
                <h4 className="mb-4">Dernières commandes</h4>
                <div className="overflow-x-auto">
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
                            {stats.latestOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="text-center text-neutral-500 py-6">
                                        Aucune commande pour le moment.
                                    </td>
                                </tr>
                            ) : (
                                stats.latestOrders.map((order) => (
                                    <tr key={order.id}>
                                        <td>{formatDateTime(order.created_at)}</td>
                                        <td>{order.customer_name}</td>
                                        <td>{order.brand?.name}</td>
                                        <td>{orderStatusLabel(order.status)}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
