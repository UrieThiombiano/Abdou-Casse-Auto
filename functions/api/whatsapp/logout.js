import { requireAdmin, botConfig, json } from './_auth.js'

// POST /api/whatsapp/logout
// Delie la session WhatsApp du bot -> un nouveau QR sera proposé.
export async function onRequestPost({ request, env }) {
    const auth = await requireAdmin(request, env)
    if (!auth.ok) return json({ error: auth.message }, auth.status)

    const { base, token } = botConfig(env)
    if (!base || !token) return json({ error: 'Bot non configuré (BOT_URL / BOT_ADMIN_TOKEN).' }, 500)

    try {
        const res = await fetch(`${base}/logout?token=${encodeURIComponent(token)}`, {
            method: 'POST',
            headers: { 'x-admin-token': token },
        })
        if (!res.ok) return json({ error: `Le bot a refusé la déconnexion (${res.status}).` }, 502)
        return json({ ok: true })
    } catch {
        return json({ error: 'Bot injoignable.' }, 502)
    }
}
