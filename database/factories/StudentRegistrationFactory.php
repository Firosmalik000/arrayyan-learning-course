<?php

namespace Database\Factories;

use App\Models\Program;
use App\Models\StudentRegistration;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\StudentRegistration>
 */
class StudentRegistrationFactory extends Factory
{
    protected $model = StudentRegistration::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $program = Program::query()->inRandomOrder()->first(['id', 'name']);

        return [
            'student_name' => fake()->name(),
            'address' => fake()->address(),
            'school_name' => fake()->company().' School',
            'level' => fake()->randomElement(['SD', 'SMP', 'SMA']),
            'subjects' => fake()->randomElement(['Matematika', 'IPA', 'Bahasa Inggris']),
            'program_id' => $program?->id,
            'program' => $program?->name ?? fake()->randomElement(['Reguler', 'Privat', 'Persiapan Ujian']),
            'package' => fake()->randomElement(['8 Sesi/Bulan', '12 Sesi/Bulan', '20 Sesi/Bulan']),
            'parent_contact' => fake()->phoneNumber(),
            'preferred_mode' => fake()->randomElement(['Online', 'Offline', null]),
            'notes' => fake()->optional()->sentence(),
        ];
    }
}
