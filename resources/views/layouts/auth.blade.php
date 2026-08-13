@props(['title' => 'Connexion'])
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ $title }} — Admin — {{ config('company.name') }}</title>
    <meta name="robots" content="noindex, nofollow">
    @vite(['resources/css/app.css', 'resources/js/app.js'])
    @livewireStyles
</head>
<body class="bg-neutral-900 text-white antialiased min-h-screen flex items-center justify-center p-4">
    <div class="w-full max-w-sm">
        <div class="flex flex-col items-center mb-6">
            <img src="{{ asset('img/logo.jpg') }}" alt="{{ config('company.name') }}" class="w-16 h-16 rounded-full object-cover mb-3">
            <span class="font-extrabold text-lg text-center">ABDOU CASSE AUTO</span>
            <span class="text-accent text-xs font-bold uppercase tracking-wide mt-1">Espace admin</span>
        </div>

        <div class="bg-white text-ink p-6 sm:p-8">
            <h1 class="text-xl mb-4">{{ $title }}</h1>
            {{ $slot }}
        </div>
    </div>

    @livewireScripts
</body>
</html>
