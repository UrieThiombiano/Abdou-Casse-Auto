<?php

namespace Database\Seeders;

use App\Models\Brand;
use Illuminate\Database\Seeder;

class BrandSeeder extends Seeder
{
    /**
     * Marques fournies par le client (cahier des charges §14).
     */
    public function run(): void
    {
        collect(['Toyota', 'Hyundai', 'Mitsubishi', 'Suzuki', 'Lexus', 'Kia'])
            ->each(fn (string $name) => Brand::query()->firstOrCreate(['name' => $name]));
    }
}
