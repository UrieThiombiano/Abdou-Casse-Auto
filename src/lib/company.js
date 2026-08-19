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
    mapsUrl: 'https://maps.app.goo.gl/3RYMiXAhtHuDLkRHA',
}

export function telHref(phone) {
    return `tel:+226${phone.replace(/\s/g, '')}`
}

export function mailHref(email) {
    return `mailto:${email}`
}
