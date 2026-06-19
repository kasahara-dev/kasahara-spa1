<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Fillable;

#[Fillable(['user_id','email1','email2','email3','tel1','tel2','tel3'])]
class Profile extends Model
{
    use HasFactory;
}
