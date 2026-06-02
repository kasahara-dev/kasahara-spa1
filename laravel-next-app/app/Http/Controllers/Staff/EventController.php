<?php

namespace App\Http\Controllers\Staff;

use App\Models\ParentMessage;
use Illuminate\Http\Request;
use App\Http\Requests\EventRequest;
use App\Models\Parent_message;
use App\Models\Staff_message;
use App\Models\Event;
use App\Models\Calendar;
use App\Models\User;
use Illuminate\Support\Str;
use App\Models\StaffMessage;
use Illuminate\Support\Facades\Storage;
use PhpParser\NodeVisitor\ParentConnectingVisitor;

class EventController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(EventRequest $request)
    {
        $validated = $request->validated();
        if(Calendar::find($validated['calendar_id'])->working == 0){
            return response()->json(['message' => '園休日です']);
        }
        $event = Event::create([
            'calendar_id' => $validated['calendar_id'],
            'title' => $validated['title'],
            'detail'  => $validated['detail'],
            'editor_id' => auth()->id(),
        ]);
        return response()->json([
            'success' => true,
            'message' => 'イベントを作成しました',
            'event'   => $event->load('editor:id,name'),
        ], 201);
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
        $validated = $request->validated();
        $event = Event::findOrFail($event_id);
        $event->update([
            'title' => $validated['title'],
            'detail'  => $validated['detail'],
            'editor_id' => auth()->id(),
        ]);
        return response()->json([
            'success' => true,
            'message' => 'イベントを更新しました',
            'event'   => $event->load('editor:id,name'),
        ], 201);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
