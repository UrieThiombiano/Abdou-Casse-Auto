import { proformaCompany } from '../lib/proformaCompany'
import { amountInWordsCFA, formatCFA } from '../lib/numberToWords'

function formatDateFr(isoDate) {
    if (!isoDate) return ''
    const [year, month, day] = isoDate.split('-')
    if (!year || !month || !day) return isoDate
    return `${day}/${month}/${year}`
}

export default function ProformaDocument({ data }) {
    const items = data.items?.length ? data.items : [{ designation: '', quantity: '', unitPrice: '' }]
    const total = data.items?.reduce((sum, it) => sum + (Number(it.quantity) || 0) * (Number(it.unitPrice) || 0), 0) ?? 0

    return (
        <div
            id="proforma-paper"
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
                    <p>DIVISION FISCAL: {proformaCompany.divisionFiscale}</p>
                    <p>REGIME D'IMPOSITION: {proformaCompany.regimeImposition}</p>
                    {proformaCompany.addressLines.map((line) => (
                        <p key={line}>{line}</p>
                    ))}
                    <p>Tél: {proformaCompany.phones}</p>
                </div>
                <p className="text-sm whitespace-nowrap pt-1">
                    {proformaCompany.city} le {formatDateFr(data.issueDate)}
                </p>
            </div>

            <p className="text-center font-bold italic underline text-lg mb-6">
                FACTURE PROFORMA {data.number}
            </p>

            <div className="text-sm mb-5 space-y-0.5">
                <p>
                    <span className="font-bold italic underline">Doit</span> : {data.clientName}
                </p>
                {(data.clientAddress || data.clientPhone) && (
                    <p>
                        {data.clientAddress}
                        {data.clientPhone ? `${data.clientAddress ? ' ' : ''}Téléphone : ${data.clientPhone}` : ''}
                    </p>
                )}
                {(data.clientRccm || data.clientIfu || data.clientRni) && (
                    <p>
                        {data.clientRccm ? `RCCM : ${data.clientRccm} ` : ''}
                        {data.clientIfu ? `IFU : ${data.clientIfu} ` : ''}
                        {data.clientRni ? `RNI : ${data.clientRni}` : ''}
                    </p>
                )}
                <p>
                    <span className="font-bold italic underline">Object</span> : {data.object}
                </p>
                <p>
                    <span className="font-bold italic underline">Numéro d'immatriculation</span> :{' '}
                    {data.registrationNumber}
                </p>
                <p>
                    <span className="font-bold italic underline">Numéro de châssis</span> : {data.chassisNumber}
                </p>
            </div>

            <table className="w-full border-collapse text-sm mb-1">
                <thead>
                    <tr>
                        <th className="border border-black px-2 py-1.5 font-bold italic">Désignations</th>
                        <th className="border border-black px-2 py-1.5 font-bold italic w-24">Quantités</th>
                        <th className="border border-black px-2 py-1.5 font-bold italic w-32">Prix Unitaire</th>
                        <th className="border border-black px-2 py-1.5 font-bold italic w-32">Prix Total</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item, i) => (
                        <tr key={i}>
                            <td className="border border-black px-2 py-1.5">{item.designation}</td>
                            <td className="border border-black px-2 py-1.5 text-center">{item.quantity}</td>
                            <td className="border border-black px-2 py-1.5 text-right">
                                {item.unitPrice !== '' && item.unitPrice != null ? formatCFA(item.unitPrice) : ''}
                            </td>
                            <td className="border border-black px-2 py-1.5 text-right">
                                {item.quantity && item.unitPrice
                                    ? formatCFA(Number(item.quantity) * Number(item.unitPrice))
                                    : ''}
                            </td>
                        </tr>
                    ))}
                    <tr>
                        <td colSpan={3} className="border border-black px-2 py-1.5 text-right font-bold italic">
                            Total général
                        </td>
                        <td className="border border-black px-2 py-1.5 text-right font-bold">{formatCFA(total)}</td>
                    </tr>
                </tbody>
            </table>

            <p className="text-sm font-bold italic mb-14 mt-3">
                Arrêtée la présente facture à la somme de : {amountInWordsCFA(total)}
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
