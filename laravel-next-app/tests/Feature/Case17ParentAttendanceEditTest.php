<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Database\Seeders\CalendarSeeder;
use Database\Seeders\UserSeeder;
use Database\Seeders\AttendanceSeeder;
use App\Models\User;
use App\Models\Attendance;
use App\Models\Calendar;
use Tests\TestCase;
use Faker\Factory;

class Case17ParentAttendanceEditTest extends TestCase
{
    use RefreshDatabase;
    
    protected function setUp():void{
        parent::setUp();
        $this->seed([
            CalendarSeeder::class,
            UserSeeder::class,
        ]);
        $this->user = User::factory()->create([
            'role' => 'parent',
            'password' => bcrypt('password'),
        ]);
        $this->seed([
            AttendanceSeeder::class,
        ]);
        $this->accountId = $this->user->account_id;
        $this->parentId = $this->user->id;
        $loginResponse = $this->postJson('/api/login', [
            'login_id' => $this->accountId,
            'password' => 'password',
            'role'     => 'parent',
        ]);
        $this->token = $loginResponse->json('token');
        $this->response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->getJson('/api');
        $this->fake = Factory::create('ja_JP');
    }
    protected function tearDown(): void
    {
        Carbon::setTestNow();
        parent::tearDown();
    }
    public function test_正常更新(): void
    {
        $this->response->assertStatus(200);
        $attendance = Attendance::where('user_id',$this->parentId)->inRandomOrder()->first();
        $attendanceId = $attendance->id;
        $calendarId = $attendance->calendar_id;
        $calendarDate = Calendar::find($calendarId)->date;
        Carbon::setTestNow($calendarDate . config('app_settings.deadline_time'));
        $rand = rand(1, 100);
        if($rand > 50){
            $status = 1;
            $detail = null;
        }else{
            $status = 2;
            $detail = $this->fake->text(20);
        }
        $response = $this->patchJson('/api/attendance/' . $attendanceId, [
            'calendar_id' => $calendarId,
            'status'      => $status,
            'detail'      => $detail,
            'working' => 1,
        ]);
        $this->assertDatabaseHas('attendances', [
            'id' => $attendanceId,
            'calendar_id'   => $calendarId,
            'user_id' => $this->parentId,
            'status' => $status,
            'detail' => $detail,
            'editor_id' => null,
        ]);
        $response = $this->deleteJson('/api/attendance/' . $attendanceId);
        $this->assertSoftDeleted('attendances', [
            'id'   => $attendanceId,
        ]);
    }
    public function test_バリデーション(){
        $attendance = Attendance::where('user_id',$this->parentId)->inRandomOrder()->first();
        $attendanceId = $attendance->id;
        $oldStatus = $attendance->status;
        $oldDetail = $attendance->detail;
        $oldEditorId = $attendance->editor_id;
        $calendarId = $attendance->calendar_id;
        $calendarDate = Calendar::find($calendarId)->date;
        Carbon::setTestNow($calendarDate . config('app_settings.deadline_time'));
        $status = 2;
        $detail = str_repeat('a', 201);
        $response = $this->patchJson('/api/attendance/' . $attendanceId, [
            'calendar_id' => $calendarId,
            'status'      => $status,
            'detail'      => $detail,
            'working' => 1,
        ]);
        $response->assertStatus(422);
        $this->assertDatabaseHas('attendances', [
            'id'   => $attendanceId,
            'calendar_id' => $calendarId,
            'status'      => $oldStatus,
            'detail'      => $oldDetail,
            'user_id'     => $this->parentId,
            'editor_id' => $oldEditorId,
        ]);
        $response = $this->patchJson('/api/attendance/' . $attendanceId, [
            'calendar_id' => $calendarId,
            'status'      => $status,
            'detail'      => null,
            'working' => 1,
        ]);
        $response->assertStatus(422);
        $this->assertDatabaseHas('attendances', [
            'id'   => $attendanceId,
            'calendar_id' => $calendarId,
            'status'      => $oldStatus,
            'detail'      => $oldDetail,
            'user_id'     => $this->parentId,
            'editor_id' => $oldEditorId,
        ]);
    }
    public function test_時刻エラー(): void
    {
        $this->response->assertStatus(200);
        $attendance = Attendance::where('user_id',$this->parentId)->inRandomOrder()->first();
        $attendanceId = $attendance->id;
        $oldStatus = $attendance->status;
        $oldDetail = $attendance->detail;
        $oldEditorId = $attendance->editor_id;
        $calendarId = $attendance->calendar_id;
        $calendarDate = Calendar::find($calendarId)->date;
        $deadlineStr = $calendarDate . ' ' . config('app_settings.deadline_time') . ':00';
        $deadlineBase = Carbon::parse($deadlineStr);
        Carbon::setTestNow($deadlineBase->addMinute());
        $rand = rand(1, 100);
        if($rand > 50){
            $status = 1;
            $detail = null;
        }else{
            $status = 2;
            $detail = $this->fake->text(20);
        }
        $response = $this->patchJson('/api/attendance/' . $attendanceId, [
            'calendar_id' => $calendarId,
            'status'      => $status,
            'detail'      => $detail,
            'working' => 1,
        ]);
        $response->assertStatus(422);
        $this->assertDatabaseHas('attendances', [
            'id' => $attendanceId,
            'calendar_id'   => $calendarId,
            'user_id' => $this->parentId,
            'status' => $oldStatus,
            'detail' => $oldDetail,
            'editor_id' => $oldEditorId,
        ]);
        $response = $this->deleteJson('/api/attendance/' . $attendanceId);
        $response->assertStatus(422);
        $this->assertDatabaseHas('attendances', [
            'id' => $attendanceId,
            'calendar_id'   => $calendarId,
            'user_id' => $this->parentId,
            'status' => $oldStatus,
            'detail' => $oldDetail,
            'editor_id' => $oldEditorId,
        ]);
    }
}