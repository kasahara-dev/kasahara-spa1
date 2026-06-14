<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Database\Seeders\CalendarSeeder;
use Database\Seeders\UserSeeder;
use App\Models\User;
use App\Models\Calendar;
use Tests\TestCase;
use Faker\Factory;

class Case06StaffEventTest extends TestCase
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
        $staffId = $this->staff->id;
        $title = $this->fake->text(50);
        $detail = $this->fake->text(400);
        $response = $this->postJson('/api/staff/event', [
            'calendar_id' => $calendarId,
            'title'       => $title,
            'detail'      => $detail,
            'editor_id'   => $staffId,
        ]);
        $response->assertStatus(201);
        $this->assertDatabaseHas('events', [
            'calendar_id'   => $calendarId,
            'title' => $title,
            'detail' => $detail,
            'editor_id' => $staffId,
        ]);
    }
    public function test_バリデーション(){
        $calendar = Calendar::where('working', 1)->inRandomOrder()->first();
        $calendarId = $calendar->id;
        $staffId = $this->staff->id;
        $title = $this->fake->text(50);
        $titleOver = str_repeat('a', 51);
        $detail = $this->fake->text(400);
        $detailOver = str_repeat('a', 401);
        $response = $this->postJson('/api/staff/event', [
            'calendar_id' => $calendarId,
            'title'       => $title,
            'detail'      => null,
            'editor_id'   => $staffId,
        ]);
        $response->assertStatus(422);
        $this->assertDatabaseMissing('events', [
            'calendar_id'   => $calendarId,
        ]);
        $response = $this->postJson('/api/staff/event', [
            'calendar_id' => $calendarId,
            'title'       => $title,
            'detail'      => $detailOver,
            'editor_id'   => $staffId,
        ]);
        $response->assertStatus(422);
        $this->assertDatabaseMissing('events', [
            'calendar_id'   => $calendarId,
        ]);
        $response = $this->postJson('/api/staff/event', [
            'calendar_id' => $calendarId,
            'title'       => null,
            'detail'      => $detail,
            'editor_id'   => $staffId,
        ]);
        $response->assertStatus(422);
        $this->assertDatabaseMissing('events', [
            'calendar_id'   => $calendarId,
        ]);
        $response = $this->postJson('/api/staff/event', [
            'calendar_id' => $calendarId,
            'title'       => $titleOver,
            'detail'      => $detail,
            'editor_id'   => $staffId,
        ]);
        $response->assertStatus(422);
        $this->assertDatabaseMissing('events', [
            'calendar_id'   => $calendarId,
        ]);
    }
}
