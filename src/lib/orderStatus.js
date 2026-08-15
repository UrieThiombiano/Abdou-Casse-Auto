// Equivalent de App\Enums\OrderStatus.

export const ORDER_STATUSES = [
    { value: 'en_attente', label: 'En attente' },
    { value: 'traitee', label: 'Traitée' },
    { value: 'annulee', label: 'Annulée' },
]

export function orderStatusLabel(value) {
    return ORDER_STATUSES.find((s) => s.value === value)?.label ?? value
}
