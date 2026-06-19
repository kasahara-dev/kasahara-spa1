<?php

namespace Tests\Feature;

use Database\Seeders\CalendarSeeder;
use Database\Seeders\UserSeeder;
use Database\Seeders\GroupSeeder;
use Database\Seeders\GroupUserSeeder;
use Tests\TestCase;
use App\Models\Group;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

class Case12StaffProfilesTest extends TestCase
{
    use RefreshDatabase;
    protected function setUp():void{
        parent::setUp();
        $this->seed([
            GroupSeeder::class,
            UserSeeder::class,
            GroupUserSeeder::class,
            CalendarSeeder::class,
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
        ])->getJson('/api/staff/groups');
    }
    public function test_保護者連絡先を全件取得できる(): void
    {
        $this->response->assertStatus(200);
        $groupsCount =Group::count(); 
        $this->response->assertJsonCount($groupsCount);
        $groups = Group::with('users')->get();
        foreach ($groups as $index => $group) {
            $dbUsersCount = $group->users->count();
            $this->response->assertJsonCount($dbUsersCount, "{$index}.users");
        }
    }
}
