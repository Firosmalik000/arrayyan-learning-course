<?php

namespace Database\Factories;

use App\Models\BankSoal;
use App\Models\EducationClass;
use App\Models\Subject;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<BankSoal>
 */
class BankSoalFactory extends Factory
{
    protected $model = BankSoal::class;

    public function definition(): array
    {
        $name = fake()->sentence(3);

        return [
            'education_class_id' => EducationClass::factory(),
            'subject_id' => Subject::factory(),
            'classification_status' => 'ready',
            'name' => ['id' => $name, 'en' => $name],
            'format' => fake()->randomElement(['Offline', 'Online', 'Hybrid']),
            'questions' => fake()->numberBetween(10, 200),
            'description' => ['id' => fake()->sentence(), 'en' => fake()->sentence()],
            'tone' => 'violet',
            'is_active' => true,
        ];
    }

    public function configure(): static
    {
        return $this->afterCreating(function (BankSoal $bankSoal): void {
            $bankSoal->educationClass?->educationLevel?->subjects()->syncWithoutDetaching($bankSoal->subject_id);
        });
    }
}
