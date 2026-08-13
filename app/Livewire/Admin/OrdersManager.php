<?php

namespace App\Livewire\Admin;

use App\Enums\OrderStatus;
use App\Models\Order;
use Livewire\Attributes\Layout;
use Livewire\Attributes\Title;
use Livewire\Component;
use Livewire\WithPagination;

#[Layout('layouts.admin')]
#[Title('Commandes — Admin')]
class OrdersManager extends Component
{
    use WithPagination;

    public ?string $filterStatus = null;
    public ?int $selectedOrderId = null;

    public function updatingFilterStatus(): void
    {
        $this->resetPage();
    }

    public function select(int $id): void
    {
        $this->selectedOrderId = $this->selectedOrderId === $id ? null : $id;
    }

    public function setStatus(int $id, string $status): void
    {
        $order = Order::query()->findOrFail($id);
        $order->update(['status' => OrderStatus::from($status)]);
    }

    public function render()
    {
        $orders = Order::query()
            ->with(['brand', 'listing'])
            ->when($this->filterStatus, fn ($q) => $q->where('status', $this->filterStatus))
            ->latest()
            ->paginate(15);

        $selectedOrder = $this->selectedOrderId
            ? Order::query()->with(['brand', 'listing'])->find($this->selectedOrderId)
            : null;

        return view('livewire.admin.orders-manager', [
            'orders' => $orders,
            'selectedOrder' => $selectedOrder,
            'statuses' => OrderStatus::cases(),
        ]);
    }
}
