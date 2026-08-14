<x-layouts::app title="Contact">
    <div class="max-w-6xl mx-auto px-4 py-12">
        <h1 class="mb-8">Contact</h1>

        <div class="grid lg:grid-cols-2 gap-10">
            <div>
                <h4 class="mb-3">Coordonnées</h4>
                <ul class="space-y-1 text-neutral-700 mb-6">
                    @foreach (config('company.phones') as $phone)
                        <li><a href="tel:+226{{ str_replace(' ', '', $phone) }}" class="hover:text-accent">{{ $phone }}</a></li>
                    @endforeach
                </ul>

                <p class="text-neutral-700 mb-1"><span class="font-bold">Adresse :</span> {{ config('company.city') }}</p>
                <p class="text-neutral-700 mb-6"><span class="font-bold">Horaires :</span> Service de dépannage 24h/24 — vente de pièces aux heures ouvrées</p>

                <x-whatsapp-link class="btn-primary" />

                @if (session('status'))
                    <p class="mt-6 text-sm font-bold text-accent">{{ session('status') }}</p>
                @endif

                <form method="POST" action="{{ route('contact.store') }}" class="space-y-4 mt-8">
                    @csrf
                    <div class="field">
                        <label for="name">Nom</label>
                        <input id="name" name="name" class="input" value="{{ old('name') }}" required>
                        <x-input-error :messages="$errors->get('name')" class="mt-1" />
                    </div>
                    <div class="field">
                        <label for="message">Message</label>
                        <textarea id="message" name="message" class="input" rows="4" required>{{ old('message') }}</textarea>
                        <x-input-error :messages="$errors->get('message')" class="mt-1" />
                    </div>
                    <button type="submit" class="btn-primary">Envoyer</button>
                </form>
            </div>

            <div>
                <h4 class="mb-3">Localisation</h4>
                <a
                    href="https://maps.app.goo.gl/3RYMiXAhtHuDLkRHA"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="bg-surface aspect-[4/3] flex flex-col items-center justify-center gap-3 text-center p-6 border border-neutral-200 hover:border-accent transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-accent"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                    <span class="font-bold text-ink">{{ config('company.name') }} — {{ config('company.city') }}</span>
                    <span class="btn-primary">Voir sur Google Maps</span>
                </a>
            </div>
        </div>
    </div>
</x-layouts::app>
