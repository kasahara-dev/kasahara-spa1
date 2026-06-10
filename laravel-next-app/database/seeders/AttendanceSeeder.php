<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Attendance;
use App\Models\User;
use App\Models\Calendar;

class AttendanceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = User::where('role','parent')->get();
        foreach ($users as $user) {
            $calendars = Calendar::where('working',1)->inRandomOrder()->take(20)->get();
            foreach ($calendars as $calendar) {
                Attendance::factory()->create([
                    'user_id' => $user->id,
                    'calendar_id' => $calendar->id,
                ]);
            }
        }
    }
}
