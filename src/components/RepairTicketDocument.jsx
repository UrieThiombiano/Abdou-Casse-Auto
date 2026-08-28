import { proformaCompany } from '../lib/proformaCompany'
import { amountInWordsCFA, formatCFA } from '../lib/numberToWords'
import { repairItemTypeLabel } from '../lib/repairTicketStatus'

function formatDateFr(isoDate) {
    if (!isoDate) return ''
    const [year, month, day] = isoDate.split('-')
    if (!year || !month || !day) return isoDate
    return `${day}/${month}/${year}`
}

export default function RepairTicketDocument({ ticket, items, payments }) {
    const total = items.reduce((sum, it) => sum + it.quantity * it.unit_price, 0)
    const paid = payments.reduce((sum, p) => sum + p.amount, 0)
    const balance = total - paid

    return (
        <div
            id="repair-ticket-paper"
            className="bg-white text-black mx-auto p-10 w-full max-w-[210mm]"
            style={{ fontFamily: '"Times New Roman", Georgia, serif' }}
        >
            <div className="text-center mb-4">
                <h1 className="text-3xl font-bold tracking-wide" style={{ fontFamily: 'inherit' }}>
                    {proformaCompany.brand}
                </h1>
                <p className="italic text-sm mt-1">{proformaCompany.tagline}</p>
                <div className="border-b-2 border-black mt-2" />
            </div>

            <div className="flex justify-between items-start mb-6 gap-6">
                <div className="border border-black px-3 py-2 text-xs leading-relaxed">
                    <p>{proformaCompany.legalForm}</p>
                    <p>RCCM: {proformaCompany.rccm}</p>
                    <p>IFU: {proformaCompany.ifu}</p>
                    {proformaCompany.addressLines.map((line) => (
                        <p key={line}>{line}</p>
                    ))}
                    <p>Tél: {proformaCompany.phones}</p>
                </div>
                <p className="text-sm whitespace-nowrap pt-1">
                    {proformaCompany.city} le {formatDateFr(ticket.exit_date ?? new Date().toISOString().slice(0, 10))}
                </p>
            </div>

            <p className="text-center font-bold italic underline text-lg mb-6">FICHE D'ATELIER {ticket.ticket_number}</p>

            <div className="text-sm mb-5 space-y-0.5">
                <p>
                    <span className="font-bold italic underline">Client</span> : {ticket.customer_name} — Téléphone :{' '}
                    {ticket.customer_phone}
                </p>
                <p>
                    <span className="font-bold italic underline">Véhicule</span> : {ticket.brand?.name}
                    {ticket.model ? ` ${ticket.model}` : ''}
                    {ticket.registration_number ? ` — Immatriculation : ${ticket.registration_number}` : ''}
                    {ticket.vin ? ` — VIN : ${ticket.vin}` : ''}
                </p>
                <p>
                    <span className="font-bold italic underline">Entrée</span> : {formatDateFr(ticket.entry_date)}
                    {ticket.exit_date ? (
                        <>
                            {' '}
                            — <span className="font-bold italic underline">Sortie</span> : {formatDateFr(ticket.exit_date)}
                        </>
                    ) : (
                        ''
                    )}
                </p>
                {ticket.diagnosis && (
                    <p>
                        <span className="font-bold italic underline">Motif</span> : {ticket.diagnosis}
                    </p>
                )}
            </div>

            <table className="w-full border-collapse text-sm mb-1">
                <thead>
                    <tr>
                        <th className="border border-black px-2 py-1.5 font-bold italic">Type</th>
                        <th className="border border-black px-2 py-1.5 font-bold italic">Désignation</th>
                        <th className="border border-black px-2 py-1.5 font-bold italic w-20">Qté</th>
                        <th className="border border-black px-2 py-1.5 font-bold italic w-28">Prix Unitaire</th>
                        <th className="border border-black px-2 py-1.5 font-bold italic w-28">Prix Total</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item) => (
                        <tr key={item.id}>
                            <td className="border border-black px-2 py-1.5">{repairItemTypeLabel(item.type)}</td>
                            <td className="border border-black px-2 py-1.5">{item.description}</td>
                            <td className="border border-black px-2 py-1.5 text-center">{item.quantity}</td>
                            <td className="border border-black px-2 py-1.5 text-right">{formatCFA(item.unit_price)}</td>
                            <td className="border border-black px-2 py-1.5 text-right">{formatCFA(item.quantity * item.unit_price)}</td>
                        </tr>
                    ))}
                    <tr>
                        <td colSpan={4} className="border border-black px-2 py-1.5 text-right font-bold italic">
                            Total général
                        </td>
                        <td className="border border-black px-2 py-1.5 text-right font-bold">{formatCFA(total)}</td>
                    </tr>
                    {payments.map((p) => (
                        <tr key={`p-${p.id}`}>
                            <td colSpan={4} className="border border-black px-2 py-1.5 text-right italic">
                                Acompte versé le {formatDateFr(p.paid_at)}
                                {p.note ? ` (${p.note})` : ''}
                            </td>
                            <td className="border border-black px-2 py-1.5 text-right">- {formatCFA(p.amount)}</td>
                        </tr>
                    ))}
                    <tr>
                        <td colSpan={4} className="border border-black px-2 py-1.5 text-right font-bold italic">
                            Solde {balance > 0 ? 'restant dû' : ''}
                        </td>
                        <td className="border border-black px-2 py-1.5 text-right font-bold">{formatCFA(balance)}</td>
                    </tr>
                </tbody>
            </table>

            <p className="text-sm font-bold italic mb-14 mt-3">
                Arrêtée la présente fiche à la somme de : {amountInWordsCFA(total)}
            </p>

            <div className="flex justify-end mb-16">
                <div className="text-center">
                    <p className="font-bold italic underline">{proformaCompany.signatoryName}</p>
                    <div className="h-24 w-40" />
                </div>
            </div>

            <div className="border-t border-black pt-2 text-[11px] leading-relaxed">
                {proformaCompany.bankLines.map((line) => (
                    <p key={line}>{line}</p>
                ))}
            </div>
        </div>
    )
}
