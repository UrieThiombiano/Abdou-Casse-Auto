@props(['title' => null])
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ $title ? $title.' — ' : '' }}{{ config('company.name') }} — Pièces auto neuves & occasion, Ouagadougou</title>
    <meta name="description" content="Pièces auto neuves et d'occasion (France au revoir) à Ouagadougou. Commande en ligne, paiement à la livraison. {{ config('company.tagline') }}.">
    @vite(['resources/css/app.css', 'resources/js/app.js'])
    @livewireStyles
</head>
<body class="bg-bg text-ink antialiased">

    <header x-data="{ mobileOpen: false }" class="sticky top-0 z-40 bg-white border-b border-neutral-200">
        <div class="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
            <a href="{{ route('home') }}" class="flex items-center gap-3 shrink-0">
                <img src="{{ asset('img/logo.jpg') }}" alt="{{ config('company.name') }}" class="w-10 h-10 rounded-full object-cover">
                <span class="font-sans font-extrabold tracking-tight leading-none hidden sm:block">ABDOU CASSE<br>AUTO</span>
            </a>

            <nav class="hidden lg:flex items-center gap-6">
                <x-public-nav-link :href="route('home')" :active="request()->routeIs('home')">Accueil</x-public-nav-link>
                <x-public-nav-link :href="route('pieces-neuves')" :active="request()->routeIs('pieces-neuves')">Pièces neuves</x-public-nav-link>
                <x-public-nav-link :href="route('occasion')" :active="request()->routeIs('occasion')">Occasion</x-public-nav-link>
                <x-public-nav-link :href="route('contact')" :active="request()->routeIs('contact')">Contact</x-public-nav-link>
            </nav>

            <div class="hidden lg:flex items-center gap-3 shrink-0">
                <a href="tel:+226{{ str_replace(' ', '', config('company.phones')[0]) }}" class="btn-secondary">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                    {{ config('company.phones')[0] }}
                </a>
                <a href="{{ route('commander') }}" class="btn-primary">Commander une pièce</a>
            </div>

            <button @click="mobileOpen = !mobileOpen" class="lg:hidden" aria-label="Menu">
                <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
            </button>
        </div>

        <div x-show="mobileOpen" x-cloak x-transition class="lg:hidden border-t border-neutral-200 bg-white px-4 py-4 space-y-3">
            <x-public-nav-link :href="route('home')" class="block">Accueil</x-public-nav-link>
            <x-public-nav-link :href="route('pieces-neuves')" class="block">Pièces neuves</x-public-nav-link>
            <x-public-nav-link :href="route('occasion')" class="block">Occasion</x-public-nav-link>
            <x-public-nav-link :href="route('contact')" class="block">Contact</x-public-nav-link>
            <a href="{{ route('commander') }}" class="btn-primary btn-block">Commander une pièce</a>
            <a href="tel:+226{{ str_replace(' ', '', config('company.phones')[0]) }}" class="btn-secondary btn-block">{{ config('company.phones')[0] }}</a>
        </div>
    </header>

    <main>
        {{ $slot }}
    </main>

    <footer class="bg-neutral-900 text-white mt-16">
        <div class="max-w-6xl mx-auto px-4 py-12 grid gap-8 sm:grid-cols-3">
            <div>
                <div class="flex items-center gap-3 mb-3">
                    <img src="{{ asset('img/logo.jpg') }}" alt="{{ config('company.name') }}" class="w-10 h-10 rounded-full object-cover">
                    <span class="font-extrabold">ABDOU CASSE AUTO</span>
                </div>
                <p class="text-sm text-neutral-400">{{ config('company.tagline') }} — {{ config('company.city') }}</p>
            </div>
            <div>
                <h6 class="text-xs font-extrabold uppercase tracking-wide text-neutral-400 mb-3">Contact</h6>
                <ul class="space-y-1 text-sm">
                    @foreach (config('company.phones') as $phone)
                        <li><a href="tel:+226{{ str_replace(' ', '', $phone) }}" class="hover:text-accent">{{ $phone }}</a></li>
                    @endforeach
                </ul>
            </div>
            <div>
                <h6 class="text-xs font-extrabold uppercase tracking-wide text-neutral-400 mb-3">Liens</h6>
                <ul class="space-y-1 text-sm">
                    <li><a href="{{ route('pieces-neuves') }}" class="hover:text-accent">Pièces neuves</a></li>
                    <li><a href="{{ route('occasion') }}" class="hover:text-accent">Occasion — France au revoir</a></li>
                    <li><a href="{{ route('contact') }}" class="hover:text-accent">Contact</a></li>
                </ul>
            </div>
        </div>
        <div class="border-t border-neutral-800 px-4 py-4 text-center text-xs text-neutral-500">
            &copy; {{ date('Y') }} {{ config('company.name') }} — Paiement à la livraison uniquement. Aucun prix n'est affiché en ligne.
        </div>
    </footer>

    <a
        href="{{ route('commander') }}"
        class="fixed bottom-5 right-5 z-30 btn-primary shadow-lg animate-[ctaPulse_2.4s_ease-in-out_infinite]"
    >
        Commander une pièce
    </a>

    @livewireScripts
</body>
</html>
