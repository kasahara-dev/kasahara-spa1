<?php

namespace App\Http\Controllers\Staff;

use Illuminate\Http\Request;
use App\Models\Calendar;

class CalendarController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
{
    $config = [
        'start_date' => config('app_settings.start_date'),
        'end_date'   => config('app_settings.end_date'),
    ];

    // 💡 'events' を 'events.editor:id,name' に変更します
    $calendarData = Calendar::with(['events.editor:id,name', 'attendance.user'])
        ->whereBetween('date', [$config['start_date'], $config['end_date']])
        ->orderBy('date', 'asc')
        ->get();

    return response()->json([
        'config'        => $config,
        'calendar_data' => $calendarData,
    ]);
}
    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
