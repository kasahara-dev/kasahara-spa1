<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Profile;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::factory()->create([
            'account_id' => 'S2021001',
            'role' => 'staff',
            'name' => '管理者1',
            'password' => Hash::make('password'),
        ]);
        User::factory()->create([
            'account_id' => '202401001',
            'role' => 'parent',
            'name' => '園児1',
            'password' => Hash::make('password'),
        ]);
        User::factory()->count(30)->create();
    }
}
