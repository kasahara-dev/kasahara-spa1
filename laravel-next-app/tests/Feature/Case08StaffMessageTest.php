<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Database\Seeders\CalendarSeeder;
use Database\Seeders\UserSeeder;
use Database\Seeders\ParentMessageSeeder;
use Database\Seeders\StaffMessageSeeder;
use Database\Seeders\GroupSeeder;
use Database\Seeders\GroupUserSeeder;
use App\Models\User;
use App\Models\StaffMessage;
use App\Models\ParentMessage;
use Tests\TestCase;

class Case08StaffMessageTest extends TestCase
{
    use RefreshDatabase;
    
    protected function setUp():void{
        parent::setUp();
        $this->seed([
            GroupSeeder::class,
            UserSeeder::class,
            GroupUserSeeder::class,
            CalendarSeeder::class,
            StaffMessageSeeder::class,
            ParentMessageSeeder::class,
        ]);
        $this->staff = User::where('role', 'staff')->first();
        $this->staffAccountId = $this->staff->account_id;
        $loginResponse = $this->postJson('/api/login', [
            'login_id' => $this->staffAccountId,
            'password' => 'password',
            'role'     => 'staff',
        ]);
        $this->token = $loginResponse->json('token');
        
    }
    public function test_全件取得できる(): void
    {
        // 送信メッセージ
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->getJson('/api/staff/staff_messages');
        $response->assertStatus(200);
        $dbMessagesCount = StaffMessage::count();
        $response->assertJsonCount($dbMessagesCount);
        // 受信メッセージ
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->getJson('/api/staff/parent_messages');
        $response->assertStatus(200);
        $dbMessagesCount = ParentMessage::count();
        $response->assertJsonCount($dbMessagesCount);
    }
}
