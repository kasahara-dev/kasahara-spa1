<?php

namespace Database\Factories;

use App\Models\Calendar;
use App\Models\Event;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Event>
 */
class EventFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $randCal = Calendar::where('working', 1)->inRandomOrder()->first()->id;
        $randEditor = User::where('role','staff')->inRandomOrder()->first()->id;
        $rand = rand(1,100);
        if($rand < 10){
            $delete = now();
        }else{
            $delete = null;
        }
        return [
            'calendar_id' => $randCal,
            'title' => fake()->word(),
            'detail' => fake()->sentence(),
            'editor_id' => $randEditor,
            'deleted_at' => $delete,
        ];
    }
}
