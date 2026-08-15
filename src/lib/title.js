import { useEffect } from 'react'
import { company } from './company'

// Equivalent des suffixes de <title> des layouts Blade (layouts/app et layouts/admin).
const PUBLIC_TITLE_SUFFIX = `${company.name} — Pièces auto neuves & occasion, Ouagadougou`
const ADMIN_TITLE_SUFFIX = `Admin — ${company.name}`

export function publicTitle(title) {
    return title ? `${title} — ${PUBLIC_TITLE_SUFFIX}` : PUBLIC_TITLE_SUFFIX
}

export function adminTitle(title) {
    return title ? `${title} — ${ADMIN_TITLE_SUFFIX}` : ADMIN_TITLE_SUFFIX
}

export function useDocumentTitle(title) {
    useEffect(() => {
        if (title) document.title = title
    }, [title])
}
