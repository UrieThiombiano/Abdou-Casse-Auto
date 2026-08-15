import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import AuthLayout from '../../components/AuthLayout'
import { useAuth } from '../../context/AuthContext'

export default function Login() {
    const { user, signIn } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState(null)
    const [submitting, setSubmitting] = useState(false)

    if (user) {
        return <Navigate to="/admin/dashboard" replace />
    }

    async function handleSubmit(e) {
        e.preventDefault()
        setSubmitting(true)
        setError(null)

        const { error } = await signIn(email, password)

        setSubmitting(false)

        if (error) {
            setError('Identifiants incorrects.')
            return
        }

        const redirectTo = location.state?.from ?? '/admin/dashboard'
        navigate(redirectTo, { replace: true })
    }

    return (
        <AuthLayout title="Connexion">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="field">
                    <label htmlFor="email">Identifiant (email)</label>
                    <input
                        id="email"
                        className="input"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoFocus
                        autoComplete="username"
                    />
                </div>

                <div className="field">
                    <label htmlFor="password">Mot de passe</label>
                    <input
                        id="password"
                        className="input"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="current-password"
                    />
                </div>

                {error && <p className="text-sm text-red-600">{error}</p>}

                <button type="submit" className="btn-primary btn-block" disabled={submitting}>
                    {submitting ? 'Connexion…' : 'Se connecter'}
                </button>

                <Link to="/admin/forgot-password" className="block text-center text-sm text-neutral-600 hover:text-accent">
                    Mot de passe oublié ?
                </Link>
            </form>
        </AuthLayout>
    )
}
