<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\User;

#[Fillable(['calendar_id','title', 'detail','updated_at', 'editor_id','editor'])]
class Event extends Model
{
    use HasFactory,SoftDeletes;
    public function editor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'editor_id','id');
    }
}
