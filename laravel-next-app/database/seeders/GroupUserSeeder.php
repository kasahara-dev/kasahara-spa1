<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Group;

class GroupUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = array_keys(config('group'));
        $groupsByCategory = [];
        foreach ($categories as $cat) {
            $groupsByCategory[$cat] = Group::where('category', $cat)->pluck('id');
        }
        User::where('role','parent')->each(function ($user) use ($categories, $groupsByCategory) {
            $attachIds = [];

            foreach ($categories as $cat) {
                if ($groupsByCategory[$cat]->isNotEmpty()) {
                    $attachIds[] = $groupsByCategory[$cat]->random();
                }
            }
            if (!empty($attachIds)) {
                $user->groups()->attach($attachIds);
            }
        });
    }
}
