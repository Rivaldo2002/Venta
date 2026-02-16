<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {

        User::create([
            'name' => 'Admin Owner',
            'email' => 'admin@venta.com',
            'password' => Hash::make('password123'),
            'role' => 'admin',
        ]);

        User::create([
            'name' => 'Staff Kasir',
            'email' => 'kasir@venta.com',
            'password' => Hash::make('password123'),
            'role' => 'staff',
        ]);

        $this->call([
            ProductSeeder::class,
        ]);
    }
}
