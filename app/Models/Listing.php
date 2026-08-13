<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'title',
    'category',
    'brand_id',
    'model',
    'year_from',
    'year_to',
    'version_provenance',
    'item_condition',
    'description',
    'is_active',
])]
class Listing extends Model
{
    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class);
    }

    public function photos(): HasMany
    {
        return $this->hasMany(ListingPhoto::class)->orderBy('position');
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeCategory($query, string $category)
    {
        return $query->where('category', $category);
    }

    public function scopeForBrand($query, ?int $brandId)
    {
        return $brandId ? $query->where('brand_id', $brandId) : $query;
    }

    public function scopeForYear($query, ?int $year)
    {
        if (! $year) {
            return $query;
        }

        return $query
            ->where(function ($q) use ($year) {
                $q->whereNull('year_from')->orWhere('year_from', '<=', $year);
            })
            ->where(function ($q) use ($year) {
                $q->whereNull('year_to')->orWhere('year_to', '>=', $year);
            });
    }
}
