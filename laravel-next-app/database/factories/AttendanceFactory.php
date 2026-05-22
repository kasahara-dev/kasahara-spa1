<?php

namespace Database\Factories;

use App\Models\Attendance;
use App\Models\Calendar;
use App\Models\User;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Attendance>
 */
class AttendanceFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $randStatus = rand(1, 2);
        if($randStatus == 2){
            $detail = fake()->text();
        }else{
            $detail = null;
        }
        $rand = rand(1,100);
        if($rand < 10){
            $delete = now();
        }else{
            $delete = null;
        }
        return [
            'calendar_id' => null,
            'user_id' => null,
            'status' => $randStatus,
            'detail' => $detail,
            'deleted_at' => $delete,
        ];
    }
}
