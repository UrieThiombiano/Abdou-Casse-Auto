<?php

namespace App\Http\Controllers;

use App\Models\Brand;
use Illuminate\View\View;

class HomeController extends Controller
{
    public function index(): View
    {
        return view('home', [
            'brands' => Brand::query()->orderBy('name')->get(),
        ]);
    }
}
