<?php

namespace Tests\Feature;

use App\Models\Olympiad;
use App\Models\PageContent;
use Database\Seeders\LandingContentSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LandingContentTest extends TestCase
{
    use RefreshDatabase;

    public function test_home_page_normalizes_site_config_name_from_localized_array(): void
    {
        PageContent::create([
            'slug' => 'hero',
            'content' => [
                'siteConfig' => [
                    'name' => [
                        'id' => 'Ar Rayyan Learning Course',
                        'en' => 'Ar Rayyan Learning Course EN',
                    ],
                    'shortName' => [
                        'id' => 'ALC',
                        'en' => 'ALC EN',
                    ],
                ],
            ],
        ]);

        $response = $this->get(route('home'));

        $response->assertSuccessful();
        $response->assertInertia(fn ($page) => $page
            ->component('Public/Home', false)
            ->where('landingContent.siteConfig.name', 'Ar Rayyan Learning Course')
            ->where('landingContent.siteConfig.shortName', 'ALC')
        );
    }

    public function test_landing_content_seeder_creates_valid_olympiad_schedule_dates(): void
    {
        $this->seed(LandingContentSeeder::class);

        $olympiad = Olympiad::query()->where('name', 'Olimpiade Sains Nasional')->first();

        $this->assertNotNull($olympiad);
        $this->assertSame('2026-03-15', $olympiad?->schedule?->toDateString());
    }
}
