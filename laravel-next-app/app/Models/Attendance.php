<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['calendar_id','user_id', 'status', 'detail','editor_id'])]

class Attendance extends Model
{
    use HasFactory,SoftDeletes;
    public function user(){
        return $this->belongsTo('App\Models\User');
    }
    public function editor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'editor_id','id');
    }
}
