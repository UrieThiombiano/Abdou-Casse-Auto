<?php

namespace App\Livewire\Admin;

use App\Enums\OrderStatus;
use App\Models\Listing;
use App\Models\Order;
use Illuminate\Support\Carbon;
use Livewire\Attributes\Layout;
use Livewire\Attributes\Title;
use Livewire\Component;

#[Layout('layouts.admin')]
#[Title('Tableau de bord — Admin')]
class Dashboard extends Component
{
    public function render()
    {
        $days = collect(range(13, 0))->map(fn (int $i) => Carbon::today()->subDays($i));

        $ordersByDay = Order::query()
            ->selectRaw('DATE(created_at) as day, COUNT(*) as total')
            ->where('created_at', '>=', Carbon::today()->subDays(13))
            ->groupBy('day')
            ->pluck('total', 'day');

        $chartPoints = $days->map(fn (Carbon $day) => [
            'label' => $day->format('d/m'),
            'value' => (int) ($ordersByDay[$day->toDateString()] ?? 0),
        ])->values();

        return view('livewire.admin.dashboard', [
            'totalOrders' => Order::query()->count(),
            'treatedOrders' => Order::query()->where('status', OrderStatus::Traitee)->count(),
            'pendingOrders' => Order::query()->where('status', OrderStatus::EnAttente)->count(),
            'activeListings' => Listing::query()->active()->count(),
            'chartPoints' => $chartPoints,
            'latestOrders' => Order::query()->with('brand')->latest()->limit(8)->get(),
        ]);
    }
}
