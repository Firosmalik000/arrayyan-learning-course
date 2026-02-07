<?php

namespace Tests\Feature;

use App\Models\PageContent;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class SeoThemeTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_injects_seo_theme_colors_into_the_app_shell(): void
    {
        PageContent::create([
            'slug' => 'seo-settings',
            'content' => [
                'colors' => [
                    'primary' => '#112233',
                    'secondary' => '#445566',
                    'accent' => '#778899',
                ],
                'contact' => [
                    'logo' => [
                        'path' => 'seo/logo.png',
                    ],
                ],
            ],
        ]);

        $faviconUrl = Storage::url('seo/logo.png');

        $response = $this->get('/');

        $response->assertSuccessful();
        $response->assertSee('--color-primary: #112233', false);
        $response->assertSee('--color-secondary: #445566', false);
        $response->assertSee('--color-accent: #778899', false);
        $response->assertSee("<link rel=\"icon\" href=\"{$faviconUrl}\">", false);
        $response->assertSee("<link rel=\"apple-touch-icon\" href=\"{$faviconUrl}\">", false);
        $response->assertSee('<meta name="theme-color" content="#112233">', false);
    }
}
