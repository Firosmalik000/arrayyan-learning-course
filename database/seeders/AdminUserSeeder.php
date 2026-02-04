<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $seedUsers = [
            [
                'name' => 'Administrator',
                'email' => env('SUPER_ADMIN_EMAIL', 'superadmin@alclearning.id'),
                'password' => env('SUPER_ADMIN_PASSWORD', 'superadmin123'),
            ],
            [
                'name' => 'Admin ALC',
                'email' => env('ADMIN_SEED_EMAIL', 'admin@alclearning.id'),
                'password' => env('ADMIN_SEED_PASSWORD', 'admin12345'),
            ],
        ];

        foreach ($seedUsers as $seedUser) {
            if (! $seedUser['email']) {
                continue;
            }

            User::updateOrCreate(
                ['email' => $seedUser['email']],
                [
                    'name' => $seedUser['name'],
                    'password' => Hash::make($seedUser['password']),
                    'email_verified_at' => now(),
                ]
            );
        }
    }
}
