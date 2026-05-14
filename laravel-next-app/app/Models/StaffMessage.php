<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;

#[Fillable(['to_type','to','title', 'detail', 'file_path'])]

class StaffMessage extends Model
{
    use HasFactory;
}
