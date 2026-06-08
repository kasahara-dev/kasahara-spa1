<?php

namespace App\Http\Controllers\Staff;

use App\Models\ParentMessage;
use Illuminate\Http\Request;
use App\Http\Requests\EventRequest;
use App\Models\Parent_message;
use App\Models\Staff_message;
use App\Models\Event;
use App\Models\Calendar;
use App\Models\Group;
use App\Models\User;
use Illuminate\Support\Str;
use App\Models\StaffMessage;
use Illuminate\Support\Facades\Storage;
use PhpParser\NodeVisitor\ParentConnectingVisitor;

class GroupController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $groups = Group::with(['users'])->get();
        return response()->json($groups);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(EventRequest $request)
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
    public function update(EventRequest $request, string $event_id)
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
