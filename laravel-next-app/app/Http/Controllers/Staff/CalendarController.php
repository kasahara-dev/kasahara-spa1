<?php

namespace App\Http\Controllers\Staff;

use Illuminate\Http\Request;
use App\Models\Calendar;
use App\Models\Group;

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
        $groupCategories = config('group');
        $calendarData = Calendar::with([
            'events.editor:id,name',
            'attendances.user.groups' => function($query){
                $query->where('category','!=',0)->select('groups.id','groups.name');
            },
            'attendances.editor:id,name'])
            ->whereBetween('date', [$config['start_date'], $config['end_date']])
            ->orderBy('date', 'asc')
            ->get();

        $groups = Group::with(['users' => function($query){
            $query->select('users.id','users.name');
        }])
        ->select('id','name','category')
        ->get();

        return response()->json([
            'config'        => $config,
            'calendar_data' => $calendarData,
            'groups' => $groups,
            'group_categories' => $groupCategories,
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
