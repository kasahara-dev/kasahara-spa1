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

class Case19ParentMessageTest extends TestCase
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
        $this->accountId = $this->parent->account_id;
        $this->parentId = $this->parent->id;
        $this->seed([
            GroupUserSeeder::class,
            StaffMessageSeeder::class,
            ParentMessageSeeder::class,
        ]);
        StaffMessage::factory()->create([
            'to_type' => 0,
            'to' => $this->parent->id,
        ]);
        $loginResponse = $this->postJson('/api/login', [
            'login_id' => $this->accountId,
            'password' => 'password',
            'role'     => 'parent',
        ]);
        $this->token = $loginResponse->json('token');
    }
    public function test_全件取得できる(): void
    {
        $expectedPersonCount = StaffMessage::where('to_type', 0)
            ->where('to', $this->parent->id)
            ->count();
        $groupIds = $this->parent->groups()->pluck('groups.id')->toArray();
        $expectedGroupCount = StaffMessage::where('to_type', 1)
            ->whereIn('to', $groupIds)
            ->count();
        $expectedSendCount = ParentMessage::where('from', $this->parent->id)
            ->count();
        $expectedTotalCount = $expectedPersonCount + $expectedGroupCount + $expectedSendCount;
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->getJson('/api/messages');
        $response->assertStatus(200);
        $response->assertJsonCount($expectedTotalCount);
        $data = $response->json();
        if (count($data) > 1) {
            $firstCreatedAt = \Illuminate\Support\Carbon::parse($data[0]['created_at']);
            $secondCreatedAt = \Illuminate\Support\Carbon::parse($data[1]['created_at']);
            $this->assertTrue(
                $firstCreatedAt->isAfter($secondCreatedAt) || $firstCreatedAt->equalTo($secondCreatedAt)
            );
        }
    }
}
