<?php

namespace Database\Factories;

use App\Models\BankSoal;
use App\Models\BankSoalResource;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<BankSoalResource>
 */
class BankSoalResourceFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'bank_soal_id' => BankSoal::factory(),
            'label' => fake()->words(2, true),
            'destination_url' => fake()->url(),
            'sort_order' => 10,
        ];
    }
}
