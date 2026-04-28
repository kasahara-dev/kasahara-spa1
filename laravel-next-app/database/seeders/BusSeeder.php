<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Bus;

class BusSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Bus::create([
            'name' => '歩きコース'
        ]);
        Bus::create([
            'name' => '青コース'
        ]);
        Bus::create([
            'name' => '赤コース'
        ]);
    }
}
