<?php

namespace Tests\Feature;

use Faker\Factory;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Illuminate\Support\Facades\Hash;

class Case14ParentLogoutTest extends TestCase
{
    use RefreshDatabase;
    /**
     * A basic feature test example.
     */
    protected function setUp():void{
        parent::setUp();
        $this->fake = Factory::create('ja_JP');
        $this->accountId = (string) $this->fake->randomNumber(5);
        $this->password = $this->fake->password();
        $this->hashedPassword = Hash::make($this->password);
        $this->name = $this->fake->name();
        $this->user = User::create([
            'account_id' => $this->accountId,
            'role' => 'parent',
            'name' => $this->name,
            'password' => $this->hashedPassword,
        ]);
        $loginResponse = $this->postJson('/api/login', [
            'login_id' => $this->accountId,
            'password' => $this->password,
            'role'     => 'parent',
        ]);
        $this->token = $loginResponse->json('token');
    }
    public function test_ログアウト(): void
    {
        $this->assertDatabaseHas('personal_access_tokens', [
            'tokenable_id'   => $this->user->id,
            'tokenable_type' => get_class($this->user),
        ]);
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->postJson('/api/logout');
        $response->assertStatus(200);
        $this->assertDatabaseMissing('personal_access_tokens', [
            'tokenable_id'   => $this->user->id,
            'tokenable_type' => get_class($this->user),
        ]);
    }
}
