<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Database\Seeders\CalendarSeeder;
use Database\Seeders\UserSeeder;
use Database\Seeders\GroupSeeder;
use Database\Seeders\GroupUserSeeder;
use App\Models\User;
use Tests\TestCase;
use Faker\Factory;

class Case22ParentProfileTest extends TestCase
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
        $this->fake = Factory::create('ja_JP');
    }
    public function test_バリデーション(): void
    {
        $oldEmail1 = $this->parent->profile->email1;
        $oldEmail2 = $this->parent->profile->email2;
        $oldEmail3 = $this->parent->profile->email3;
        $oldTel1 = $this->parent->profile->tel1;
        $oldTel2 = $this->parent->profile->tel2;
        $oldTel3 = $this->parent->profile->tel3;
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->patchJson('/api/profile/',[
            'email1' => null,
        ]);
        $response->assertStatus(422);
        $text = str_repeat('a', 20);
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->patchJson('/api/profile/',[
            'email1' => $text,
        ]);
        $response->assertStatus(422);
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->patchJson('/api/profile/',[
            'email2' => $text,
        ]);
        $response->assertStatus(422);
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->patchJson('/api/profile/',[
            'email3' => $text,
        ]);
        $response->assertStatus(422);
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->patchJson('/api/profile/',[
            'tel1' => null,
        ]);
        $response->assertStatus(422);
        $text = str_repeat('a', 21);
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->patchJson('/api/profile/',[
            'tel1' => $text,
        ]);
        $response->assertStatus(422);
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->patchJson('/api/profile/',[
            'tel2' => $text,
        ]);
        $response->assertStatus(422);
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->patchJson('/api/profile/',[
            'tel3' => $text,
        ]);
        $response->assertStatus(422);
        $this->assertDatabaseHas('profiles',[
            'user_id'=>$this->parentId,
            'email1'=>$oldEmail1,
            'email2'=>$oldEmail2,
            'email3'=>$oldEmail3,
            'tel1'=>$oldTel1,
            'tel2'=>$oldTel2,
            'tel3'=>$oldTel3,
        ]);
    }
    public function test_更新できる(): void
    {
        $text = str_repeat('a', rand(1,20));
        $email1 = $this->fake->safeEmail();
        $email2 = $this->fake->optional()->safeEmail();
        $email3 = $this->fake->optional()->safeEmail();
        $tel1 = $this->fake->phoneNumber();
        $tel2 = $this->fake->optional()->phoneNumber();
        $tel3 = $this->fake->optional()->phoneNumber();
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->patchJson('/api/profile/',[
            'email1' => $email1,
            'email2' => $email2,
            'email3' => $email3,
            'tel1' => $tel1,
            'tel2' => $tel2,
            'tel3' => $tel3,
        ]);
        $response->assertStatus(200);
        $this->assertDatabaseHas('profiles', [
            'user_id' => $this->parentId,
            'email1' => $email1,
            'email2' => $email2,
            'email3' => $email3,
            'tel1' => $tel1,
            'tel2' => $tel2,
            'tel3' => $tel3,
        ]);
    }
}
