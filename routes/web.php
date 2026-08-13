<?php

use App\Http\Controllers\ContactController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\ListingController;
use Illuminate\Support\Facades\Route;

Route::get('/', [HomeController::class, 'index'])->name('home');

Route::view('/pieces-neuves', 'catalog', ['category' => 'neuf'])->name('pieces-neuves');
Route::view('/occasion', 'catalog', ['category' => 'occasion'])->name('occasion');

Route::get('/produit/{listing}', [ListingController::class, 'show'])->name('produit.show');

Route::get('/commander', \App\Livewire\OrderForm::class)->name('commander');

Route::get('/contact', [ContactController::class, 'index'])->name('contact');
Route::post('/contact', [ContactController::class, 'store'])->name('contact.store');

require __DIR__.'/auth.php';
require __DIR__.'/admin.php';
