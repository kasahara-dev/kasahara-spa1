<?php

namespace App\Http\Controllers\Staff;

use App\Models\ParentMessage;
use Illuminate\Http\Request;
use App\Http\Requests\Staff\AttendanceRequest as StaffAttendanceRequest;
use App\Models\Parent_message;
use App\Models\Staff_message;
use App\Models\Event;
use App\Models\Attendance;
use App\Models\User;
use Illuminate\Support\Str;
use App\Models\StaffMessage;
use Illuminate\Support\Facades\Storage;
use PhpParser\NodeVisitor\ParentConnectingVisitor;

class AttendanceController extends Controller
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
    public function store(StaffAttendanceRequest $request)
    {
        $validated = $request->validated();
        $editorId = auth()->id();
        $userId = $validated['user_id'];
        $calendarId = $validated['calendar_id'];
        if($this->isPastDeadline($calendarId)){
            return response()->json(['message' => 'アプリでの登録可能時刻を過ぎています。直接園にお電話ください。']);
        }
        $attendance = Attendance::withTrashed()
            ->where('user_id', $userId)
            ->where('calendar_id', $calendarId)
            ->first();

        if ($attendance) {
            $attendance->status = (int)$validated['status'];
            $attendance->detail = ((int)$validated['status'] === 2) ? $validated['detail'] : null;
            $attendance->restore();

            return response()->json(['message' => '出欠予定を登録しました', 'data' => $attendance]);
        }
        $newAttendance = Attendance::create([
            'user_id'     => $userId,
            'calendar_id' => $calendarId,
            'status'      => $validated['status'],
            'detail'      => ((int)$validated['status'] === 2) ? $validated['detail'] : null,
            'editor_id' => $editorId,
        ]);
        return response()->json(['message' => '出欠予定を登録しました', 'data' => $newAttendance], 201);
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
    public function update(StaffAttendanceRequest $request, $attendanceId)
    {
        $validated = $request->validated();
        $userId = $validated['user_id'];
        $calendarId = $validated['calendar_id'];
        $editorId = auth()->id();
        $attendance = Attendance::find($attendanceId);
        if (!$attendance) {
            return response()->json(['message' => '更新対象のデータが見つかりません'], 404);
        }
        $attendance->status = (int)$validated['status'];
        $attendance->detail = ((int)$validated['status'] === 2) ? $validated['detail'] : null;
        $attendance->editor_id = $editorId;
        $attendance->save();
        return response()->json(['message' => '出欠予定を更新しました', 'data' => $attendance]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($attendanceId)
    {
        $userId = auth()->id();
        $attendance = Attendance::find($attendanceId);
        if (!$attendance) {
            return response()->json(['message' => 'すでに出席状態です']);
        }
        $editorId = auth()->id();
        $attendance->editor_id = $editorId;
        $attendance->save();
        $attendance->delete();
        return response()->json(['message' => '出席に変更しました']);
    }
}
