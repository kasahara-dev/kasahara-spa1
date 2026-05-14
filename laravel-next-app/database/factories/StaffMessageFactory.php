<?php

namespace Database\Factories;

use App\Models\StaffMessage;
use App\Models\User;
use App\Models\Group;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<StaffMessage>
 */
class StaffMessageFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $rand = rand(1,100);
        if($rand > 50){
            $type = '0';
            $to = User::where('role','parent')->inRandomOrder()->first()->id;
        }else{
            $type = '1';
            $to = Group::inRandomOrder()->first()->id;
        }
        $rand = rand(1,100);
        if($rand > 50){
            $file = null;
        }else{
            $file = 'file/message/おたより.pdf';
        }
        return [
            'to_type' => $type,
            'to' => $to,
            'title' => fake()->word(),
            'detail' => fake()->sentence(),
            'file_path' => $file,
        ];
    }
}
