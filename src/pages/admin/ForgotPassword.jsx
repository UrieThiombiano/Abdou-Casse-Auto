import { useState } from 'react'
import AuthLayout from '../../components/AuthLayout'
import { supabase } from '../../lib/supabaseClient'
import { adminTitle, useDocumentTitle } from '../../lib/title'

export default function ForgotPassword() {
    useDocumentTitle(adminTitle('Mot de passe oublié'))

    const [email, setEmail] = useState('')
    const [status, setStatus] = useState(null)
    const [error, setError] = useState(null)
    const [submitting, setSubmitting] = useState(false)

    async function handleSubmit(e) {
        e.preventDefault()
        setSubmitting(true)
        setError(null)
        setStatus(null)

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/admin/reset-password`,
        })

        setSubmitting(false)

        if (error) {
            setError("Une erreur est survenue, veuillez réessayer.")
            return
        }

        setStatus('Si un compte existe avec cet email, un lien de réinitialisation vient de lui être envoyé.')
    }

    return (
        <AuthLayout title="Mot de passe oublié">
            <p className="text-sm text-neutral-600 mb-4">
                Indiquez votre email : nous vous enverrons un lien pour réinitialiser votre mot de passe.
            </p>

            {status && <div className="font-medium text-sm text-green-600 mb-4">{status}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="field">
                    <label htmlFor="email">Email</label>
                    <input
                        id="email"
                        className="input"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoFocus
                    />
                    {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
                </div>

                <button type="submit" className="btn-primary btn-block" disabled={submitting}>
                    {submitting ? 'Envoi…' : 'Envoyer le lien de réinitialisation'}
                </button>
            </form>
        </AuthLayout>
    )
}
