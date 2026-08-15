// Coordonnees Abdou Casse Auto — equivalent de config/company.php.
// A confirmer/ajuster avec le client avant mise en production.

export const company = {
    name: 'Abdou Casse Auto',
    tagline: 'Dépannage Service 24h/24',
    city: 'Ouagadougou, Burkina Faso',
    phones: ['78 80 85 16', '54 24 05 01', '78 24 78 25', '78 83 58 83'],
    // Numero WhatsApp principal (format international sans espaces pour les liens wa.me).
    whatsappNumber: '22678808516',
    whatsappDisplay: '78 80 85 16',
    deliveryZone: 'Ouagadougou et environs',
    mapsUrl: 'https://maps.app.goo.gl/3RYMiXAhtHuDLkRHA',
}

export function telHref(phone) {
    return `tel:+226${phone.replace(/\s/g, '')}`
}
