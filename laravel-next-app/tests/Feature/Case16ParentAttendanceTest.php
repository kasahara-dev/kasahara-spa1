<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Database\Seeders\CalendarSeeder;
use Database\Seeders\UserSeeder;
use App\Models\User;
use App\Models\Calendar;
use Tests\TestCase;
use Faker\Factory;

class Case16ParentAttendanceTest extends TestCase
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
    public function test_正常登録(): void
    {
        $this->response->assertStatus(200);
        $calendar = Calendar::where('working', 1)->inRandomOrder()->first();
        $calendarId = $calendar->id;
        $calendarDate = $calendar->date;
        Carbon::setTestNow($calendarDate . config('app_settings.deadline_time'));
        $rand = rand(1, 100);
        if($rand > 50){
            $status = 1;
            $detail = null;
        }else{
            $rand = rand(5, 200);
            $status = 2;
            $detail = $this->fake->text($rand);
        }
        $response = $this->postJson('/api/attendance', [
            'calendar_id' => $calendarId,
            'status' => $status,
            'detail' => $detail,
            'user_id' => $this->parentId,
            'working' => 1,
        ]);
        $response->assertStatus(201);
        $this->assertDatabaseHas('attendances', [
            'calendar_id'   => $calendarId,
            'user_id' => $this->parentId,
            'status' => $status,
            'detail' => $detail,
            'editor_id' => null,
        ]);
    }
    public function test_バリデーション(){
        $this->response->assertStatus(200);
        $calendar = Calendar::where('working', 1)->inRandomOrder()->first();
        $calendarId = $calendar->id;
        $calendarDate = $calendar->date;
        Carbon::setTestNow($calendarDate . config('app_settings.deadline_time'));
        $status = 2;
        $detail = str_repeat('a', 201);
        $response = $this->postJson('/api/attendance', [
            'calendar_id' => $calendarId,
            'status' => $status,
            'detail' => null,
            'user_id' => $this->parentId,
            'working' => 1,
        ]);
        $response->assertStatus(422);
        $this->assertDatabaseMissing('attendances', [
            'calendar_id'   => $calendarId,
            'user_id' => $this->parentId,
        ]);
        $response = $this->postJson('/api/attendance', [
            'calendar_id' => $calendarId,
            'status' => $status,
            'detail' => $detail,
            'user_id' => $this->parentId,
            'working' => 1,
        ]);
        $response->assertStatus(422);
        $this->assertDatabaseMissing('attendances', [
            'calendar_id'   => $calendarId,
            'user_id' => $this->parentId,
        ]);
    }
    public function test_時刻エラー(): void
    {
        $this->response->assertStatus(200);
        $calendar = Calendar::where('working', 1)->inRandomOrder()->first();
        $calendarId = $calendar->id;
        $calendarDate = $calendar->date;
        $deadlineStr = $calendarDate . ' ' . config('app_settings.deadline_time') . ':00';
        $deadlineBase = Carbon::parse($deadlineStr);
        Carbon::setTestNow($deadlineBase->addMinute());
        $rand = rand(1, 100);
        if($rand > 50){
            $status = 1;
            $detail = null;
        }else{
            $rand = rand(5, 200);
            $status = 2;
            $detail = $this->fake->text($rand);
        }
        $response = $this->postJson('/api/attendance', [
            'calendar_id' => $calendarId,
            'status' => $status,
            'detail' => $detail,
            'user_id' => $this->parentId,
            'working' => 1,
        ]);
        $response->assertStatus(422);
        $this->assertDatabaseMissing('attendances', [
            'calendar_id'   => $calendarId,
            'user_id' => $this->parentId,
        ]);
    }
}
