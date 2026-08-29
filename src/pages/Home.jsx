import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { supabase } from '../lib/supabaseClient'
import { company, telHref } from '../lib/company'
import { publicTitle, useDocumentTitle } from '../lib/title'
import { trackEvent } from '../lib/analytics'
import Reveal from '../components/Reveal'
import LocationMap from '../components/LocationMap'
import Typewriter from '../components/Typewriter'
import BrandLogo from '../components/BrandLogo'

const MotionLink = motion(Link)

// Entrée orchestrée de la bande « garantie » : les éléments montent l'un après l'autre.
const bandContainer = {
    hidden: {},
    show: { transition: { staggerChildren: 0.13, delayChildren: 0.06 } },
}
const bandItem = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
}
const bandItemReduced = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { duration: 0.4 } },
}

const REASSURANCE_ITEMS = [
    { label: 'Garantie d’essai', text: 'Pièces authentiques, testées — jamais de copies' },
    { label: 'Disponible 24h/24', text: 'Une équipe joignable à toute heure pour votre commande' },
    { label: 'Paiement livraison', text: 'Aucun paiement en ligne requis' },
    { label: 'Livraison Ouaga', text: company.deliveryZone },
]

export default function Home() {
    useDocumentTitle(publicTitle('Accueil'))

    const reduceMotion = useReducedMotion()
    const bandChild = reduceMotion ? bandItemReduced : bandItem

    const [brands, setBrands] = useState([])
    const [brand, setBrand] = useState('')
    const navigate = useNavigate()

    useEffect(() => {
        supabase
            .from('brands')
            .select('id, name')
            .order('name')
            .then(({ data }) => setBrands(data ?? []))
    }, [])

    function handleSearch(e) {
        e.preventDefault()
        navigate(`/pieces-neuves${brand ? `?marque=${brand}` : ''}`)
    }

    return (
        <>
            {/* HERO */}
            <section className="relative overflow-hidden bg-neutral-900 text-white">
                <div className="absolute inset-0">
                    <img
                        src="/img/hero-mecanicien.jpg"
                        alt="Mécanicien vérifiant le moteur d'un véhicule"
                        className="kb-image w-full h-full object-cover opacity-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-neutral-900/70 via-neutral-900/40 to-neutral-900/10" />
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/50 via-transparent to-transparent" />
                </div>

                <div className="relative max-w-6xl mx-auto px-4 py-20 sm:py-28 grid lg:grid-cols-3 gap-10 items-center">
                    <div className="lg:col-span-2">
                        <motion.span
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="tag-accent mb-4 inline-flex"
                        >
                            À juste prix, sans mauvaise surprise
                        </motion.span>

                        <Typewriter
                            as="h1"
                            className="text-white text-4xl sm:text-5xl mb-4"
                            text="Trouvez exactement la pièce qui manque à votre véhicule"
                        />

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.16 }}
                            className="text-neutral-300 text-lg mb-8 max-w-xl"
                        >
                            Neuves ou d'occasion, trouvées par nos soins au juste prix. Commande en ligne, paiement à
                            la livraison uniquement — {company.deliveryZone}.
                        </motion.p>

                        <motion.form
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.24 }}
                            onSubmit={handleSearch}
                            className="bg-white p-4 flex flex-col sm:flex-row gap-3 max-w-xl shadow-xl"
                        >
                            <div className="field flex-1 !mb-0">
                                <label htmlFor="hero-marque" className="!text-neutral-500">
                                    Marque
                                </label>
                                <select
                                    id="hero-marque"
                                    className="input !bg-surface !text-ink"
                                    value={brand}
                                    onChange={(e) => setBrand(e.target.value)}
                                >
                                    <option value="">Toutes les marques</option>
                                    {brands.map((b) => (
                                        <option key={b.id} value={b.id}>
                                            {b.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.04 }}
                                whileTap={{ scale: 0.97 }}
                                type="submit"
                                className="btn-primary sm:self-end"
                            >
                                Rechercher
                            </motion.button>
                        </motion.form>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.32 }}
                        >
                            <Link to="/occasion" className="btn-secondary !border-neutral-600 !text-white mt-6 inline-flex">
                                Voir les pièces d'occasion — France au revoir
                            </Link>
                        </motion.div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, x: 80 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                        className="bg-neutral-800/90 backdrop-blur-sm p-6 border-t-4 border-accent"
                    >
                        <div className="badge-circle w-14 h-14 bg-accent text-white font-extrabold text-xs text-center mb-4 flex items-center justify-center animate-[ctaPulse_2.4s_ease-in-out_infinite]">
                            24h/24
                        </div>
                        <h3 className="text-white mb-2">Commandez vos pièces 24h/24</h3>
                        <p className="text-neutral-400 text-sm mb-4">
                            Besoin d'une pièce en urgence ? Notre équipe reste joignable à toute heure pour vérifier
                            la disponibilité et organiser la livraison.
                        </p>
                        <a
                            href={telHref(company.phones[0])}
                            onClick={() => trackEvent('phone_click')}
                            className="btn-secondary !border-neutral-600 !text-white btn-block"
                        >
                            {company.phones[0]}
                        </a>
                    </motion.div>
                </div>
            </section>

            {/* GARANTIE — PIECES AUTHENTIQUES */}
            <section className="px-4 pt-12 pb-16 sm:pt-16 sm:pb-24">
                <div className="relative overflow-hidden max-w-6xl mx-auto text-white shadow-2xl border-t-4 border-accent">
                    <div className="absolute inset-0">
                        <img
                            src="/img/catalogue-neuf.jpg"
                            alt="Atelier et pièces détachées rangées et contrôlées sur étagères"
                            className="kb-image w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-neutral-900/78" />
                        <div className="absolute inset-0 bg-gradient-to-b from-neutral-900/70 via-neutral-900/25 to-neutral-900/70" />
                    </div>

                    <motion.div
                        className="relative max-w-2xl mx-auto px-6 py-20 sm:py-28 text-center"
                        variants={bandContainer}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, amount: 0.4 }}
                    >
                    <motion.span variants={bandChild} className="tag-accent inline-flex mb-7">
                        La différence Abdou Casse
                    </motion.span>

                    <motion.p
                        variants={bandChild}
                        className="text-3xl sm:text-4xl font-extrabold leading-[1.15] text-balance mb-6 drop-shadow-[0_2px_14px_rgba(0,0,0,0.55)]"
                    >
                        Fatigué des fausses pièces, des copies,
                        <br className="hidden sm:block" /> des pièces qui ne tiennent pas&nbsp;?
                    </motion.p>

                    <motion.p
                        variants={bandChild}
                        className="text-lg sm:text-xl text-neutral-200 leading-relaxed mb-9 drop-shadow-[0_1px_10px_rgba(0,0,0,0.5)]"
                    >
                        Chez nous, des pièces de qualité et authentiques, livrées avec une{' '}
                        <span className="relative inline-block font-bold text-white">
                            garantie d’essai
                            <motion.span
                                aria-hidden="true"
                                className="absolute -bottom-1 left-0 h-[3px] w-full bg-accent origin-left"
                                initial={{ scaleX: reduceMotion ? 1 : 0 }}
                                whileInView={{ scaleX: 1 }}
                                viewport={{ once: true, amount: 0.9 }}
                                transition={{
                                    delay: reduceMotion ? 0 : 0.9,
                                    duration: 0.55,
                                    ease: [0.22, 1, 0.36, 1],
                                }}
                            />
                        </span>
                        . Pas de fausses pièces. Pas de copies.
                    </motion.p>

                    <motion.div variants={bandChild}>
                        <Link
                            to="/commander"
                            onClick={() => trackEvent('order_click')}
                            className="btn-primary group"
                        >
                            Commander une pièce fiable
                            <svg
                                className="w-4 h-4 transition-transform group-hover:translate-x-1"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                            >
                                <path d="M5 12h14M13 6l6 6-6 6" />
                            </svg>
                        </Link>
                    </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* CARTES DE NAVIGATION */}
            <section className="max-w-6xl mx-auto px-4 py-16">
                <div className="grid gap-5 sm:grid-cols-3">
                    <Reveal delay={0} direction="right" duration={1} distance={90}>
                        <MotionLink
                            whileHover={{ y: -6 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                            to="/pieces-neuves"
                            className="card elev-sm border-t-4 border-accent p-6 hover:shadow-xl transition-shadow block h-full"
                        >
                            <h3 className="mb-2">Pièces neuves</h3>
                            <p className="text-sm text-neutral-600 mb-4">Catalogue de pièces neuves, filtrable par marque et année.</p>
                            <span className="btn-ghost">Voir le catalogue →</span>
                        </MotionLink>
                    </Reveal>
                    <Reveal delay={0.3} direction="right" duration={1} distance={90}>
                        <MotionLink
                            whileHover={{ y: -6 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                            to="/occasion"
                            className="card elev-sm border-t-4 border-accent-2 p-6 hover:shadow-xl transition-shadow block h-full"
                        >
                            <h3 className="mb-2">Occasion — France au revoir</h3>
                            <p className="text-sm text-neutral-600 mb-4">Pièces d'occasion importées, état vérifié, photos réelles.</p>
                            <span className="btn-ghost">Voir le catalogue →</span>
                        </MotionLink>
                    </Reveal>
                    <Reveal delay={0.6} direction="right" duration={1} distance={90}>
                        <MotionLink
                            whileHover={{ y: -6 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                            to="/commander"
                            onClick={() => trackEvent('order_click')}
                            className="card elev-sm border-t-4 border-neutral-800 p-6 hover:shadow-xl transition-shadow block h-full"
                        >
                            <h3 className="mb-2">Commander</h3>
                            <p className="text-sm text-neutral-600 mb-4">Demandez la pièce qu'il vous faut, sans paiement en ligne.</p>
                            <span className="btn-ghost">Commander →</span>
                        </MotionLink>
                    </Reveal>
                </div>
            </section>

            {/* MARQUES COUVERTES */}
            {brands.length > 0 && (
                <section className="py-14 bg-neutral-900 overflow-hidden">
                    <Reveal as="h2" className="text-white text-center mb-8 px-4">
                        Trouvez les pièces pour votre marque de véhicule
                    </Reveal>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 w-16 sm:w-32 bg-gradient-to-r from-neutral-900 to-transparent z-10" />
                        <div className="absolute inset-y-0 right-0 w-16 sm:w-32 bg-gradient-to-l from-neutral-900 to-transparent z-10" />
                        <div className="flex w-max animate-[marquee_28s_linear_infinite] hover:[animation-play-state:paused]">
                            {[...brands, ...brands].map((b, i) => (
                                <Link
                                    key={`${b.id}-${i}`}
                                    to={`/pieces-neuves?marque=${b.id}`}
                                    className="shrink-0 mx-3 px-6 py-3 border border-neutral-700 text-neutral-200 flex items-center gap-3 hover:border-accent hover:text-white transition-colors"
                                >
                                    <BrandLogo name={b.name} className="w-7 h-7 shrink-0" />
                                    <span className="font-extrabold uppercase tracking-wide text-sm">{b.name}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* COMMANDER DEPUIS NOS LOCAUX OU A DISTANCE */}
            <section className="py-16 sm:py-24 overflow-hidden">
                <div className="max-w-6xl mx-auto px-4 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
                    <Reveal direction="right">
                        <div className="relative">
                            <div className="absolute -inset-3 border-2 border-accent -z-10 hidden sm:block" />
                            <img
                                src="/img/commander-piece.jpg"
                                alt="La pièce automobile précise dont vous avez besoin, prête à être commandée"
                                className="w-full aspect-[4/5] sm:aspect-[4/3] object-cover"
                            />
                        </div>
                    </Reveal>

                    <Reveal direction="left" delay={0.1}>
                        <span className="tag-accent-2 mb-4 inline-flex">Ici ou depuis l'étranger, on vous la trouve</span>
                        <Typewriter as="h2" className="mb-4" text="Introuvable au pays ? Nous la faisons venir, jusqu'à vous" />
                        <p className="text-neutral-600 mb-6 max-w-lg">
                            Grâce à notre réseau de fournisseurs à l'étranger, nous ne nous arrêtons pas à ce qu'il y
                            a en rayon : nous faisons venir la pièce exacte dont votre véhicule a besoin, au bon
                            modèle, à la bonne référence. Commandez par téléphone ou WhatsApp, où que vous soyez, et
                            ne payez qu'à la réception — aucun paiement en ligne, aucune surprise.
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                                <Link to="/commander" onClick={() => trackEvent('order_click')} className="btn-primary">
                                    Commander une pièce
                                </Link>
                            </motion.div>
                            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                                <a
                                    href={telHref(company.phones[0])}
                                    onClick={() => trackEvent('phone_click')}
                                    className="btn-secondary"
                                >
                                    Appeler {company.phones[0]}
                                </a>
                            </motion.div>
                        </div>
                    </Reveal>
                </div>
            </section>

            {/* CONFIANCE / EQUIPE */}
            <section className="relative overflow-hidden text-white">
                <div className="absolute inset-0">
                    <img
                        src="/img/equipe-atelier.jpg"
                        alt="Notre équipe de mécaniciens au travail sur un véhicule"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-neutral-900/45" />
                </div>

                <div className="relative max-w-6xl mx-auto px-4 py-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4 text-center">
                    {REASSURANCE_ITEMS.map((item, i) => (
                        <Reveal key={item.label} delay={i * 0.1}>
                            <div className="badge-circle w-16 h-16 bg-accent text-white mx-auto mb-3 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" />
                                    <path d="M12 6v6l4 2" />
                                </svg>
                            </div>
                            <h5 className="mb-1 text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.7)]">{item.label}</h5>
                            <p className="text-sm text-neutral-200 drop-shadow-[0_2px_6px_rgba(0,0,0,0.7)]">{item.text}</p>
                        </Reveal>
                    ))}
                </div>
            </section>

            {/* LOCALISATION */}
            <section className="max-w-6xl mx-auto px-4 py-16">
                <Reveal className="grid lg:grid-cols-2 gap-10 items-center">
                    <div>
                        <span className="tag-accent mb-4 inline-flex">Nous trouver</span>
                        <h2 className="mb-4">Notre atelier vous accueille à {company.city.split(',')[0]}</h2>
                        <p className="text-neutral-600 mb-6 max-w-md">
                            Passez nous voir pour être conseillé en personne, ou contactez-nous avant de vous
                            déplacer pour vérifier la disponibilité de votre pièce.
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <a
                                href={company.mapsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => trackEvent('location_click')}
                                className="btn-secondary"
                            >
                                Ouvrir dans Google Maps
                            </a>
                            <a href={telHref(company.phones[0])} onClick={() => trackEvent('phone_click')} className="btn-primary">
                                Appeler {company.phones[0]}
                            </a>
                        </div>
                    </div>
                    <LocationMap className="aspect-[4/3]" />
                </Reveal>
            </section>
        </>
    )
}
