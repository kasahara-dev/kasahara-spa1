<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Event;
use App\Models\Calendar;
use App\Models\User;

class EventSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $calendarId = Calendar::whereDate('date', '2026-05-09')->first()->id;
        $randEditor = User::where('role','staff')->inRandomOrder()->first()->id;
        Event::create([
            'calendar_id' => $calendarId,
            'title' => '母親参観',
            'detail' => '10時開始予定です。スリッパをご持参ください。',
            'editor_id' => $randEditor,
        ]);
        $calendarId = Calendar::whereDate('date', '2026-06-06')->first()->id;
        $randEditor = User::where('role','staff')->inRandomOrder()->first()->id;
        Event::create([
            'calendar_id' => $calendarId,
            'title' => '父親参観',
            'detail' => '11時開始予定です。スリッパをご持参ください。動きやすい服装でお越しください。',
            'editor_id' => $randEditor,
        ]);
        $calendarId = Calendar::whereDate('date', '2026-08-20')->first()->id;
        $randEditor = User::where('role','staff')->inRandomOrder()->first()->id;
        Event::create([
            'calendar_id' => $calendarId,
            'title' => '登園日',
            'detail' => 'バス運行します。',
            'editor_id' => $randEditor,
        ]);
        $calendarId = Calendar::whereDate('date', '2026-08-21')->first()->id;
        $randEditor = User::where('role','staff')->inRandomOrder()->first()->id;
        Event::create([
            'calendar_id' => $calendarId,
            'title' => '登園日',
            'detail' => 'バス運行します。',
            'editor_id' => $randEditor,
        ]);
        $calendarId = Calendar::whereDate('date', '2026-08-22')->first()->id;
        $randEditor = User::where('role','staff')->inRandomOrder()->first()->id;
        Event::create([
            'calendar_id' => $calendarId,
            'title' => '夏祭り',
            'detail' => '自由参加です。',
            'editor_id' => $randEditor,
        ]);
        $calendarId = Calendar::whereDate('date', '2026-10-10')->first()->id;
        $randEditor = User::where('role','staff')->inRandomOrder()->first()->id;
        Event::create([
            'calendar_id' => $calendarId,
            'title' => '運動会',
            'detail' => '9時開始です。',
            'editor_id' => $randEditor,
        ]);
        $calendarId = Calendar::whereDate('date', '2026-12-05')->first()->id;
        $randEditor = User::where('role','staff')->inRandomOrder()->first()->id;
        Event::create([
            'calendar_id' => $calendarId,
            'title' => '保護者会',
            'detail' => 'スリッパをご持参ください。',
            'editor_id' => $randEditor,
        ]);
        $calendarId = Calendar::whereDate('date', '2027-02-06')->first()->id;
        $randEditor = User::where('role','staff')->inRandomOrder()->first()->id;
        Event::create([
            'calendar_id' => $calendarId,
            'title' => '保護者会',
            'detail' => 'スリッパをご持参ください。',
            'editor_id' => $randEditor,
        ]);
        Event::factory()->count(20)->create();
    }
}
