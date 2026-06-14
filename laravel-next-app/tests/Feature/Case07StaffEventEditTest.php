<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Database\Seeders\CalendarSeeder;
use Database\Seeders\UserSeeder;
use Database\Seeders\EventSeeder;
use App\Models\User;
use App\Models\Event;
use Tests\TestCase;
use Faker\Factory;

class Case07StaffEventEditTest extends TestCase
{
    use RefreshDatabase;
    
    protected function setUp():void{
        parent::setUp();
        $this->seed([
            CalendarSeeder::class,
            UserSeeder::class,
            EventSeeder::class,
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
        $event = Event::inRandomOrder()->first();
        $eventId = $event->id;
        $calendarId = $event->calendar_id;
        $staffId = $this->staff->id;
        $title = $this->fake->text(50);
        $detail = $this->fake->text(400);
        $response = $this->patchJson('/api/staff/event/' . $eventId, [
            'title'      => $title,
            'detail'      => $detail,
            'editor_id'     => $staffId,
        ]);
        $this->response->assertStatus(200);
        $this->assertDatabaseHas('events', [
            'id' => $eventId,
            'calendar_id'   => $calendarId,
            'title' => $title,
            'detail' => $detail,
            'editor_id' => $staffId,
        ]);
    }
    public function test_バリデーション(){
        $event = Event::inRandomOrder()->first();
        $eventId = $event->id;
        $oldTitle = $event->title;
        $oldDetail = $event->detail;
        $oldEditor = $event->editor_id;
        $calendarId = $event->calendar_id;
        $staffId = $this->staff->id;
        $title = $this->fake->text(50);
        $titleOver = str_repeat('a', 51);
        $detail = $this->fake->text(400);
        $detailOver = str_repeat('a', 401);
        $response = $this->patchJson('/api/staff/event/' . $eventId, [
            'title'      => null,
            'detail'      => $detail,
            'user_id'     => $staffId,
        ]);
        $response->assertStatus(422);
        $this->assertDatabaseHas('events', [
            'id'   => $eventId,
            'calendar_id' => $calendarId,
            'title'      => $oldTitle,
            'detail'      => $oldDetail,
            'editor_id'     => $oldEditor,
        ]);
        $response = $this->patchJson('/api/staff/event/' . $eventId, [
            'title'      => $titleOver,
            'detail'      => $detail,
            'user_id'     => $staffId,
        ]);
        $response->assertStatus(422);
        $this->assertDatabaseHas('events', [
            'id'   => $eventId,
            'calendar_id' => $calendarId,
            'title'      => $oldTitle,
            'detail'      => $oldDetail,
            'editor_id'     => $oldEditor,
        ]);
        $response = $this->patchJson('/api/staff/event/' . $eventId, [
            'title'      => $title,
            'detail'      => null,
            'user_id'     => $staffId,
        ]);
        $response->assertStatus(422);
        $this->assertDatabaseHas('events', [
            'id'   => $eventId,
            'calendar_id' => $calendarId,
            'title'      => $oldTitle,
            'detail'      => $oldDetail,
            'editor_id'     => $oldEditor,
        ]);
        $response = $this->patchJson('/api/staff/event/' . $eventId, [
            'title'      => $title,
            'detail'      => $detailOver,
            'user_id'     => $staffId,
        ]);
        $response->assertStatus(422);
        $this->assertDatabaseHas('events', [
            'id'   => $eventId,
            'calendar_id' => $calendarId,
            'title'      => $oldTitle,
            'detail'      => $oldDetail,
            'editor_id'     => $oldEditor,
        ]);
    }
}
