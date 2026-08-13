<x-layouts::app title="Accueil">

    {{-- Hero --}}
    <section class="bg-neutral-900 text-white">
        <div class="max-w-6xl mx-auto px-4 py-16 sm:py-24 grid lg:grid-cols-3 gap-10 items-center">
            <div class="lg:col-span-2" style="animation: fadeInUp .6s ease both">
                <h1 class="text-white text-4xl sm:text-5xl mb-4">PIÈCES AUTO NEUVES &amp; D'OCCASION</h1>
                <p class="text-neutral-300 text-lg mb-8 max-w-xl">
                    Trouvez la pièce qu'il vous faut par marque de véhicule. Commande en ligne, paiement à la livraison uniquement — {{ config('company.delivery_zone') }}.
                </p>

                <form action="{{ route('pieces-neuves') }}" method="GET" class="bg-white p-4 flex flex-col sm:flex-row gap-3 max-w-xl">
                    <div class="field flex-1 !mb-0">
                        <label for="hero-marque" class="!text-neutral-500">Marque</label>
                        <select id="hero-marque" name="marque" class="input !bg-surface">
                            <option value="">Toutes les marques</option>
                            @foreach ($brands as $brand)
                                <option value="{{ $brand->id }}">{{ $brand->name }}</option>
                            @endforeach
                        </select>
                    </div>
                    <button type="submit" class="btn-primary sm:self-end">Rechercher</button>
                </form>

                <a href="{{ route('occasion') }}" class="btn-secondary !border-neutral-600 !text-white mt-6 inline-flex">
                    Voir les pièces d'occasion — France au revoir
                </a>
            </div>

            <div class="bg-neutral-800 p-6 border-t-4 border-accent" style="animation: fadeInUp .6s .1s ease both">
                <div class="badge-circle w-14 h-14 bg-accent text-white font-extrabold text-xs text-center mb-4">24h/24</div>
                <h3 class="text-white mb-2">Dépannage Service 24h/24</h3>
                <p class="text-neutral-400 text-sm mb-4">Une urgence sur la route ? Notre équipe de dépannage reste joignable à toute heure.</p>
                <a href="tel:+226{{ str_replace(' ', '', config('company.phones')[0]) }}" class="btn-secondary !border-neutral-600 !text-white btn-block">
                    {{ config('company.phones')[0] }}
                </a>
            </div>
        </div>
    </section>

    {{-- 3 cartes --}}
    <section class="max-w-6xl mx-auto px-4 py-16">
        <div class="grid gap-5 sm:grid-cols-3">
            <a href="{{ route('pieces-neuves') }}" class="card elev-sm border-t-4 border-accent p-6 hover:shadow-lg transition-shadow" style="animation: fadeInUp .5s ease both">
                <h3 class="mb-2">Pièces neuves</h3>
                <p class="text-sm text-neutral-600 mb-4">Catalogue de pièces neuves, filtrable par marque et année.</p>
                <span class="btn-ghost">Voir le catalogue →</span>
            </a>
            <a href="{{ route('occasion') }}" class="card elev-sm border-t-4 border-accent-2 p-6 hover:shadow-lg transition-shadow" style="animation: fadeInUp .5s .1s ease both">
                <h3 class="mb-2">Occasion — France au revoir</h3>
                <p class="text-sm text-neutral-600 mb-4">Pièces d'occasion importées, état vérifié, photos réelles.</p>
                <span class="btn-ghost">Voir le catalogue →</span>
            </a>
            <a href="{{ route('commander') }}" class="card elev-sm border-t-4 border-neutral-800 p-6 hover:shadow-lg transition-shadow" style="animation: fadeInUp .5s .2s ease both">
                <h3 class="mb-2">Commander</h3>
                <p class="text-sm text-neutral-600 mb-4">Demandez la pièce qu'il vous faut, sans paiement en ligne.</p>
                <span class="btn-ghost">Commander →</span>
            </a>
        </div>
    </section>

    {{-- Réassurance --}}
    <section class="bg-surface py-16">
        <div class="max-w-6xl mx-auto px-4 grid gap-8 sm:grid-cols-2 lg:grid-cols-4 text-center">
            @foreach ([
                ['label' => 'Service 24h/24', 'text' => 'Dépannage et assistance à toute heure'],
                ['label' => 'Paiement livraison', 'text' => 'Aucun paiement en ligne requis'],
                ['label' => 'Livraison Ouaga', 'text' => config('company.delivery_zone')],
                ['label' => 'Téléphone', 'text' => config('company.phones')[0]],
            ] as $i => $item)
                <div style="animation: fadeInUp .5s {{ $i * 0.1 }}s ease both">
                    <div class="badge-circle w-16 h-16 bg-accent text-white mx-auto mb-3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                    </div>
                    <h5 class="mb-1">{{ $item['label'] }}</h5>
                    <p class="text-sm text-neutral-600">{{ $item['text'] }}</p>
                </div>
            @endforeach
        </div>
    </section>

    {{-- Qui sommes-nous --}}
    <section id="qui-sommes-nous" class="max-w-6xl mx-auto px-4 py-16 scroll-mt-20">
        <h2 class="mb-4">Qui sommes-nous</h2>
        <p class="text-neutral-600 max-w-3xl mb-10">
            {{ config('company.name') }} est une entreprise de dépannage automobile 24h/24 basée à {{ config('company.city') }},
            aujourd'hui reconnue pour son activité de casse auto. Nous digitalisons la vente de nos pièces détachées neuves
            et d'occasion pour vous offrir un accès simple et rapide au bon prix — payé uniquement à la livraison.
        </p>
        <div class="grid sm:grid-cols-2 gap-5">
            <div class="card elev-sm p-6">
                <h4 class="mb-2">Dépannage</h4>
                <p class="text-sm text-neutral-600">Remorquage et assistance automobile 24h/24, un service de confiance depuis longtemps à {{ config('company.city') }}.</p>
            </div>
            <div class="card elev-sm p-6">
                <h4 class="mb-2">Pièces détachées</h4>
                <p class="text-sm text-neutral-600">Un large choix de pièces neuves et d'occasion, sélectionnées et vérifiées avant mise en vente.</p>
            </div>
        </div>
    </section>

</x-layouts::app>
