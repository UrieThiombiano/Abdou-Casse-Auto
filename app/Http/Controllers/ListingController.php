<?php

namespace App\Http\Controllers;

use App\Models\Listing;
use Illuminate\View\View;

class ListingController extends Controller
{
    public function show(Listing $listing): View
    {
        abort_unless($listing->is_active, 404);

        $listing->load(['brand', 'photos']);

        return view('produit', [
            'listing' => $listing,
        ]);
    }
}
