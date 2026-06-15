<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Database\Seeders\CalendarSeeder;
use Database\Seeders\UserSeeder;
use App\Models\User;
use App\Models\Calendar;
use Tests\TestCase;
use Faker\Factory;

class Case04StaffAttendanceTest extends TestCase
{
    use RefreshDatabase;
    
    protected function setUp():void{
        parent::setUp();
        $this->seed([
            CalendarSeeder::class,
            UserSeeder::class,
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
    public function test_正常登録(): void
    {
        $this->response->assertStatus(200);
        $calendar = Calendar::where('working', 1)->inRandomOrder()->first();
        $calendarId = $calendar->id;
        $parentId = User::where('role', 'parent')->inRandomOrder()->first()->id;
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
        $response = $this->postJson('/api/staff/attendance', [
            'calendar_id' => $calendarId,
            'status' => $status,
            'detail' => $detail,
            'user_id' => $parentId,
            'working' => 1,
        ]);
        $response->assertStatus(201);
        $this->assertDatabaseHas('attendances', [
            'calendar_id'   => $calendarId,
            'user_id' => $parentId,
            'status' => $status,
            'detail' => $detail,
            'editor_id' => $staffId,
        ]);
    }
    public function test_バリデーション(){
        $this->response->assertStatus(200);
        $calendar = Calendar::where('working', 1)->inRandomOrder()->first();
        $calendarId = $calendar->id;
        $parentId = User::where('role', 'parent')->inRandomOrder()->first()->id;
        $staffId = $this->staff->id;
        $status = 2;
        $detail = str_repeat('a', 201);
        $response = $this->postJson('/api/staff/attendance', [
            'calendar_id' => $calendarId,
            'status' => $status,
            'detail' => null,
            'user_id' => $parentId,
            'working' => 1,
        ]);
        $response->assertStatus(422);
        $this->assertDatabaseMissing('attendances', [
            'calendar_id'   => $calendarId,
            'user_id' => $parentId,
        ]);
        $response = $this->postJson('/api/staff/attendance', [
            'calendar_id' => $calendarId,
            'status' => $status,
            'detail' => $detail,
            'user_id' => $parentId,
            'working' => 1,
        ]);
        $response->assertStatus(422);
        $this->assertDatabaseMissing('attendances', [
            'calendar_id'   => $calendarId,
            'user_id' => $parentId,
        ]);
    }
}
