<div>
    <div class="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <h1>Annonces</h1>
        <button wire:click="createNew" class="btn-primary">+ Nouvelle annonce</button>
    </div>

    @if ($showForm)
        <div class="card elev-sm p-6 mb-8">
            <h4 class="mb-4">{{ $editingId ? 'Modifier l\'annonce' : 'Nouvelle annonce' }}</h4>

            <form wire:submit="save" class="space-y-4">
                <div class="field">
                    <label for="title">Titre *</label>
                    <input id="title" class="input" wire:model="title" required>
                    @error('title') <p class="text-sm text-red-600 mt-1">{{ $message }}</p> @enderror
                </div>

                <div class="grid sm:grid-cols-2 gap-4">
                    <div class="field">
                        <label>Rubrique *</label>
                        <div class="seg">
                            <button type="button" wire:click="$set('category', 'neuf')" class="seg-opt {{ $category === 'neuf' ? 'is-active' : '' }}">Neuf</button>
                            <button type="button" wire:click="$set('category', 'occasion')" class="seg-opt {{ $category === 'occasion' ? 'is-active' : '' }}">Occasion</button>
                        </div>
                    </div>
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
                </div>

                <div class="grid sm:grid-cols-3 gap-4">
                    <div class="field">
                        <label for="model">Modèle</label>
                        <input id="model" class="input" wire:model="model">
                    </div>
                    <div class="field">
                        <label for="year_from">Année (de)</label>
                        <input id="year_from" type="number" class="input" wire:model="year_from">
                    </div>
                    <div class="field">
                        <label for="year_to">Année (à)</label>
                        <input id="year_to" type="number" class="input" wire:model="year_to">
                        @error('year_to') <p class="text-sm text-red-600 mt-1">{{ $message }}</p> @enderror
                    </div>
                </div>

                <div class="field">
                    <label for="version_provenance">Version / provenance</label>
                    <input id="version_provenance" class="input" wire:model="version_provenance">
                </div>

                <div class="field">
                    <label for="item_condition">État</label>
                    <input id="item_condition" class="input" wire:model="item_condition" placeholder="Ex : Bon état, fonctionnel">
                </div>

                <div class="field">
                    <label for="description">Description</label>
                    <textarea id="description" class="input" rows="4" wire:model="description"></textarea>
                </div>

                @if ($editingId && $editingPhotos->isNotEmpty())
                    <div class="field">
                        <label>Photos actuelles</label>
                        <div class="grid grid-cols-4 sm:grid-cols-6 gap-2">
                            @foreach ($editingPhotos as $photo)
                                <div class="relative group">
                                    <img src="{{ $photo->url }}" class="w-full aspect-square object-cover">
                                    <button
                                        type="button"
                                        wire:click="deletePhoto({{ $photo->id }})"
                                        wire:confirm="Supprimer cette photo ?"
                                        class="absolute top-1 right-1 bg-neutral-900/80 text-white w-6 h-6 flex items-center justify-center text-xs"
                                    >&times;</button>
                                </div>
                            @endforeach
                        </div>
                    </div>
                @endif

                <div class="field">
                    <label for="newPhotos">Ajouter des photos</label>
                    <input id="newPhotos" type="file" class="input" wire:model="newPhotos" multiple accept="image/*">
                    @error('newPhotos.*') <p class="text-sm text-red-600 mt-1">{{ $message }}</p> @enderror
                    <div wire:loading wire:target="newPhotos" class="text-xs text-neutral-500 mt-1">Chargement des photos…</div>
                </div>

                <div class="flex gap-3">
                    <button type="submit" class="btn-primary">{{ $editingId ? 'Enregistrer' : 'Créer l\'annonce' }}</button>
                    <button type="button" wire:click="cancelForm" class="btn-secondary">Annuler</button>
                </div>
            </form>
        </div>
    @endif

    <div class="flex flex-wrap gap-4 mb-4">
        <div class="field !mb-0 w-44">
            <select wire:model.live="filterCategory" class="input">
                <option value="">Toutes les rubriques</option>
                <option value="neuf">Neuf</option>
                <option value="occasion">Occasion</option>
            </select>
        </div>
        <div class="field !mb-0 w-44">
            <select wire:model.live="filterBrand" class="input">
                <option value="">Toutes les marques</option>
                @foreach ($brands as $b)
                    <option value="{{ $b->id }}">{{ $b->name }}</option>
                @endforeach
            </select>
        </div>
    </div>

    <div class="card elev-sm overflow-x-auto">
        <table class="table">
            <thead>
                <tr>
                    <th>Titre</th>
                    <th>Rubrique</th>
                    <th>Marque</th>
                    <th>Année</th>
                    <th>Photos</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                @forelse ($listings as $listing)
                    <tr>
                        <td class="font-bold">{{ $listing->title }}</td>
                        <td>{{ $listing->category === 'neuf' ? 'Neuf' : 'Occasion' }}</td>
                        <td>{{ $listing->brand->name }}</td>
                        <td>{{ $listing->year_from ?? '—' }}{{ $listing->year_to && $listing->year_to !== $listing->year_from ? '–'.$listing->year_to : '' }}</td>
                        <td>{{ $listing->photos->count() }}</td>
                        <td class="text-right whitespace-nowrap">
                            <button wire:click="edit({{ $listing->id }})" class="btn-ghost">Modifier</button>
                            <button wire:click="delete({{ $listing->id }})" wire:confirm="Supprimer cette annonce ?" class="btn-ghost !text-red-600">Supprimer</button>
                        </td>
                    </tr>
                @empty
                    <tr><td colspan="6" class="text-center text-neutral-500 py-6">Aucune annonce.</td></tr>
                @endforelse
            </tbody>
        </table>
    </div>

    <div class="mt-4">
        {{ $listings->links() }}
    </div>
</div>
