<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Fillable;

#[Fillable(['date', 'working'])]

class Calendar extends Model
{
    const STATUS_CLOSED = 0;
    const STATUS_FULL_DAY = 1;
    public function events(){
        return $this->hasMany('App\Models\Event');
    }
    public function attendances(){
        return $this->hasMany('App\Models\Attendance');
    }
}
