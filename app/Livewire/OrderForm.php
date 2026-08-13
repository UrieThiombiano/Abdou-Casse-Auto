<?php

namespace App\Livewire;

use App\Models\Brand;
use App\Models\Listing;
use App\Models\Order;
use Livewire\Attributes\Layout;
use Livewire\Attributes\Title;
use Livewire\Attributes\Url;
use Livewire\Component;

#[Layout('layouts.app')]
#[Title('Commander une pièce — Abdou Casse Auto')]
class OrderForm extends Component
{
    #[Url]
    public ?int $piece = null;

    public ?Listing $selectedListing = null;

    public string $customer_name = '';
    public string $customer_phone = '';
    public string $vin = '';
    public ?int $brand_id = null;
    public string $model = '';
    public string $version_provenance = '';
    public ?int $year = null;
    public string $comment = '';

    public bool $submitted = false;

    public function mount(): void
    {
        if ($this->piece) {
            $this->selectedListing = Listing::query()->find($this->piece);

            if ($this->selectedListing) {
                $this->brand_id = $this->selectedListing->brand_id;
                $this->model = (string) $this->selectedListing->model;
            }
        }
    }

    protected function rules(): array
    {
        return [
            'customer_name' => ['required', 'string', 'max:255'],
            'customer_phone' => ['required', 'string', 'max:30'],
            'vin' => ['required', 'string', 'max:50'],
            'brand_id' => ['required', 'exists:brands,id'],
            'model' => ['nullable', 'string', 'max:255'],
            'version_provenance' => ['nullable', 'string', 'max:255'],
            'year' => ['nullable', 'integer', 'min:1980', 'max:'.((int) date('Y') + 1)],
            'comment' => ['nullable', 'string', 'max:2000'],
        ];
    }

    public function submit(): void
    {
        $data = $this->validate();

        Order::query()->create([
            ...$data,
            'listing_id' => $this->selectedListing?->id,
        ]);

        $this->submitted = true;
    }

    public function render()
    {
        return view('livewire.order-form', [
            'brands' => Brand::query()->orderBy('name')->get(),
        ]);
    }
}
