<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Database\Seeders\CalendarSeeder;
use Database\Seeders\UserSeeder;
use Database\Seeders\AttendanceSeeder;
use App\Models\User;
use App\Models\Attendance;
use Tests\TestCase;
use Faker\Factory;

class Case05StaffAttendanceEditTest extends TestCase
{
    use RefreshDatabase;
    
    protected function setUp():void{
        parent::setUp();
        $this->seed([
            CalendarSeeder::class,
            UserSeeder::class,
            AttendanceSeeder::class,
        ]);
        $this->staff = User::where('role', 'staff')->first();
        $this->staffAccountId = $this->staff->account_id;
        $loginResponse = $this->postJson('/api/login', [
            'login_id' => $this->staffAccountId,
            'password' => 'password',
            'role'     => 'staff',
        ]);
        $this->token = $loginResponse->json('token');
        $this->response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->getJson('/api/staff/');
        $this->fake = Factory::create('ja_JP');
    }
    public function test_正常更新(): void
    {
        $this->response->assertStatus(200);
        $attendance = Attendance::inRandomOrder()->first();
        $attendanceId = $attendance->id;
        $calendarId = $attendance->calendar_id;
        $parentId = $attendance->user_id;
        $staffId = $this->staff->id;
        $rand = rand(1, 100);
        if($rand > 50){
            $status = 1;
            $detail = null;
        }else{
            $rand = rand(5, 200);
            $status = 2;
            $detail = $this->fake->text($rand);
        }
        $response = $this->patchJson('/api/staff/attendance/' . $attendanceId, [
            'status'      => $status,
            'detail'      => $detail,
            'user_id'     => $parentId,
        ]);
        $this->assertDatabaseHas('attendances', [
            'id' => $attendanceId,
            'calendar_id'   => $calendarId,
            'user_id' => $parentId,
            'status' => $status,
            'detail' => $detail,
            'editor_id' => $staffId,
        ]);
        $response = $this->deleteJson('/api/staff/attendance/' . $attendanceId);
        $this->assertSoftDeleted('attendances', [
            'id'   => $attendanceId,
        ]);
    }
    public function test_バリデーション(){
        $attendance = Attendance::inRandomOrder()->first();
        $attendanceId = $attendance->id;
        $oldStatus = $attendance->status;
        $oldDetail = $attendance->detail;
        $calendarId = $attendance->calendar_id;
        $parentId = $attendance->user_id;
        $staffId = $this->staff->id;
        $status = 2;
        $detail = str_repeat('a', 201);
        $response = $this->patchJson('/api/staff/attendance/' . $attendanceId, [
            'status'      => $status,
            'detail'      => $detail,
            'user_id'     => $parentId,
        ]);
        $response->assertStatus(422);
        $this->assertDatabaseHas('attendances', [
            'id'   => $attendanceId,
            'calendar_id' => $calendarId,
            'status'      => $oldStatus,
            'detail'      => $oldDetail,
            'user_id'     => $parentId,
        ]);
        $response = $this->patchJson('/api/staff/attendance/' . $attendanceId, [
            'status'      => $status,
            'detail'      => null,
            'user_id'     => $parentId,
        ]);
        $response->assertStatus(422);
        $this->assertDatabaseHas('attendances', [
            'id'   => $attendanceId,
            'calendar_id' => $calendarId,
            'status'      => $oldStatus,
            'detail'      => $oldDetail,
            'user_id'     => $parentId,
        ]);
    }
}
