import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthLayout from '../../components/AuthLayout'
import { supabase } from '../../lib/supabaseClient'
import { adminTitle, useDocumentTitle } from '../../lib/title'

// Supabase envoie l'utilisateur ici avec un lien de recuperation deja
// echange en session active (voir onAuthStateChange PASSWORD_RECOVERY).
export default function ResetPassword() {
    useDocumentTitle(adminTitle('Nouveau mot de passe'))

    const navigate = useNavigate()
    const [password, setPassword] = useState('')
    const [passwordConfirmation, setPasswordConfirmation] = useState('')
    const [error, setError] = useState(null)
    const [submitting, setSubmitting] = useState(false)

    async function handleSubmit(e) {
        e.preventDefault()
        setError(null)

        if (password !== passwordConfirmation) {
            setError('Les mots de passe ne correspondent pas.')
            return
        }
        if (password.length < 8) {
            setError('Le mot de passe doit contenir au moins 8 caractères.')
            return
        }

        setSubmitting(true)
        const { error } = await supabase.auth.updateUser({ password })
        setSubmitting(false)

        if (error) {
            setError("Une erreur est survenue, veuillez réessayer.")
            return
        }

        navigate('/admin/dashboard', { replace: true })
    }

    return (
        <AuthLayout title="Nouveau mot de passe">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="field">
                    <label htmlFor="password">Nouveau mot de passe</label>
                    <input
                        id="password"
                        className="input"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoFocus
                        autoComplete="new-password"
                    />
                </div>

                <div className="field">
                    <label htmlFor="password_confirmation">Confirmer le mot de passe</label>
                    <input
                        id="password_confirmation"
                        className="input"
                        type="password"
                        value={passwordConfirmation}
                        onChange={(e) => setPasswordConfirmation(e.target.value)}
                        required
                        autoComplete="new-password"
                    />
                </div>

                {error && <p className="text-sm text-red-600">{error}</p>}

                <button type="submit" className="btn-primary btn-block" disabled={submitting}>
                    {submitting ? 'Enregistrement…' : 'Réinitialiser le mot de passe'}
                </button>
            </form>
        </AuthLayout>
    )
}
