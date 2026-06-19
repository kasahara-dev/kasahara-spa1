<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Fillable;

#[Fillable(['name','category'])]

class Group extends Model
{
    public function users(){
        return $this->belongsToMany('App\Models\User', 'group_user')
            ->withTimestamps();
    }
}
