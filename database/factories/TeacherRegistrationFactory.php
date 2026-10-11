<?php

namespace Database\Factories;

use App\Models\TeacherRegistration;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<TeacherRegistration>
 */
class TeacherRegistrationFactory extends Factory
{
    protected $model = TeacherRegistration::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'registration_no' => 'TCR-'.fake()->unique()->numerify('########'),
            'name' => fake()->name(),
            'address' => fake()->address(),
            'education' => fake()->randomElement(['S1 Pendidikan', 'S2 Matematika', 'S1 Bahasa Inggris']),
            'subjects' => fake()->randomElement(['Matematika', 'IPA', 'Bahasa Inggris']),
            'experience' => fake()->optional()->sentence(),
            'contact' => fake()->phoneNumber(),
            'email' => fake()->safeEmail(),
            'cv_path' => null,
            'notes' => fake()->optional()->sentence(),
        ];
    }
}
