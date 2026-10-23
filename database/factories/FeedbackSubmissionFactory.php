<?php

namespace Database\Factories;

use App\Models\FeedbackSubmission;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<FeedbackSubmission>
 */
class FeedbackSubmissionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'submitter_name' => fake()->name(),
            'submitter_email' => fake()->safeEmail(),
            'submitter_contact' => fake()->phoneNumber(),
            'category' => fake()->randomElement(array_keys(FeedbackSubmission::CATEGORIES)),
            'rating' => fake()->numberBetween(1, 5),
            'subject' => fake()->sentence(5),
            'message' => fake()->paragraph(),
            'status' => FeedbackSubmission::STATUS_NEW,
        ];
    }
}
