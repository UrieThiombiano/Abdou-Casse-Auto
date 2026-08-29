import { requireAdmin, botConfig, json } from './_auth.js'

// GET /api/whatsapp/status
// Renvoie l'etat de connexion WhatsApp du bot + le QR a scanner s'il y en a un.
// Le ADMIN_TOKEN du bot reste cote serveur (jamais expose au navigateur).
export async function onRequestGet({ request, env }) {
    const auth = await requireAdmin(request, env)
    if (!auth.ok) return json({ error: auth.message }, auth.status)

    const { base, token } = botConfig(env)
    if (!base || !token) return json({ error: 'Bot non configuré (BOT_URL / BOT_ADMIN_TOKEN).' }, 500)

    try {
        const res = await fetch(`${base}/status?token=${encodeURIComponent(token)}`, {
            headers: { 'x-admin-token': token },
        })
        if (!res.ok) return json({ error: `Bot injoignable (${res.status}).` }, 502)
        const s = await res.json()
        return json({
            connected: s.connection === 'open',
            connection: s.connection,
            me: s.me || null,
            qr: s.qr || null,
            lastConnectedAt: s.lastConnectedAt || null,
            lastDisconnectReason: s.lastDisconnectReason ?? null,
        })
    } catch {
        return json({ error: 'Bot injoignable.' }, 502)
    }
}
