<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Database\Seeders\CalendarSeeder;
use Database\Seeders\UserSeeder;
use Database\Seeders\StaffMessageSeeder;
use Database\Seeders\GroupSeeder;
use Database\Seeders\GroupUserSeeder;
use App\Models\User;
use App\Models\StaffMessage;
use Tests\TestCase;

class Case20ParentReceivedMessageTest extends TestCase
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
        StaffMessage::factory()->create([
            'to_type' => 0,
            'to' => $this->parent->id,
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
    public function test_添付ファイルをダウンロードできる(): void
    {
        $targetDir = storage_path('app/public/messages');
        if (!file_exists($targetDir)) {
            mkdir($targetDir, 0755, true);
        }
        $dummyFileName = 'test.pdf';
        $absolutePath = $targetDir . '/' . $dummyFileName;
        file_put_contents($absolutePath, 'dummy pdf content');
        $filePath = 'messages/' . $dummyFileName;
        $message = StaffMessage::first();
        $message->update(['to_type'=>0,'to'=>$this->parentId,'file_path' => $filePath]);
        $messageId = $message->id;
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->getJson('/api/messages/' . $messageId . '/download');
        $response->assertStatus(200);
        $response->assertDownload($dummyFileName);
        if (file_exists($absolutePath)) {
            unlink($absolutePath);
        }
    }
}
