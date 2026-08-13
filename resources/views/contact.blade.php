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
                <div class="bg-surface aspect-[4/3] flex items-center justify-center text-neutral-400 text-sm text-center p-6">
                    Carte Google Maps à intégrer dès confirmation des coordonnées GPS par {{ config('company.name') }}.
                </div>
            </div>
        </div>
    </div>
</x-layouts::app>
