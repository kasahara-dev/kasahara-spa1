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
use Faker\Factory;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Mail;
use App\Mail\StaffMessageMail;

class Case11StaffSendMessageTest extends TestCase
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
        $this->staff = User::where('role', 'staff')->first();
        $this->staffAccountId = $this->staff->account_id;
        $loginResponse = $this->postJson('/api/login', [
            'login_id' => $this->staffAccountId,
            'password' => 'password',
            'role'     => 'staff',
        ]);
        $this->token = $loginResponse->json('token');
        $this->fake = Factory::create('ja_JP');
    }
    public function test_タイトル本文バリデーション(): void
    {
        Mail::fake();
        $toUserId = User::where('role', 'parent')->first()->id;
        $staffId = $this->staff->id;
        $title = $this->fake->text(rand(5,50));
        $titleOver = str_repeat('a', 51);
        $detail = $this->fake->text(rand(5,400));
        $detailOver = str_repeat('a', 401);
        // タイトルnull
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->postJson('/api/staff/staff_messages', [
            'to_type'   => 0,
            'to'        => $toUserId,
            'title'     => null,
            'detail'    => $detail,
            'file_path' => null,
        ]);
        $response->assertStatus(422);
        $staffMessageCount = StaffMessage::count();
        $this->assertEquals($staffMessageCount,0,'タイトルnullバリデーション通過しています');
        Mail::assertNothingSent();
        // タイトル文字数オーバー
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->postJson('/api/staff/staff_messages', [
            'to_type'   => 0,
            'to'        => $toUserId,
            'title'     => $titleOver,
            'detail'    => $detail,
            'file_path' => null,
        ]);
        $response->assertStatus(422);
        $staffMessageCount = StaffMessage::count();
        $this->assertEquals($staffMessageCount,0,'タイトル文字数越えバリデーション通過しています');
        Mail::assertNothingSent();
        // 本文null
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->postJson('/api/staff/staff_messages', [
            'to_type'   => 0,
            'to'        => $toUserId,
            'title'     => $title,
            'detail'    => null,
            'file_path' => null,
        ]);
        $response->assertStatus(422);
        $staffMessageCount = StaffMessage::count();
        $this->assertEquals($staffMessageCount,0,'タイトルnullバリデーション通過しています');
        Mail::assertNothingSent();
        // 本文文字数オーバー
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->postJson('/api/staff/staff_messages', [
            'to_type'   => 0,
            'to'        => $toUserId,
            'title'     => $title,
            'detail'    => $detailOver,
            'file_path' => null,
        ]);
        $response->assertStatus(422);
        $staffMessageCount = StaffMessage::count();
        $this->assertEquals($staffMessageCount,0,'タイトル文字数越えバリデーション通過しています');
        Mail::assertNothingSent();
    }
    public function test_添付ファイルバリデーション(): void
    {
        Mail::fake();
        $toUserId = User::where('role', 'parent')->first()->id;
        $staffId = $this->staff->id;
        $title = $this->fake->text(rand(5,50));
        $detail = $this->fake->text(rand(5,400));
        $invalidExtensionFile = UploadedFile::fake()->create('virus.exe', 100, 'application/x-msdownload');
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->postJson('/api/staff/staff_messages', [
            'to_type'   => 0,
            'to'        => $toUserId,
            'title'     => $title,
            'detail'    => $detail,
            'file_path' => $invalidExtensionFile,
        ]);
        $response->assertStatus(422);
        $staffMessageCount = StaffMessage::count();
        $this->assertEquals($staffMessageCount,0,'ファイル拡張子バリデーション通過しています');
        $largeFile = UploadedFile::fake()->create('huge_file.pdf', 5121, 'application/pdf');
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->postJson('/api/staff/staff_messages', [
            'to_type'   => 0,
            'to'        => $toUserId,
            'title'     => $title,
            'detail'    => $detail,
            'file_path' => $largeFile,
        ]);
        $response->assertStatus(422);
        $staffMessageCount = StaffMessage::count();
        $this->assertEquals($staffMessageCount,0,'ファイルサイズバリデーション通過しています');
        Mail::assertNothingSent();
    }
    public function test_全員にメッセージとメールを送信できる(){
        Mail::fake();
        // 個人宛
        $toUser = User::where('role', 'parent')->inRandomOrder()->first();
        $toId = $toUser->id;
        $title = $this->fake->text(rand(5,50));
        $detail = $this->fake->text(rand(5,400));
        $rand = rand(0,100);
        if($rand > 50){
            $file = UploadedFile::fake()->create('file.pdf', 5120, 'application/pdf');
        }else{
            $file = null;
        }
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->postJson('/api/staff/staff_messages', [
            'to_type'   => 0,
            'to'        => $toId,
            'title'     => $title,
            'detail'    => $detail,
            'file_path' => $file,
        ]);
        $response->assertStatus(201);
        $this->assertDatabaseHas('staff_messages', [
            'to_type' => 0,
            'to' => $toId,
            'title' => $title,
            'detail' => $detail,
        ]);
        $staffMessage = StaffMessage::first();
        $messageId = $staffMessage->id;
        $filePath = $staffMessage->file_path;
        if($file){
            $this->assertNotNull(StaffMessage::first()->file_path);
            $response = $this->withHeaders([
                'Authorization' => 'Bearer ' . $this->token,
                ])->getJson('/api/staff/staff_messages/' . $messageId . '/download');
            $response->assertStatus(200);
            $fileName = basename($filePath);
            $response->assertDownload($fileName);
        }else{
            $this->assertNull(StaffMessage::first()->file_path);
        }
        Mail::assertSent(StaffMessageMail::class, function ($mail) use ($toUser) {
            return $mail->hasTo($toUser->profile->email1);
        });
        if($toUser->profile->email2){
            Mail::assertSent(StaffMessageMail::class, function ($mail) use ($toUser) {
                return $mail->hasTo($toUser->profile->email2);
            });
        }
        if($toUser->profile->email3){
            Mail::assertSent(StaffMessageMail::class, function ($mail) use ($toUser) {
                return $mail->hasTo($toUser->profile->email3);
            });
        }
        // グループ宛
        $toUser = User::where('role', 'parent')->has('groups')->inRandomOrder()->first();
        $toGroup = $toUser->groups()->inRandomOrder()->first();
        $toId = $toGroup->id;
        $title = $this->fake->text(rand(5,50));
        $detail = $this->fake->text(rand(5,400));
        $rand = rand(0,100);
        if($rand > 50){
            $file = UploadedFile::fake()->create('file.pdf', 5120, 'application/pdf');
        }else{
            $file = null;
        }
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->postJson('/api/staff/staff_messages', [
            'to_type'   => 1,
            'to'        => $toId,
            'title'     => $title,
            'detail'    => $detail,
            'file_path' => $file,
        ]);
        $response->assertStatus(201);
        $this->assertDatabaseHas('staff_messages', [
            'to_type' => 1,
            'to' => $toId,
            'title' => $title,
            'detail' => $detail,
        ]);
        $staffMessage = StaffMessage::where('to_type',1)->first();
        $messageId = $staffMessage->id;
        $filePath = $staffMessage->file_path;
        if($file){
            $this->assertNotNull(StaffMessage::where('to_type',1)->first()->file_path);
            $response = $this->withHeaders([
                'Authorization' => 'Bearer ' . $this->token,
                ])->getJson('/api/staff/staff_messages/' . $messageId . '/download');
            $response->assertStatus(200);
            $fileName = basename($filePath);
            $response->assertDownload($fileName);
        }else{
            $this->assertNull(StaffMessage::where('to_type',1)->first()->file_path);
        }
        $users = $toGroup->users()->get();
        foreach($users as $user){
            Mail::assertSent(StaffMessageMail::class, function ($mail) use ($user) {
                return $mail->hasTo($user->profile->email1);
            });
            if($user->profile->email2){
                Mail::assertSent(StaffMessageMail::class, function ($mail) use ($user) {
                    return $mail->hasTo($user->profile->email2);
                });
            }
            if($user->profile->email3){
                Mail::assertSent(StaffMessageMail::class, function ($mail) use ($user) {
                    return $mail->hasTo($user->profile->email3);
                });
            }
        }
        
    }
}
