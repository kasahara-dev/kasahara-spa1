<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Database\Seeders\CalendarSeeder;
use Database\Seeders\UserSeeder;
use Database\Seeders\GroupSeeder;
use Database\Seeders\GroupUserSeeder;
use App\Models\User;
use App\Models\StaffMessage;
use Tests\TestCase;

class Case21ParentSendMessageTest extends TestCase
{
    use RefreshDatabase;
    
    protected function setUp():void{
        parent::setUp();
        $this->seed([
            GroupSeeder::class,
            UserSeeder::class,
            CalendarSeeder::class,
        ]);
        $this->parent = User::factory()->create([
            'role' => 'parent',
            'password' => bcrypt('password'),
        ]);
        $this->seed([
            GroupUserSeeder::class,
        ]);
        $this->accountId = $this->parent->account_id;
        $this->parentId = $this->parent->id;
        $this->parentAccountId = $this->parent->account_id;
        $loginResponse = $this->postJson('/api/login', [
            'login_id' => $this->parentAccountId,
            'password' => 'password',
            'role'     => 'parent',
        ]);
        $this->token = $loginResponse->json('token');
    }
    public function test_バリデーション(): void
    {
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->postJson('/api/messages/',[
            'detail' => null,
        ]);
        $response->assertStatus(422);
        $detail = str_repeat('a', 401);
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->postJson('/api/messages/',[
            'detail' => $detail,
        ]);
        $response->assertStatus(422);
        $this->assertDatabaseCount('parent_messages',0);
    }
    public function test_送信できる(): void
    {
        $detail = str_repeat('a', rand(1,400));
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->postJson('/api/messages/',[
            'detail' => $detail,
        ]);
        $response->assertStatus(201);
        $this->assertDatabaseHas('parent_messages', ['from' => $this->parentId, 'detail' => $detail,]);
    }
}
