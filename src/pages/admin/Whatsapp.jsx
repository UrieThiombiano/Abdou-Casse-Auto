import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { company } from '../../lib/company'
import { adminTitle, useDocumentTitle } from '../../lib/title'

const POLL_MS = 5000

async function authFetch(path, options = {}) {
    const { data } = await supabase.auth.getSession()
    const token = data.session?.access_token
    const res = await fetch(path, {
        ...options,
        headers: {
            ...(options.headers || {}),
            Authorization: `Bearer ${token || ''}`,
        },
    })
    const body = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(body.error || `Erreur ${res.status}`)
    return body
}

function StatusBadge({ state }) {
    const map = {
        connected: { dot: 'bg-green-500', ring: 'bg-green-500/15', text: 'Connecté', color: 'text-green-700' },
        connecting: { dot: 'bg-amber-500', ring: 'bg-amber-500/15', text: 'Connexion en cours…', color: 'text-amber-700' },
        offline: { dot: 'bg-red-500', ring: 'bg-red-500/15', text: 'Déconnecté', color: 'text-red-700' },
    }
    const s = map[state] || map.offline
    return (
        <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-bold ${s.ring} ${s.color}`}>
            <span className={`relative flex h-2.5 w-2.5`}>
                {state !== 'connected' && (
                    <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${s.dot}`} />
                )}
                <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${s.dot}`} />
            </span>
            {s.text}
        </span>
    )
}

export default function Whatsapp() {
    useDocumentTitle(adminTitle('Chatbot WhatsApp'))

    const [data, setData] = useState(null)
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(true)
    const [working, setWorking] = useState(false)
    const [confirmReset, setConfirmReset] = useState(false)
    const timer = useRef(null)

    const load = useCallback(async () => {
        try {
            const body = await authFetch('/api/whatsapp/status')
            setData(body)
            setError(null)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        load()
        timer.current = setInterval(load, POLL_MS)
        return () => clearInterval(timer.current)
    }, [load])

    async function handleReset() {
        setWorking(true)
        setError(null)
        try {
            await authFetch('/api/whatsapp/logout', { method: 'POST' })
            setConfirmReset(false)
            // Le nouveau QR met quelques secondes : on rafraichit plus vite un moment.
            for (let i = 0; i < 6; i++) {
                await new Promise((r) => setTimeout(r, 2500))
                await load()
            }
        } catch (err) {
            setError(err.message)
        } finally {
            setWorking(false)
        }
    }

    const connected = data?.connected
    const state = connected ? 'connected' : data?.connection === 'connecting' ? 'connecting' : 'offline'

    return (
        <div className="max-w-2xl">
            <h1 className="mb-2">Chatbot WhatsApp</h1>
            <p className="text-neutral-500 mb-6">
                Le robot qui répond automatiquement aux clients sur le numéro{' '}
                <strong>{company.whatsappDisplay}</strong>.
            </p>

            {loading ? (
                <div className="text-neutral-500">Chargement…</div>
            ) : (
                <>
                    <div className="card elev-sm p-5 mb-6">
                        <div className="flex items-center justify-between gap-4 flex-wrap">
                            <div>
                                <p className="text-xs uppercase font-bold text-neutral-500 mb-2">État</p>
                                <StatusBadge state={state} />
                            </div>
                            {connected && data?.me && (
                                <p className="text-sm text-neutral-500">
                                    Numéro lié : <strong>+{data.me}</strong>
                                </p>
                            )}
                        </div>

                        {error && (
                            <p className="mt-4 text-sm text-red-600">
                                {error} — nouvelle tentative automatique dans quelques secondes.
                            </p>
                        )}
                    </div>

                    {connected ? (
                        <div className="card elev-sm p-5">
                            <p className="font-bold mb-1">✅ Tout fonctionne</p>
                            <p className="text-neutral-600 text-sm mb-5">
                                Le chatbot est en ligne et répond aux clients. Vous n'avez rien à faire.
                            </p>

                            <div className="border-t pt-4">
                                <p className="font-bold text-sm mb-1">Changer de téléphone</p>
                                <p className="text-neutral-600 text-sm mb-3">
                                    Utile seulement si vous voulez lier le chatbot à un autre téléphone. Pendant
                                    la reconnexion (le temps de rescanner), le chatbot ne répondra plus.
                                </p>
                                {confirmReset ? (
                                    <div className="flex gap-2 flex-wrap">
                                        <button
                                            onClick={handleReset}
                                            disabled={working}
                                            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-60"
                                        >
                                            {working ? 'Déconnexion…' : 'Oui, déconnecter et afficher un nouveau code'}
                                        </button>
                                        <button
                                            onClick={() => setConfirmReset(false)}
                                            disabled={working}
                                            className="btn-secondary"
                                        >
                                            Annuler
                                        </button>
                                    </div>
                                ) : (
                                    <button onClick={() => setConfirmReset(true)} className="btn-secondary">
                                        Reconnecter / changer de téléphone
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="card elev-sm p-5">
                            <p className="font-bold mb-4">Connecter le chatbot à WhatsApp</p>

                            {data?.qr ? (
                                <div className="sm:flex sm:gap-6">
                                    <img
                                        src={data.qr}
                                        alt="QR code WhatsApp"
                                        className="w-60 h-60 shrink-0 rounded-lg border bg-white p-2 mx-auto sm:mx-0"
                                    />
                                    <ol className="mt-5 sm:mt-0 space-y-3 text-sm text-neutral-700 list-decimal list-inside">
                                        <li>
                                            Prenez le téléphone du <strong>{company.whatsappDisplay}</strong>.
                                        </li>
                                        <li>
                                            Ouvrez <strong>WhatsApp</strong> → <strong>Réglages</strong> (⚙️) →{' '}
                                            <strong>Appareils connectés</strong>.
                                        </li>
                                        <li>
                                            Touchez <strong>Associer un appareil</strong>.
                                        </li>
                                        <li>Scannez le code ci-contre avec l'appareil photo.</li>
                                        <li>
                                            La page passe au <span className="text-green-700 font-bold">vert</span> quand
                                            c'est bon.
                                        </li>
                                    </ol>
                                </div>
                            ) : (
                                <p className="text-neutral-600 text-sm">
                                    Le code de connexion apparaît dans quelques secondes… laissez cette page ouverte.
                                </p>
                            )}

                            <p className="mt-4 text-xs text-neutral-400">
                                Le code se rafraîchit automatiquement. Cette page se met à jour toute seule.
                            </p>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
