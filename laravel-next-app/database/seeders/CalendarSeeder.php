<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Calendar;
use Carbon\Carbon;
use Carbon\CarbonPeriod;

class CalendarSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $start=Carbon::parse(config('app_settings.start_date'));
        $end=Carbon::parse(config('app_settings.end_date'));
        $period = CarbonPeriod::create($start, $end);
        $data = [];
        foreach ($period as $date) {
            $data[] = [
                'date'       => $date->format('Y-m-d'),
                'working' => ($date->isWeekend()) ? 0 : 1,
                'created_at' => now(),
                'updated_at' => now(),
            ];

            if (count($data) >= 1000) {
                DB::table('calendars')->insert($data);
                $data = [];
            }
        }
        if (!empty($data)) {
            DB::table('calendars')->insert($data);
        }
    }
}
