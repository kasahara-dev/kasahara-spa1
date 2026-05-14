<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

#[Fillable(['name','account_id', 'role', 'password'])]
#[Hidden(['password'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory,HasApiTokens,Notifiable;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            // 'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }
    public function attendances(){
        return $this->hasMany('App\Models\Attendance');
    }
    public function groups(){
        return $this->belongsToMany('App\Models\Group', 'group_user')
            ->withTimestamps();
    }
    public function getMessages(){
        $messages = [];
        // 送受信区分:sent '0':受信、'1':送信
        if($this->role == 'parent'){
            // 受信メッセージ
            // 送受信区分、宛先区分、宛先、タイトル、本文、添付ファイルパス、日時
            // 個人宛
            $forPersonMessages = StaffMessage::where('to_type', 0)
                ->where('to', $this->id)
                ->get();
            foreach($forPersonMessages as $message){
                $messages[] = [
                    'sent' => '0',
                    'to_type' => '0',
                    'to' => $message->to,
                    'title' => $message->title,
                    'detail' => $message->detail,
                    'file_path' => $message->file_path,
                    'created_at' => $message->created_at,
                ];
            }
            // グループ宛
            $groups = $this->groups()->pluck('groups.id');
            $forGroupMessages = StaffMessage::where('to_type', 1)
                ->whereIn('to', $groups)
                ->get();
            foreach($forGroupMessages as $message){
                $messages[] = [
                    'sent' => '0',
                    'to_type' => '1',
                    'to' => $message->to,
                    'title' => $message->title,
                    'detail' => $message->detail,
                    'path' => $message->file_path,
                    'created_at' => $message->created_at,
                ];
            }
            // 送信メッセージ
            // 送受信区分、タイトル、本文、日時
            $sendMessages = ParentMessage::where('from', $this->id)->get();
            foreach($sendMessages as $message){
                $messages[] = [
                    'sent' => '1',
                    'title' => 'お問い合わせ',
                    'detail' => $message->detail,
                    'created_at' => $message->created_at,
                ];
            }
        }else{
            $messages = 'staff';
        }
        return $messages;
    }
}
