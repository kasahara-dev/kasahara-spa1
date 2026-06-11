<?php

namespace Tests\Feature;

use Database\Seeders\CalendarSeeder;
use Tests\TestCase;
use Illuminate\Support\Facades\Hash;
use Faker\Factory;
use App\Models\Calendar;
use App\Models\User;

class Case03StaffCalendarTest extends TestCase
{
    protected function setUp():void{
        parent::setUp();
        $this->seed([
            CalendarSeeder::class,
        ]);
        $this->fake = Factory::create('ja_JP');
        $this->accountId = (string) $this->fake->randomNumber(5);
        $this->password = $this->fake->password();
        $this->hashedPassword = Hash::make($this->password);
        $this->name = $this->fake->name();
        $this->user = User::create([
            'account_id' => $this->accountId,
            'role' => 'staff',
            'name' => $this->name,
            'password' => $this->hashedPassword,
        ]);
        $loginResponse = $this->postJson('/api/login', [
            'login_id' => $this->accountId,
            'password' => $this->password,
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
}
