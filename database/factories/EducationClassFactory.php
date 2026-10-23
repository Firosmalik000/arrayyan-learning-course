<?php

namespace Database\Factories;

use App\Models\EducationClass;
use App\Models\EducationLevel;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<EducationClass>
 */
class EducationClassFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'education_level_id' => EducationLevel::factory(),
            'name' => 'Kelas '.fake()->unique()->numberBetween(1, 1000),
            'sort_order' => fake()->numberBetween(1, 100),
            'is_active' => true,
        ];
    }
}
