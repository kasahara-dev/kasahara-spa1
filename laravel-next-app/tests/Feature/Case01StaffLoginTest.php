<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Database\Seeders\TestSeeder;
use App\Models\User;

use Faker\Factory;
use Tests\TestCase;
use Illuminate\Support\Facades\Hash;

class Case01StaffLoginTest extends TestCase
{
    use RefreshDatabase;
    /**
     * A basic feature test example.
     */
    public function test_スタッフとしてログインができる(): void{
        $fake = Factory::create('ja_JP');  
        $accountId = (string) $fake->randomNumber(5);
        $password = $fake->password();
        $name = $fake->name();
        $user = User::create([
            'account_id' => $accountId,
            'role' => 'staff',
            'name' => $name,
            'password' => Hash::make($password),
        ]);

        $response = $this->postJson('/api/login', [
            'login_id' => $accountId,
            'password' => $password,
            'role'     => 'staff',
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
            'account_id' => $accountId,
            'role' => 'staff',
        ]);
    }
}
