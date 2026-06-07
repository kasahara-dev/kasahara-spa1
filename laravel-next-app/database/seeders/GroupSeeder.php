<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Group;

class GroupSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Group::create([
            'name' => '全体',
            'category' => '0',
        ]);
        Group::create([
            'name' => '年少',
            'category' => '1',
        ]);
        Group::create([
            'name' => '年中',
            'category' => '1',
        ]);
        Group::create([
            'name' => '年中',
            'category' => '1',
        ]);
        Group::create([
            'name' => 'うさぎ組',
            'category' => '2',
        ]);
        Group::create([
            'name' => 'りす組',
            'category' => '2',
        ]);
        Group::create([
            'name' => 'いちご組',
            'category' => '2',
        ]);
        Group::create([
            'name' => 'りんご組',
            'category' => '2',
        ]);
        Group::create([
            'name' => 'ほし組',
            'category' => '2',
        ]);
        Group::create([
            'name' => 'うみ組',
            'category' => '2',
        ]);
        Group::create([
            'name' => 'にじ組',
            'category' => '2',
        ]);
        Group::create([
            'name' => 'つき組',
            'category' => '2',
        ]);
        Group::create([
            'name' => '歩きコース',
            'category' => '3',
        ]);
        Group::create([
            'name' => 'みどりコース',
            'category' => '3',
        ]);
        Group::create([
            'name' => 'きいろコース',
            'category' => '3',
        ]);
    }
}
