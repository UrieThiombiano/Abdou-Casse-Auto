@php
    $max = max(1, $chartPoints->max('value'));
    $chartW = 600;
    $chartH = 160;
    $stepX = $chartPoints->count() > 1 ? $chartW / ($chartPoints->count() - 1) : 0;
    $points = $chartPoints->values()->map(function ($p, $i) use ($stepX, $chartH, $max) {
        $x = round($i * $stepX, 1);
        $y = round($chartH - ($p['value'] / $max) * ($chartH - 20) - 5, 1);
        return "$x,$y";
    })->implode(' ');
@endphp

<div>
    <h1 class="mb-6">Tableau de bord</h1>

    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div class="card elev-sm p-5">
            <p class="text-xs uppercase font-bold text-neutral-500 mb-1">Total commandes</p>
            <p class="text-3xl font-extrabold">{{ $totalOrders }}</p>
        </div>
        <div class="card elev-sm p-5">
            <p class="text-xs uppercase font-bold text-neutral-500 mb-1">Traitées</p>
            <p class="text-3xl font-extrabold text-accent">{{ $treatedOrders }}</p>
        </div>
        <div class="card elev-sm p-5 border-l-4 border-accent-2">
            <p class="text-xs uppercase font-bold text-neutral-500 mb-1">En attente</p>
            <p class="text-3xl font-extrabold text-accent-2">{{ $pendingOrders }}</p>
        </div>
        <div class="card elev-sm p-5">
            <p class="text-xs uppercase font-bold text-neutral-500 mb-1">Annonces actives</p>
            <p class="text-3xl font-extrabold">{{ $activeListings }}</p>
        </div>
    </div>

    <div class="card elev-sm p-5 mb-8">
        <h4 class="mb-4">Commandes — 14 derniers jours</h4>
        <svg viewBox="0 0 {{ $chartW }} {{ $chartH }}" class="w-full h-40" preserveAspectRatio="none">
            <polyline points="{{ $points }}" fill="none" stroke="#F26A21" stroke-width="2.5" />
        </svg>
        <div class="flex justify-between text-xs text-neutral-500 mt-2">
            <span>{{ $chartPoints->first()['label'] ?? '' }}</span>
            <span>{{ $chartPoints->last()['label'] ?? '' }}</span>
        </div>
    </div>

    <div class="card elev-sm p-5">
        <h4 class="mb-4">Dernières commandes</h4>
        <div class="overflow-x-auto">
            <table class="table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Client</th>
                        <th>Marque</th>
                        <th>Statut</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse ($latestOrders as $order)
                        <tr>
                            <td>{{ $order->created_at->format('d/m/Y H:i') }}</td>
                            <td>{{ $order->customer_name }}</td>
                            <td>{{ $order->brand->name }}</td>
                            <td>{{ $order->status->label() }}</td>
                        </tr>
                    @empty
                        <tr><td colspan="4" class="text-center text-neutral-500 py-6">Aucune commande pour le moment.</td></tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>
</div>
