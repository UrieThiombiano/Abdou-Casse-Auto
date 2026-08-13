<div class="max-w-2xl mx-auto px-4 py-12">
    @if ($submitted)
        <div class="text-center py-12">
            <div class="badge-circle w-20 h-20 bg-accent text-white mx-auto mb-6" style="animation: scaleIn .4s ease both">
                <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <h1 class="mb-3">Votre demande a été envoyée</h1>
            <p class="text-neutral-600 max-w-md mx-auto mb-8">
                Notre équipe vous contactera pour confirmer la disponibilité et organiser la livraison.
                Paiement à la livraison uniquement — aucun paiement en ligne n'est requis.
            </p>
            <a href="{{ route('home') }}" class="btn-primary">Retour à l'accueil</a>
        </div>
    @else
        <h1 class="mb-2">Commander une pièce</h1>
        <p class="text-neutral-600 mb-6">
            Aucun paiement en ligne n'est requis. Le règlement se fait uniquement à la livraison.
        </p>

        @if ($selectedListing)
            <div class="bg-surface border border-neutral-200 p-4 mb-6 flex items-center justify-between gap-4">
                <div>
                    <p class="text-xs uppercase font-bold text-neutral-500 mb-1">Pièce sélectionnée</p>
                    <p class="font-bold">{{ $selectedListing->title }}</p>
                    <p class="text-sm text-neutral-600">{{ $selectedListing->brand->name }} @if($selectedListing->model) · {{ $selectedListing->model }} @endif</p>
                </div>
            </div>
        @endif

        <form wire:submit="submit" class="space-y-4">
            <div class="field">
                <label for="customer_name">Nom complet *</label>
                <input id="customer_name" class="input" wire:model="customer_name" required>
                @error('customer_name') <p class="text-sm text-red-600 mt-1">{{ $message }}</p> @enderror
            </div>

            <div class="field">
                <label for="customer_phone">Téléphone / WhatsApp *</label>
                <input id="customer_phone" class="input" wire:model="customer_phone" required>
                @error('customer_phone') <p class="text-sm text-red-600 mt-1">{{ $message }}</p> @enderror
            </div>

            <div class="field">
                <label for="vin">VIN / N° de châssis *</label>
                <input id="vin" class="input" wire:model="vin" required>
                @error('vin') <p class="text-sm text-red-600 mt-1">{{ $message }}</p> @enderror
            </div>

            <div class="grid sm:grid-cols-2 gap-4">
                <div class="field">
                    <label for="brand_id">Marque *</label>
                    <select id="brand_id" class="input" wire:model="brand_id" required>
                        <option value="">Sélectionner</option>
                        @foreach ($brands as $b)
                            <option value="{{ $b->id }}">{{ $b->name }}</option>
                        @endforeach
                    </select>
                    @error('brand_id') <p class="text-sm text-red-600 mt-1">{{ $message }}</p> @enderror
                </div>
                <div class="field">
                    <label for="model">Modèle</label>
                    <input id="model" class="input" wire:model="model">
                </div>
            </div>

            <div class="grid sm:grid-cols-2 gap-4">
                <div class="field">
                    <label for="version_provenance">Version / provenance</label>
                    <input id="version_provenance" class="input" wire:model="version_provenance">
                </div>
                <div class="field">
                    <label for="year">Année de fabrication</label>
                    <input id="year" type="number" class="input" wire:model="year">
                    @error('year') <p class="text-sm text-red-600 mt-1">{{ $message }}</p> @enderror
                </div>
            </div>

            <div class="field">
                <label for="comment">Commentaire (optionnel)</label>
                <textarea id="comment" class="input" rows="3" wire:model="comment"></textarea>
            </div>

            <button type="submit" class="btn-primary btn-block" wire:loading.attr="disabled" wire:target="submit">
                <span wire:loading.remove wire:target="submit">Envoyer la demande</span>
                <span wire:loading wire:target="submit">Envoi…</span>
            </button>
        </form>
    @endif
</div>
