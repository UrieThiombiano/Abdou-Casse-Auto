<x-layouts::auth title="Mot de passe oublié">
    <p class="text-sm text-neutral-600 mb-4">
        Indiquez votre email : nous vous enverrons un lien pour réinitialiser votre mot de passe.
    </p>

    <x-auth-session-status class="mb-4" :status="session('status')" />

    <form method="POST" action="{{ route('password.email') }}" class="space-y-4">
        @csrf

        <div class="field">
            <label for="email">Email</label>
            <input id="email" class="input" type="email" name="email" value="{{ old('email') }}" required autofocus>
            <x-input-error :messages="$errors->get('email')" class="mt-1" />
        </div>

        <button type="submit" class="btn-primary btn-block">Envoyer le lien de réinitialisation</button>
    </form>
</x-layouts::auth>
