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

class Case03StaffCalendarTest extends TestCase
{
    use RefreshDatabase;
    protected function setUp():void{
        parent::setUp();
        $this->seed([
            CalendarSeeder::class,
            UserSeeder::class,
            EventSeeder::class,
            AttendanceSeeder::class,
        ]);
        $this->user = User::where('role', 'staff')->first();
        $this->accountId = $this->user->account_id;
        $loginResponse = $this->postJson('/api/login', [
            'login_id' => $this->accountId,
            'password' => 'password',
            'role'     => 'staff',
        ]);
        $this->token = $loginResponse->json('token');
        $this->response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->getJson('/api/staff/');
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
            'groups',
            'group_categories',
        ]);
        $calendarData = $this->response->json('calendar_data');
        $this->assertCount(Calendar::count(), $calendarData);
    }
    public function test_欠席その他を全件取得できる()
    {
        $calendarData = $this->response->json('calendar_data');
        foreach ($calendarData as $index => $jsonCalendar) {
            $dbCalendar = Calendar::with('attendances')->find($jsonCalendar['id']);
            $this->assertCount(
                $dbCalendar->attendances->count(), 
                $jsonCalendar['attendances']
            );
        }
    }
    public function test_イベントを全件取得できる()
    {
        $calendarData = $this->response->json('calendar_data');
        foreach ($calendarData as $index => $jsonCalendar) {
            $dbCalendar = Calendar::with('events')->find($jsonCalendar['id']);
            $this->assertCount(
                $dbCalendar->events->count(), 
                $jsonCalendar['events']
            );
        }
    }
}
