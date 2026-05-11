<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;

#[Fillable(['calendar_id','title', 'detail', 'editor_id'])]
class Event extends Model
{
    use HasFactory;
}
