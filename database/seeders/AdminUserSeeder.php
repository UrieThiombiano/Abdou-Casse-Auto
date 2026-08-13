<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class AdminUserSeeder extends Seeder
{
    /**
     * Compte admin unique — pas d'inscription publique. Identifiants pilotés
     * par .env pour pouvoir differer entre dev (Codespaces) et prod.
     */
    public function run(): void
    {
        User::query()->updateOrCreate(
            ['email' => env('ADMIN_EMAIL', 'admin@abdoucasseauto.com')],
            [
                'name' => 'Administrateur',
                'password' => env('ADMIN_PASSWORD', 'changeme123'),
                'email_verified_at' => now(),
            ]
        );
    }
}
