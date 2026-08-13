<div>
    <div class="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <h1>Commandes</h1>
        <a href="{{ route('admin.commandes.export') }}" class="btn-secondary">Exporter en Excel (CSV)</a>
    </div>

    <div class="field !mb-4 w-52">
        <select wire:model.live="filterStatus" class="input">
            <option value="">Tous les statuts</option>
            @foreach ($statuses as $status)
                <option value="{{ $status->value }}">{{ $status->label() }}</option>
            @endforeach
        </select>
    </div>

    <div class="grid lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 card elev-sm overflow-x-auto">
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
                    @forelse ($orders as $order)
                        <tr
                            wire:click="select({{ $order->id }})"
                            class="cursor-pointer {{ $selectedOrder?->id === $order->id ? 'bg-accent-100' : 'hover:bg-neutral-100' }}"
                        >
                            <td>{{ $order->created_at->format('d/m/Y H:i') }}</td>
                            <td>{{ $order->customer_name }}</td>
                            <td>{{ $order->brand->name }}</td>
                            <td>{{ $order->status->label() }}</td>
                        </tr>
                    @empty
                        <tr><td colspan="4" class="text-center text-neutral-500 py-6">Aucune commande.</td></tr>
                    @endforelse
                </tbody>
            </table>
            <div class="p-4">
                {{ $orders->links() }}
            </div>
        </div>

        <div>
            @if ($selectedOrder)
                <div class="card elev-sm p-5">
                    <h4 class="mb-4">Commande #{{ $selectedOrder->id }}</h4>

                    <dl class="text-sm space-y-2 mb-5">
                        <div><dt class="text-neutral-500">Client</dt><dd class="font-bold">{{ $selectedOrder->customer_name }}</dd></div>
                        <div><dt class="text-neutral-500">Téléphone</dt><dd><a href="tel:{{ $selectedOrder->customer_phone }}" class="hover:text-accent">{{ $selectedOrder->customer_phone }}</a></dd></div>
                        <div><dt class="text-neutral-500">VIN / châssis</dt><dd>{{ $selectedOrder->vin }}</dd></div>
                        <div><dt class="text-neutral-500">Véhicule</dt><dd>{{ $selectedOrder->brand->name }} {{ $selectedOrder->model }} {{ $selectedOrder->year }}</dd></div>
                        @if ($selectedOrder->version_provenance)
                            <div><dt class="text-neutral-500">Version / provenance</dt><dd>{{ $selectedOrder->version_provenance }}</dd></div>
                        @endif
                        @if ($selectedOrder->listing)
                            <div><dt class="text-neutral-500">Pièce liée</dt><dd>{{ $selectedOrder->listing->title }}</dd></div>
                        @endif
                        @if ($selectedOrder->comment)
                            <div><dt class="text-neutral-500">Commentaire</dt><dd>{{ $selectedOrder->comment }}</dd></div>
                        @endif
                    </dl>

                    <label class="block text-xs font-bold uppercase text-neutral-500 mb-2">Statut</label>
                    <div class="seg mb-4">
                        @foreach ($statuses as $status)
                            <button
                                wire:click="setStatus({{ $selectedOrder->id }}, '{{ $status->value }}')"
                                class="seg-opt {{ $selectedOrder->status === $status ? 'is-active' : '' }}"
                            >{{ $status->label() }}</button>
                        @endforeach
                    </div>

                    <a href="https://wa.me/226{{ preg_replace('/\D/', '', $selectedOrder->customer_phone) }}" target="_blank" rel="noopener" class="btn-secondary btn-block">
                        Écrire sur WhatsApp
                    </a>
                </div>
            @else
                <div class="card elev-sm p-5 text-center text-neutral-500 text-sm">
                    Sélectionnez une commande pour voir le détail.
                </div>
            @endif
        </div>
    </div>
</div>
