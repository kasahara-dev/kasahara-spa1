<?php

namespace Database\Factories;

use App\Models\ParentMessage;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ParentMessage>
 */
class ParentMessageFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $user = User::where('role','parent')->inRandomOrder()->first()->id;
        $dateTime = $this->faker->dateTimeBetween('-1 year', 'now');
        return [
            'from' => $user,
            'detail' => fake()->sentence(),
            'created_at' => $dateTime,
            'updated_at' => $dateTime,
        ];
    }
}
