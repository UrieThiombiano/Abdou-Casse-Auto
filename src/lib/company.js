// Coordonnees Abdou Casse Auto — equivalent de config/company.php.
// A confirmer/ajuster avec le client avant mise en production.

export const company = {
    name: 'Abdou Casse Auto',
    tagline: 'Pièces auto neuves & occasion, disponibles 24h/24',
    city: 'Ouagadougou, Burkina Faso',
    email: 'Kaborekaka@gmail.com',
    // Par ordre de preference.
    phones: ['70 44 85 39', '78 83 58 83', '78 80 85 16', '67 99 18 91'],
    // Numero WhatsApp principal (format international sans espaces pour les liens wa.me).
    whatsappNumber: '22676942290',
    whatsappDisplay: '76 94 22 90',
    deliveryZone: 'Ouagadougou et environs',
    hours: 'Lundi à vendredi : 8h – 17h · Samedi : 8h – 15h · Dimanche : fermé',
    hoursNote: 'Dépannage 24h/24 et commande en ligne à toute heure',
    guarantee: "Des pièces de qualité, authentiques, avec une garantie d'essai. Pas de fausses pièces, pas de copies.",
    mapsUrl: 'https://maps.app.goo.gl/oknjfdGeHsaW4Qso9',
    // Coordonnees exactes de la boutique (pour la carte integree).
    coordinates: '12.34216,-1.5601202',
}

export function telHref(phone) {
    return `tel:+226${phone.replace(/\s/g, '')}`
}

export function mailHref(email) {
    return `mailto:${email}`
}
