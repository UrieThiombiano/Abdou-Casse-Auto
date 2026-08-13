<div>
    <div class="bg-surface border-b border-neutral-200">
        <div class="max-w-6xl mx-auto px-4 py-6">
            <h1 class="mb-4">{{ $category === 'neuf' ? 'Pièces neuves' : 'Occasion — France au revoir' }}</h1>
            <div class="flex flex-wrap gap-4">
                <div class="field !mb-0 w-44">
                    <label>Marque</label>
                    <select wire:model.live="brand" class="input">
                        <option value="">Toutes les marques</option>
                        @foreach ($brands as $b)
                            <option value="{{ $b->id }}">{{ $b->name }}</option>
                        @endforeach
                    </select>
                </div>
                <div class="field !mb-0 w-32">
                    <label>Année</label>
                    <select wire:model.live="year" class="input">
                        <option value="">Toutes</option>
                        @foreach ($years as $y)
                            <option value="{{ $y }}">{{ $y }}</option>
                        @endforeach
                    </select>
                </div>
            </div>
        </div>
    </div>

    <div class="max-w-6xl mx-auto px-4 py-8">
        <p class="text-sm text-neutral-600 mb-6" wire:loading.remove>
            {{ $listings->total() }} résultat{{ $listings->total() > 1 ? 's' : '' }}
        </p>

        <div wire:loading class="text-sm text-neutral-500 mb-6">Chargement…</div>

        <div wire:loading.remove class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            @forelse ($listings as $i => $listing)
                <a
                    href="{{ route('produit.show', $listing) }}"
                    class="card elev-sm hover:shadow-lg transition-shadow overflow-hidden"
                    style="animation: fadeInUp .4s {{ min($i, 8) * 0.05 }}s ease both"
                >
                    @if ($listing->photos->isNotEmpty())
                        <img src="{{ $listing->photos->first()->url }}" alt="{{ $listing->title }}" class="w-full aspect-[4/3] object-cover">
                    @else
                        <x-photo-placeholder />
                    @endif
                    <div class="p-4">
                        @if ($listing->category === 'neuf')
                            <span class="tag-accent mb-2">Neuf</span>
                        @else
                            <span class="tag-accent-2 mb-2">Occasion · France au revoir</span>
                        @endif
                        <h4 class="mb-1">{{ $listing->title }}</h4>
                        <p class="text-sm text-neutral-600">
                            {{ $listing->brand->name }}
                            @if ($listing->model) · {{ $listing->model }} @endif
                            @if ($listing->year_from) · {{ $listing->year_from }}{{ $listing->year_to && $listing->year_to !== $listing->year_from ? '–'.$listing->year_to : '' }} @endif
                        </p>
                    </div>
                </a>
            @empty
                <p class="col-span-full text-neutral-500 py-12 text-center">Aucune annonce ne correspond à ces critères pour le moment.</p>
            @endforelse
        </div>

        <div class="mt-8">
            {{ $listings->links() }}
        </div>
    </div>
</div>
