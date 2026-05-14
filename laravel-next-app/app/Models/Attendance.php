<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable(['calendar_id','user_id', 'status', 'detail'])]

class Attendance extends Model
{
    use HasFactory,SoftDeletes;
}
