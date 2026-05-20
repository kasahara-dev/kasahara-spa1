<?php

namespace Database\Factories;

use App\Models\Profile;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Profile>
 */
class ProfileFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => null,
            'email1' => $this->faker->safeEmail(),
            'email2' => $this->faker->optional()->safeEmail(),
            'email3' => $this->faker->optional()->safeEmail(),
            'tel1' => $this->faker->phoneNumber(),
            'tel2' => $this->faker->optional()->phoneNumber(),
            'tel3' => $this->faker->optional()->phoneNumber(),
        ];
    }
}
