<?php

namespace Database\Seeders;

use App\Enums\OrderStatus;
use App\Models\Brand;
use App\Models\Listing;
use App\Models\Order;
use Illuminate\Database\Seeder;

/**
 * Donnees de demonstration (local uniquement) pour pouvoir tester le
 * catalogue, les filtres et le tableau de bord admin avant que le client
 * ne fournisse ses vraies annonces/photos.
 */
class DemoDataSeeder extends Seeder
{
    public function run(): void
    {
        $brands = Brand::query()->pluck('id', 'name');

        $listings = [
            ['title' => 'Pare-choc avant', 'category' => 'neuf', 'brand' => 'Toyota', 'model' => 'Corolla', 'year_from' => 2015, 'year_to' => 2019],
            ['title' => 'Phare avant droit', 'category' => 'neuf', 'brand' => 'Hyundai', 'model' => 'Tucson', 'year_from' => 2018, 'year_to' => 2022],
            ['title' => 'Retroviseur electrique', 'category' => 'occasion', 'brand' => 'Toyota', 'model' => 'RAV4', 'year_from' => 2012, 'year_to' => 2016],
            ['title' => 'Radiateur moteur', 'category' => 'occasion', 'brand' => 'Mitsubishi', 'model' => 'Pajero', 'year_from' => 2010, 'year_to' => 2015],
            ['title' => 'Jante alliage 17"', 'category' => 'neuf', 'brand' => 'Kia', 'model' => 'Sportage', 'year_from' => 2016, 'year_to' => 2021],
            ['title' => 'Alternateur', 'category' => 'occasion', 'brand' => 'Suzuki', 'model' => 'Vitara', 'year_from' => 2013, 'year_to' => 2018],
            ['title' => 'Feu arriere gauche', 'category' => 'neuf', 'brand' => 'Lexus', 'model' => 'RX', 'year_from' => 2015, 'year_to' => 2020],
            ['title' => 'Boite a vitesse automatique', 'category' => 'occasion', 'brand' => 'Toyota', 'model' => 'Hilux', 'year_from' => 2014, 'year_to' => 2019],
        ];

        foreach ($listings as $data) {
            Listing::query()->firstOrCreate(
                ['title' => $data['title'], 'brand_id' => $brands[$data['brand']]],
                [
                    'category' => $data['category'],
                    'model' => $data['model'],
                    'year_from' => $data['year_from'],
                    'year_to' => $data['year_to'],
                    'item_condition' => $data['category'] === 'occasion' ? 'Bon etat, fonctionnel' : 'Neuf, sous emballage',
                    'description' => "{$data['title']} compatible {$data['brand']} {$data['model']}.",
                ]
            );
        }

        $firstListing = Listing::query()->first();

        Order::query()->firstOrCreate(
            ['customer_phone' => '70000000', 'vin' => 'DEMO0000000000001'],
            [
                'listing_id' => $firstListing?->id,
                'customer_name' => 'Client Demo',
                'brand_id' => $brands['Toyota'],
                'model' => 'Corolla',
                'year' => 2017,
                'status' => OrderStatus::EnAttente,
            ]
        );
    }
}
