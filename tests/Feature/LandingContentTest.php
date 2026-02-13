<?php

namespace Tests\Feature;

use App\Models\PageContent;
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
}
