@props(['title' => null])
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ $title ? $title.' — ' : '' }}Admin — {{ config('company.name') }}</title>
    <meta name="robots" content="noindex, nofollow">
    @vite(['resources/css/app.css', 'resources/js/app.js'])
    @livewireStyles
</head>
<body class="bg-surface text-ink antialiased">
    <div x-data="{ sidebarOpen: false }" class="min-h-screen lg:flex">

        <aside :class="sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'" class="fixed lg:static inset-y-0 left-0 z-40 w-64 bg-neutral-900 text-white flex flex-col transition-transform">
            <div class="flex items-center gap-3 px-4 h-16 border-b border-neutral-800">
                <img src="{{ asset('img/logo.jpg') }}" alt="{{ config('company.name') }}" class="w-9 h-9 rounded-full object-cover">
                <span class="font-extrabold text-sm leading-tight">ABDOU CASSE AUTO<br><span class="text-accent text-xs">Espace admin</span></span>
            </div>

            <nav class="flex-1 py-4 space-y-1">
                <x-admin-nav-link :href="route('admin.dashboard')" :active="request()->routeIs('admin.dashboard')">Tableau de bord</x-admin-nav-link>
                <x-admin-nav-link :href="route('admin.annonces')" :active="request()->routeIs('admin.annonces')">Annonces</x-admin-nav-link>
                <x-admin-nav-link :href="route('admin.commandes')" :active="request()->routeIs('admin.commandes')">Commandes</x-admin-nav-link>
            </nav>

            <div class="p-4 border-t border-neutral-800">
                <form method="POST" action="{{ route('logout') }}">
                    @csrf
                    <button type="submit" class="btn-secondary btn-block !text-white !border-neutral-700 hover:!bg-neutral-800">Se déconnecter</button>
                </form>
            </div>
        </aside>

        <div class="flex-1 min-w-0">
            <div class="lg:hidden sticky top-0 z-30 bg-neutral-900 text-white h-14 flex items-center justify-between px-4">
                <span class="font-extrabold text-sm">ABDOU CASSE AUTO — Admin</span>
                <button @click="sidebarOpen = !sidebarOpen" aria-label="Menu">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
                </button>
            </div>

            <main class="p-4 sm:p-8 max-w-6xl mx-auto">
                {{ $slot }}
            </main>
        </div>
    </div>

    @livewireScripts
</body>
</html>
