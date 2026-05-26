<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Attendance;
use App\Models\Calendar;
use Carbon\Carbon;
use App\Http\Requests\AttendanceRequest;

class AttendanceController extends Controller
{
    private function isPastDeadline($calendarId){
        $calendar = Calendar::find($calendarId);
        if(!$calendar){
            return false;
        }
        $targetDate = Carbon::parse($calendar->date)->startOfDay();
        $today = Carbon::today();
        if($targetDate->isAfter($today)){
            return false;
        }
        if($targetDate->isBefore($today)){
            return true;
        }
        $deadlineTimeStr = config('app_settings.deadline_time');
        $deadline = Carbon::createFromTimeString($deadlineTimeStr);
        if(Carbon::now()->isAfter($deadline)){
            return true;
        }
        return false;
    }
    public function store(AttendanceRequest $request)
    {
        $validated = $request->validated();
        $userId = auth()->id();
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
        ]);
        return response()->json(['message' => '出欠予定を登録しました', 'data' => $newAttendance], 201);
    }
    public function update(AttendanceRequest $request, $calendarId)
    {
        $validated = $request->validate([
            'status' => 'required|in:1,2',
            'detail' => 'required_if:status,2|nullable|string|max:1000',
        ]);
        $userId = auth()->id();
        if($this->isPastDeadline($calendarId)){
            return response()->json(['message' => 'アプリでの登録可能時刻を過ぎています。直接園にお電話ください。']);
        }
        $attendance = Attendance::where('user_id', $userId)
            ->where('calendar_id', $calendarId)
            ->first();
        if (!$attendance) {
            return response()->json(['message' => '更新対象のデータが見つかりません'], 404);
        }
        $attendance->status = (int)$validated['status'];
        $attendance->detail = ((int)$validated['status'] === 2) ? $validated['detail'] : null;
        $attendance->save();
        return response()->json(['message' => '出欠予定を更新しました', 'data' => $attendance]);
    }
    public function destroy($calendarId)
    {
        $userId = auth()->id();
        $attendance = Attendance::where('user_id', $userId)
            ->where('calendar_id', $calendarId)
            ->first();
        if (!$attendance) {
            return response()->json(['message' => 'すでに出席状態です']);
        }
        if($this->isPastDeadline($calendarId)){
            return response()->json(['message' => 'アプリでの登録可能時刻を過ぎています。直接園にお電話ください。']);
        }
        $attendance->delete();
        return response()->json(['message' => '出席に変更しました']);
    }
}
