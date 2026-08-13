<?php

namespace App\Livewire;

use App\Models\Brand;
use App\Models\Listing;
use Livewire\Attributes\Url;
use Livewire\Component;
use Livewire\WithPagination;

class Catalog extends Component
{
    use WithPagination;

    public string $category;

    #[Url(as: 'marque')]
    public ?int $brand = null;

    #[Url(as: 'annee')]
    public ?int $year = null;

    public function mount(string $category): void
    {
        $this->category = $category;
    }

    public function updatingBrand(): void
    {
        $this->resetPage();
    }

    public function updatingYear(): void
    {
        $this->resetPage();
    }

    public function render()
    {
        $listings = Listing::query()
            ->active()
            ->category($this->category)
            ->forBrand($this->brand)
            ->forYear($this->year)
            ->with(['brand', 'photos'])
            ->latest()
            ->paginate(12);

        return view('livewire.catalog', [
            'listings' => $listings,
            'brands' => Brand::query()->orderBy('name')->get(),
            'years' => range((int) date('Y'), 1990),
        ]);
    }
}
