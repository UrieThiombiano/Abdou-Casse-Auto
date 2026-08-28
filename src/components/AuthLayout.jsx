import { company } from '../lib/company'

export default function AuthLayout({ title, children }) {
    return (
        <div className="bg-neutral-900 text-white antialiased min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-sm">
                <div className="flex flex-col items-center mb-6">
                    <img src="/img/logo.png" alt={company.name} className="w-16 h-16 rounded-full object-cover mb-3" />
                    <span className="font-extrabold text-lg text-center">ABDOU CASSE AUTO</span>
                    <span className="text-accent text-xs font-bold uppercase tracking-wide mt-1">Espace admin</span>
                </div>

                <div className="bg-white text-ink p-6 sm:p-8">
                    <h1 className="text-xl mb-4">{title}</h1>
                    {children}
                </div>
            </div>
        </div>
    )
}
