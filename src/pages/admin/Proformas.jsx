import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { formatCFA } from '../../lib/numberToWords'
import { adminTitle, useDocumentTitle } from '../../lib/title'

function formatDateFr(isoDate) {
    if (!isoDate) return ''
    const [year, month, day] = isoDate.split('-')
    return `${day}/${month}/${year}`
}

export default function Proformas() {
    useDocumentTitle(adminTitle('Proforma'))

    const [proformas, setProformas] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        supabase
            .from('proformas')
            .select('*')
            .order('created_at', { ascending: false })
            .then(({ data }) => {
                setProformas(data ?? [])
                setLoading(false)
            })
    }, [])

    async function handleDelete(proforma) {
        if (!window.confirm(`Supprimer la proforma ${proforma.number} ?`)) return
        await supabase.from('proformas').delete().eq('id', proforma.id)
        setProformas((list) => list.filter((p) => p.id !== proforma.id))
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
                <h1>Factures proforma</h1>
                <Link to="/admin/proformas/nouvelle" className="btn-primary">
                    + Nouvelle proforma
                </Link>
            </div>

            <div className="card elev-sm overflow-x-auto">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Numéro</th>
                            <th>Date</th>
                            <th>Client</th>
                            <th>Objet</th>
                            <th>Montant</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="text-center text-neutral-500 py-6">
                                    Chargement…
                                </td>
                            </tr>
                        ) : proformas.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="text-center text-neutral-500 py-6">
                                    Aucune proforma pour le moment.
                                </td>
                            </tr>
                        ) : (
                            proformas.map((p) => (
                                <tr key={p.id}>
                                    <td className="font-bold">{p.number}</td>
                                    <td>{formatDateFr(p.issue_date)}</td>
                                    <td>{p.client_name}</td>
                                    <td className="text-neutral-600">{p.object}</td>
                                    <td className="whitespace-nowrap">{formatCFA(p.total_amount)} F CFA</td>
                                    <td className="text-right whitespace-nowrap">
                                        <Link to={`/admin/proformas/${p.id}`} className="btn-ghost">
                                            Voir
                                        </Link>{' '}
                                        <button onClick={() => handleDelete(p)} className="btn-ghost !text-red-600">
                                            Supprimer
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
