<x-layouts::app :title="$listing->title">
    <div class="max-w-6xl mx-auto px-4 py-8">
        <a href="{{ route($listing->category === 'neuf' ? 'pieces-neuves' : 'occasion') }}" class="btn-ghost mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Retour au catalogue
        </a>

        <div class="grid lg:grid-cols-2 gap-10">
            <div>
                @if ($listing->photos->isNotEmpty())
                    <div x-data="{ active: 0, photos: {{ \Illuminate\Support\Js::from($listing->photos->pluck('url')) }} }">
                        <img :src="photos[active]" alt="{{ $listing->title }}" class="w-full aspect-[4/3] object-cover mb-3">
                        @if ($listing->photos->count() > 1)
                            <div class="grid grid-cols-4 gap-2">
                                @foreach ($listing->photos as $i => $photo)
                                    <button @click="active = {{ $i }}" type="button">
                                        <img src="{{ $photo->url }}" alt="" class="w-full aspect-square object-cover" :class="active === {{ $i }} ? 'ring-2 ring-accent' : ''">
                                    </button>
                                @endforeach
                            </div>
                        @endif
                    </div>
                @else
                    <x-photo-placeholder class="w-full aspect-[4/3]" />
                @endif
            </div>

            <div>
                @if ($listing->category === 'neuf')
                    <span class="tag-accent mb-3">Neuf</span>
                @else
                    <span class="tag-accent-2 mb-3">Occasion · France au revoir</span>
                @endif

                <h1 class="mb-2">{{ $listing->title }}</h1>
                <p class="text-neutral-600 mb-6">
                    {{ $listing->brand->name }}
                    @if ($listing->model) · {{ $listing->model }} @endif
                    @if ($listing->year_from) · {{ $listing->year_from }}{{ $listing->year_to && $listing->year_to !== $listing->year_from ? '–'.$listing->year_to : '' }} @endif
                </p>

                @if ($listing->description)
                    <p class="text-neutral-700 mb-4">{{ $listing->description }}</p>
                @endif

                @if ($listing->item_condition)
                    <p class="text-sm mb-6"><span class="font-bold">État :</span> {{ $listing->item_condition }}</p>
                @endif

                <div class="bg-accent-100 border border-accent-200 p-4 text-sm mb-6">
                    <strong>Aucun prix affiché en ligne</strong> — paiement à la livraison uniquement. Notre équipe vous
                    contactera pour confirmer la disponibilité et le montant.
                </div>

                <div class="flex flex-col sm:flex-row gap-3">
                    <a href="{{ route('commander', ['piece' => $listing->id]) }}" class="btn-primary">Commander cette pièce</a>
                    <x-whatsapp-link :text="'Bonjour, je suis intéressé(e) par : '.$listing->title" />
                </div>
            </div>
        </div>
    </div>
</x-layouts::app>
