import { supabase } from './supabaseClient'

// Identifiant de session cote navigateur (reinitialise a chaque nouvel onglet/
// visite), utilise uniquement pour compter des visites distinctes — aucune
// donnee personnelle.
function getSessionId() {
    try {
        let id = sessionStorage.getItem('aca_session_id')
        if (!id) {
            id = crypto.randomUUID()
            sessionStorage.setItem('aca_session_id', id)
        }
        return id
    } catch {
        return 'unknown'
    }
}

// Fire-and-forget : ne bloque jamais l'interaction utilisateur (navigation,
// clic) et ignore silencieusement les erreurs reseau.
export function trackEvent(eventType, path) {
    supabase
        .from('analytics_events')
        .insert({ event_type: eventType, path: path ?? window.location.pathname, session_id: getSessionId() })
        .then(() => {})
        .catch(() => {})
}
