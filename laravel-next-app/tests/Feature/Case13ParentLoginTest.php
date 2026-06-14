<?php

namespace Tests\Feature;

use App\Models\User;
use Faker\Factory;
use Tests\TestCase;
use Illuminate\Support\Facades\Hash;

class Case13ParentLoginTest extends TestCase
{
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
    }
    public function test_バリデーションチェック(){
        $response = $this->postJson('/api/login', [
            'login_id' => (string) $this->fake->randomNumber(4),
            'password' => $this->fake->password(),
            'role'     => 'parent',
        ]);
        $response->assertStatus(422);
        $response->assertJsonStructure([
            'message',
            'errors',
        ]);
    }
    public function test_保護者としてログインができる(): void{
        $response = $this->postJson('/api/login', [
            'login_id' => $this->accountId,
            'password' => $this->password,
            'role'     => 'parent',
        ]);
        $response->assertStatus(200);
        $response->assertJsonStructure([
            'user' => [
                'id',
                'account_id',
                'role',
                'name',
            ],
            'token',
        ]);
        $response->assertJsonFragment([
            'account_id' => $this->accountId,
            'role' => 'parent',
        ]);
        $this->assertDatabaseHas('personal_access_tokens', [
            'tokenable_id'   => $this->user->id,
            'tokenable_type' => get_class($this->user),
        ]);
    }
}
