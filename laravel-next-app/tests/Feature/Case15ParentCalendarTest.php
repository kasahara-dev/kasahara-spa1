<?php

namespace Tests\Feature;

use Database\Seeders\CalendarSeeder;
use Database\Seeders\UserSeeder;
use Database\Seeders\EventSeeder;
use Database\Seeders\AttendanceSeeder;
use Tests\TestCase;
use App\Models\Calendar;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

class Case15ParentCalendarTest extends TestCase
{
    use RefreshDatabase;
    protected function setUp(): void
    {
        parent::setUp();
        $this->seed([
            CalendarSeeder::class,
            UserSeeder::class,
            EventSeeder::class,
            AttendanceSeeder::class,
        ]);
        $this->user = User::factory()->create([
            'role' => 'parent',
            'password' => bcrypt('password'),
        ]);
        $this->accountId = $this->user->account_id;
        $loginResponse = $this->postJson('/api/login', [
            'login_id' => $this->accountId,
            'password' => 'password',
            'role'     => 'parent',
        ]);
        $this->token = $loginResponse->json('token');
        if ($loginResponse->status() !== 200) {
            dump('ログイン失敗詳細:', $loginResponse->json());
        }
        $this->response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->getJson('/api');
    }
    /**
     * A basic feature test example.
     */
    public function test_カレンダーを全件取得できる(): void
    {
        $this->response->assertStatus(200);
        $this->response->assertJsonStructure([
            'config',
            'calendar_data',
        ]);
        $calendarData = $this->response->json('calendar_data');
        $this->assertCount(Calendar::count(), $calendarData);
    }
    public function test_イベントを全件取得できる()
    {
        $calendarData = $this->response->json('calendar_data');
        foreach ($calendarData as $index => $jsonCalendar) {
            $dbCalendar = Calendar::with('events')->find($jsonCalendar['id']);
            $this->assertCount(
                $dbCalendar->events->count(), 
                $jsonCalendar['events'],
                "Calendar ID: {$jsonCalendar['id']} の events 件数が一致しません。"
            );
        }
    }
    public function test_欠席を全件取得できる()
    {
        $calendarData = $this->response->json('calendar_data');
        foreach ($calendarData as $index => $jsonCalendar) {
            $dbCalendar = Calendar::with(['attendances' => function ($query) {
                $query->where('user_id', $this->user->id)->where('status',1);
            }])->find($jsonCalendar['id']);
            $jsonAttendancesCount = collect($jsonCalendar['attendances'])
                ->where('status', 1)
                ->count();
            $this->assertEquals(
                $dbCalendar->attendances->count(), 
                $jsonAttendancesCount,
                "Calendar ID: {$jsonCalendar['id']} の欠席件数が一致しません。"
            );
        }
    }
    public function test_遅刻その他を全件取得できる()
    {
        $calendarData = $this->response->json('calendar_data');
        foreach ($calendarData as $index => $jsonCalendar) {
            $dbCalendar = Calendar::with(['attendances' => function ($query) {
                $query->where('user_id', $this->user->id)->where('status',2);
            }])->find($jsonCalendar['id']);
            $jsonAttendancesCount = collect($jsonCalendar['attendances'])
                ->where('status', 2)
                ->count();
            $this->assertEquals(
                $dbCalendar->attendances->count(), 
                $jsonAttendancesCount,
                "Calendar ID: {$jsonCalendar['id']} の遅刻その他件数が一致しません。"
            );
        }
    }
}
