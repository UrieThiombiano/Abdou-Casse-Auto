// Conversion nombre -> lettres en francais, pour le montant en toutes lettres
// des factures proforma (ex: 100000 -> "cent mille").

const UNITS = [
    'zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix',
    'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf',
]
const TENS = ['', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante']

function belowHundred(n) {
    if (n < 20) return UNITS[n]

    const ten = Math.floor(n / 10)
    const unit = n % 10

    if (ten === 7) {
        if (unit === 0) return 'soixante-dix'
        if (unit === 1) return 'soixante et onze'
        return `soixante-${UNITS[10 + unit]}`
    }
    if (ten === 9) {
        if (unit === 0) return 'quatre-vingt-dix'
        return `quatre-vingt-${UNITS[10 + unit]}`
    }
    if (ten === 8) {
        return unit === 0 ? 'quatre-vingts' : `quatre-vingt-${UNITS[unit]}`
    }
    if (unit === 0) return TENS[ten]
    if (unit === 1) return `${TENS[ten]} et un`
    return `${TENS[ten]}-${UNITS[unit]}`
}

function belowThousand(n) {
    const hundred = Math.floor(n / 100)
    const rest = n % 100

    if (hundred === 0) return belowHundred(rest)

    let str = hundred === 1 ? 'cent' : `${UNITS[hundred]} cent`
    if (rest === 0) {
        if (hundred > 1) str += 's'
        return str
    }
    return `${str} ${belowHundred(rest)}`
}

function groupToWords(n, singular, plural) {
    if (n === 1) return singular
    return `${belowThousand(n)} ${plural}`
}

export function numberToFrenchWords(value) {
    const n = Math.round(Math.abs(value))
    if (n === 0) return 'zéro'

    const billion = Math.floor(n / 1000000000)
    const million = Math.floor((n % 1000000000) / 1000000)
    const thousand = Math.floor((n % 1000000) / 1000)
    const rest = n % 1000

    const parts = []
    if (billion) parts.push(groupToWords(billion, 'un milliard', 'milliards'))
    if (million) parts.push(groupToWords(million, 'un million', 'millions'))
    if (thousand) parts.push(thousand === 1 ? 'mille' : `${belowThousand(thousand)} mille`)
    if (rest) parts.push(belowThousand(rest))

    return parts.join(' ')
}

// Regroupe les chiffres par milliers avec un espace normal (evite les espaces
// insecables renvoyees par toLocaleString, invisibles a l'ecran mais genantes
// a la copie/impression).
export function formatCFA(value) {
    const digits = String(Math.round(Math.abs(value)))
    let grouped = ''
    for (let i = 0; i < digits.length; i++) {
        if (i > 0 && (digits.length - i) % 3 === 0) grouped += ' '
        grouped += digits[i]
    }
    return grouped
}

export function amountInWordsCFA(value) {
    const words = numberToFrenchWords(value)
    const capitalized = words.charAt(0).toUpperCase() + words.slice(1)
    return `${capitalized} (${formatCFA(value)}) Francs CFA`
}
