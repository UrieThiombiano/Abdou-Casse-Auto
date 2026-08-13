<?php

namespace App\Livewire\Admin;

use App\Models\Brand;
use App\Models\Listing;
use App\Models\ListingPhoto;
use App\Support\ImageUploader;
use Illuminate\Support\Facades\Storage;
use Livewire\Attributes\Layout;
use Livewire\Attributes\Title;
use Livewire\Component;
use Livewire\WithFileUploads;
use Livewire\WithPagination;

#[Layout('layouts.admin')]
#[Title('Annonces — Admin')]
class ListingsManager extends Component
{
    use WithFileUploads;
    use WithPagination;

    public ?string $filterCategory = null;
    public ?int $filterBrand = null;

    public bool $showForm = false;
    public ?int $editingId = null;

    public string $title = '';
    public string $category = 'neuf';
    public ?int $brand_id = null;
    public string $model = '';
    public ?int $year_from = null;
    public ?int $year_to = null;
    public string $version_provenance = '';
    public string $item_condition = '';
    public string $description = '';

    /** @var array<int, \Livewire\Features\SupportFileUploads\TemporaryUploadedFile> */
    public array $newPhotos = [];

    public function updatingFilterCategory(): void
    {
        $this->resetPage();
    }

    public function updatingFilterBrand(): void
    {
        $this->resetPage();
    }

    protected function rules(): array
    {
        $maxYear = (int) date('Y') + 1;

        return [
            'title' => ['required', 'string', 'max:255'],
            'category' => ['required', 'in:neuf,occasion'],
            'brand_id' => ['required', 'exists:brands,id'],
            'model' => ['nullable', 'string', 'max:255'],
            'year_from' => ['nullable', 'integer', 'min:1980', 'max:'.$maxYear],
            'year_to' => ['nullable', 'integer', 'min:1980', 'max:'.$maxYear, 'gte:year_from'],
            'version_provenance' => ['nullable', 'string', 'max:255'],
            'item_condition' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:5000'],
            'newPhotos.*' => ['nullable', 'image', 'max:8192'],
        ];
    }

    public function createNew(): void
    {
        $this->resetForm();
        $this->showForm = true;
    }

    public function edit(int $id): void
    {
        $listing = Listing::query()->findOrFail($id);

        $this->editingId = $listing->id;
        $this->title = $listing->title;
        $this->category = $listing->category;
        $this->brand_id = $listing->brand_id;
        $this->model = (string) $listing->model;
        $this->year_from = $listing->year_from;
        $this->year_to = $listing->year_to;
        $this->version_provenance = (string) $listing->version_provenance;
        $this->item_condition = (string) $listing->item_condition;
        $this->description = (string) $listing->description;
        $this->newPhotos = [];
        $this->showForm = true;
    }

    public function cancelForm(): void
    {
        $this->resetForm();
    }

    public function save(): void
    {
        $data = $this->validate();
        $photos = $data['newPhotos'] ?? [];
        unset($data['newPhotos']);

        $listing = $this->editingId
            ? Listing::query()->findOrFail($this->editingId)
            : new Listing;

        $listing->fill($data);
        $listing->save();

        $nextPosition = $listing->photos()->max('position') + 1;

        foreach ($photos as $photo) {
            $path = ImageUploader::storeCompressed($photo, 'listings/'.$listing->id);

            ListingPhoto::query()->create([
                'listing_id' => $listing->id,
                'path' => $path,
                'position' => $nextPosition++,
            ]);
        }

        $this->resetForm();
    }

    public function deletePhoto(int $photoId): void
    {
        $photo = ListingPhoto::query()->findOrFail($photoId);

        abort_unless($photo->listing_id === $this->editingId, 403);

        Storage::disk('public')->delete($photo->path);
        $photo->delete();
    }

    public function delete(int $id): void
    {
        $listing = Listing::query()->with('photos')->findOrFail($id);

        foreach ($listing->photos as $photo) {
            Storage::disk('public')->delete($photo->path);
        }

        $listing->delete();

        if ($this->editingId === $id) {
            $this->resetForm();
        }
    }

    protected function resetForm(): void
    {
        $this->reset([
            'showForm', 'editingId', 'title', 'category', 'brand_id', 'model',
            'year_from', 'year_to', 'version_provenance', 'item_condition',
            'description', 'newPhotos',
        ]);
        $this->category = 'neuf';
        $this->resetErrorBag();
    }

    public function render()
    {
        $listings = Listing::query()
            ->with(['brand', 'photos'])
            ->when($this->filterCategory, fn ($q) => $q->where('category', $this->filterCategory))
            ->when($this->filterBrand, fn ($q) => $q->where('brand_id', $this->filterBrand))
            ->latest()
            ->paginate(15);

        $editingPhotos = $this->editingId
            ? Listing::query()->find($this->editingId)?->photos
            : collect();

        return view('livewire.admin.listings-manager', [
            'listings' => $listings,
            'brands' => Brand::query()->orderBy('name')->get(),
            'editingPhotos' => $editingPhotos,
        ]);
    }
}
