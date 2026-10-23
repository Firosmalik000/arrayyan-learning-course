<?php

namespace Database\Factories;

use App\Models\ClassMember;
use App\Models\ClassMemberPeriod;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ClassMemberPeriod>
 */
class ClassMemberPeriodFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'class_member_id' => fn (): ?int => ClassMember::query()->value('id'),
            'start_date' => now()->startOfMonth()->toDateString(),
            'end_date' => now()->endOfMonth()->toDateString(),
            'session_limit' => fake()->numberBetween(4, 12),
            'notes' => null,
            'created_by' => null,
        ];
    }
}
