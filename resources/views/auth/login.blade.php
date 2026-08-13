<x-layouts::auth title="Connexion">
    <x-auth-session-status class="mb-4" :status="session('status')" />

    <form method="POST" action="{{ route('login') }}" class="space-y-4">
        @csrf

        <div class="field">
            <label for="email">Identifiant (email)</label>
            <input id="email" class="input" type="email" name="email" value="{{ old('email') }}" required autofocus autocomplete="username">
            <x-input-error :messages="$errors->get('email')" class="mt-1" />
        </div>

        <div class="field">
            <label for="password">Mot de passe</label>
            <input id="password" class="input" type="password" name="password" required autocomplete="current-password">
            <x-input-error :messages="$errors->get('password')" class="mt-1" />
        </div>

        <label class="flex items-center gap-2 text-sm">
            <input type="checkbox" name="remember">
            Se souvenir de moi
        </label>

        <button type="submit" class="btn-primary btn-block">Se connecter</button>

        @if (Route::has('password.request'))
            <a href="{{ route('password.request') }}" class="block text-center text-sm text-neutral-600 hover:text-accent">
                Mot de passe oublié ?
            </a>
        @endif
    </form>
</x-layouts::auth>
