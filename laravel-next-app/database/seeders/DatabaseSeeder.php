<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory()->create();
        $this->call([
            GroupSeeder::class,
            UserSeeder::class,
            GroupUserSeeder::class,
            CalendarSeeder::class,
            EventSeeder::class,
            AttendanceSeeder::class,
            StaffMessageSeeder::class,
            ParentMessageSeeder::class,
        ]);
    }
}
