<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
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
        $closeDates = collect(config('app_settings.close_dates'));
        $openDates = collect(config('app_settings.open_dates'));
        foreach ($period as $date) {
            $working = 1;
            $dateString = $date->toDateString();
            if($date->isWeekend()){
                $working = 0;
            }elseif ($closeDates->contains($dateString)) {
                $working = 0;
            }
            if($openDates->contains($dateString)){
                $working = 1;
            }
            $data[] = [
                'date'       => $date->format('Y-m-d'),
                'working' => $working,
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
