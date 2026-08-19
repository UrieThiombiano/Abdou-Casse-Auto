// Commandes hors site : origine, etat de la piece et suivi logistique.

export const SOURCE_TYPES = [
    { value: 'entrepot_bassinko', label: 'Entrepôt Bassinko', defaultDelayDays: 7 },
    { value: 'commande_exterieure', label: 'Commande extérieure', defaultDelayDays: 60 },
]

export function sourceTypeLabel(value) {
    return SOURCE_TYPES.find((s) => s.value === value)?.label ?? value
}

export function suggestDeliveryDate(sourceType) {
    const source = SOURCE_TYPES.find((s) => s.value === sourceType)
    if (!source) return ''
    const date = new Date()
    date.setDate(date.getDate() + source.defaultDelayDays)
    return date.toISOString().slice(0, 10)
}

export const CONDITIONS = [
    { value: 'neuf', label: 'Neuf' },
    { value: 'occasion', label: 'Occasion' },
]

export function conditionLabel(value) {
    return CONDITIONS.find((c) => c.value === value)?.label ?? value
}

// Chaque etape precise a quelles origines elle s'applique : un entrepot local
// n'est jamais "en douane", par exemple.
export const MANUAL_ORDER_STATUSES = [
    { value: 'en_cours', label: 'En cours', appliesTo: ['entrepot_bassinko', 'commande_exterieure'] },
    { value: 'expediee', label: 'Embarquée / en route', appliesTo: ['commande_exterieure'] },
    { value: 'douane', label: 'Bloquée en douane', appliesTo: ['commande_exterieure'] },
    { value: 'recue_magasin', label: 'Reçue au magasin — à livrer', appliesTo: ['entrepot_bassinko', 'commande_exterieure'] },
    { value: 'livree', label: 'Livrée', appliesTo: ['entrepot_bassinko', 'commande_exterieure'] },
    { value: 'annulee', label: 'Annulée', appliesTo: ['entrepot_bassinko', 'commande_exterieure'] },
]

export function manualOrderStatusLabel(value) {
    return MANUAL_ORDER_STATUSES.find((s) => s.value === value)?.label ?? value
}

export function manualOrderStatusesFor(sourceType) {
    return MANUAL_ORDER_STATUSES.filter((s) => s.appliesTo.includes(sourceType))
}
