<?php

namespace Database\Factories;

use App\Models\Olympiad;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Olympiad>
 */
class OlympiadFactory extends Factory
{
    protected $model = Olympiad::class;

    public function definition(): array
    {
        $name = fake()->sentence(3);

        return [
            'name' => $name,
            'slug' => Str::slug($name),
            'level' => fake()->randomElement(['SD', 'SMP', 'SMA']),
            'schedule' => fake()->date(),
            'selection_system' => fake()->sentence(2),
            'category' => fake()->randomElement(['free', 'paid']),
            'fee' => fake()->randomFloat(2, 0, 500000),
            'notes' => fake()->sentence(),
            'is_active' => true,
        ];
    }
}
