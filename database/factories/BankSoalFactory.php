<?php

namespace Database\Factories;

use App\Models\BankSoal;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

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
            'slug' => Str::slug($name),
            'name' => ['id' => $name, 'en' => $name],
            'category' => ['id' => 'Matematika', 'en' => 'Mathematics'],
            'level' => ['id' => 'SD', 'en' => 'Elementary'],
            'format' => fake()->randomElement(['Offline', 'Online', 'Hybrid']),
            'questions' => fake()->numberBetween(10, 200),
            'description' => ['id' => fake()->sentence(), 'en' => fake()->sentence()],
            'tone' => 'violet',
            'is_active' => true,
        ];
    }
}
