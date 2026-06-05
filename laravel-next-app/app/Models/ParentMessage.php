<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;

#[Fillable(['from','detail'])]

class ParentMessage extends Model
{
    use HasFactory;
    public static function getFormattedMessages()
    {
        $messages = self::orderBy('created_at', 'desc')->get();

        $senderIds = $messages->pluck('from')->unique();
        $senders = User::with(['groups'])->whereIn('id', $senderIds)->get()->keyBy('id');

        return $messages->map(function ($message) use ($senders) {
            $sender = $senders->get($message->from); 
            $message->sender_name = $sender?->name;
            $message->group_names = $sender 
                ? $sender->groups->where('category', '!=', 0)->pluck('name')->implode(' ') 
                : '';
            return $message;
        });
    }
}
