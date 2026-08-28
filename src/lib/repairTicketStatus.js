export const REPAIR_TICKET_STATUSES = [
    { value: 'en_cours', label: 'En cours' },
    { value: 'sorti', label: 'Sorti' },
]

export function repairTicketStatusLabel(value) {
    return REPAIR_TICKET_STATUSES.find((s) => s.value === value)?.label ?? value
}

export const REPAIR_ITEM_TYPES = [
    { value: 'piece', label: 'Pièce' },
    { value: 'main_oeuvre', label: 'Main d’œuvre' },
    { value: 'autre', label: 'Autre' },
]

export function repairItemTypeLabel(value) {
    return REPAIR_ITEM_TYPES.find((t) => t.value === value)?.label ?? value
}
