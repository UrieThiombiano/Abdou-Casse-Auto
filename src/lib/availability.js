// Disponibilite d'une annonce : au magasin (en stock) ou a faire venir
// de l'exterieur (sur commande, delai indicatif).

export const AVAILABILITY_OPTIONS = [
    { value: 'en_stock', label: 'En stock' },
    { value: 'sur_commande', label: 'Sur commande' },
]

export function availabilityLabel(value) {
    return AVAILABILITY_OPTIONS.find((o) => o.value === value)?.label ?? value
}

export const SUR_COMMANDE_DELAY = 'livraison généralement sous 1 à 3 mois'
