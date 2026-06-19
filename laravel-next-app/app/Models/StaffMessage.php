<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;

#[Fillable(['to_type','to','title', 'detail', 'file_path'])]

class StaffMessage extends Model
{
    use HasFactory;
    public static function getFormattedMessages()
    {
        $messages = self::orderBy('created_at', 'desc')->get();

        $userIds = $messages->where('to_type', 0)->pluck('to')->unique();
        $users = User::with(['groups'])->whereIn('id', $userIds)->get()->keyBy('id');

        $groupIds = $messages->where('to_type', 1)->pluck('to')->unique();
        $groups = Group::whereIn('id', $groupIds)->get()->keyBy('id');

        return $messages->map(function ($message) use ($users, $groups) {
            if ($message->to_type === 0) {
                $user = $users->get($message->to);
                $message->receiver_name = $user?->name;
                $message->group_names = $user ? $user->groups->where('category', '!=', 0)->pluck('name')->implode(' ') : '';
            } else {
                $group = $groups->get($message->to);
                $message->receiver_name = null;
                $message->group_names = $group?->name;
            }
            return $message;
        });
    }
}
