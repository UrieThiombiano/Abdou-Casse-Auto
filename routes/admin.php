<?php

use App\Http\Controllers\Admin\OrderExportController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->prefix('admin')->name('admin.')->group(function () {
    Route::redirect('/', '/admin/dashboard');

    Route::get('/dashboard', \App\Livewire\Admin\Dashboard::class)->name('dashboard');
    Route::get('/annonces', \App\Livewire\Admin\ListingsManager::class)->name('annonces');
    Route::get('/commandes', \App\Livewire\Admin\OrdersManager::class)->name('commandes');
    Route::get('/commandes/export', OrderExportController::class)->name('commandes.export');
});
