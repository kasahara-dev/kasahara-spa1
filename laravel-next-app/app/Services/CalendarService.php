<?php
namespace App\Services;

use App\Models\Calendar;
use Carbon\Carbon;

class CalendarService
{
    public function getMonthlyData($yearMonth, $role)
    {
        $date = Carbon::parse($yearMonth);

        return Calendar::whereYear('date', $date->year)
            ->whereMonth('date', $date->month)
            ->orderBy('date', 'asc')
            ->get()
            ->map(function ($item) use ($role) {
                return [
                    'date'      => $item->date,
                    'day'       => (int)Carbon::parse($item->date)->format('d'),
                    'dayOfWeek' => $item->day_of_week,
                    'working' => (int)$item->working,
                    'hasEvent'  => $this->hasEventForRole($item->date, $role),
                ];
            });
    }

    private function hasEventForRole($date, $role)
    {
        return false;
    }
}