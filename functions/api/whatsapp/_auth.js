// Verifie que la requete vient d'un admin connecte (session Supabase valide).
// Les fichiers prefixes par "_" ne sont pas routes par Cloudflare Pages : c'est
// un module partage, importe par status.js et logout.js.

export async function requireAdmin(request, env) {
    const authHeader = request.headers.get('Authorization') || ''
    const token = authHeader.replace(/^Bearer\s+/i, '').trim()
    if (!token) return { ok: false, status: 401, message: 'Non authentifié.' }

    if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
        return { ok: false, status: 500, message: 'Configuration Supabase manquante côté serveur.' }
    }

    try {
        const res = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, {
            headers: {
                Authorization: `Bearer ${token}`,
                apikey: env.SUPABASE_ANON_KEY,
            },
        })
        if (!res.ok) return { ok: false, status: 401, message: 'Session expirée, reconnectez-vous.' }
        const user = await res.json()
        if (!user?.id) return { ok: false, status: 401, message: 'Session invalide.' }
        return { ok: true, user }
    } catch {
        return { ok: false, status: 502, message: 'Vérification de session impossible.' }
    }
}

export function botConfig(env) {
    const base = (env.BOT_URL || '').replace(/\/$/, '')
    return { base, token: env.BOT_ADMIN_TOKEN || '' }
}

export function json(body, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
    })
}
