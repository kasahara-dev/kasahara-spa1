<?php

namespace App\Policies;

use App\Models\StaffMessage;
use App\Models\User;

class StaffMessagePolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return false;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, StaffMessage $staffMessage): bool
    {
        $groups = $user->groups()->pluck('groups.id')->toArray();
        if($staffMessage->to_type == 0){
            if($staffMessage->to == $user->id){
                return true;
            }
        }else{
            if(in_array($staffMessage->to,$groups)){
                return true;
            }
        }
        return false;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return false;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, StaffMessage $staffMessage): bool
    {
        return false;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, StaffMessage $staffMessage): bool
    {
        return false;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, StaffMessage $staffMessage): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, StaffMessage $staffMessage): bool
    {
        return false;
    }
}
