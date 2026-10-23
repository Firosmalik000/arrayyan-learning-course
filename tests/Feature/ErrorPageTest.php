<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ErrorPageTest extends TestCase
{
    use RefreshDatabase;

    public function test_non_existent_page_renders_404_error_page(): void
    {
        $response = $this->get('/halaman-acak-yang-tidak-ada-12345');

        $response->assertNotFound();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Error')
            ->where('status', 404)
        );
    }

    public function test_error_preview_route_renders_correct_status(): void
    {
        $response404 = $this->get('/error/404');
        $response404->assertNotFound();
        $response404->assertInertia(fn (Assert $page) => $page
            ->component('Error')
            ->where('status', 404)
        );

        $response403 = $this->get('/error/403');
        $response403->assertForbidden();
        $response403->assertInertia(fn (Assert $page) => $page
            ->component('Error')
            ->where('status', 403)
        );

        $response500 = $this->get('/error/500');
        $response500->assertStatus(500);
        $response500->assertInertia(fn (Assert $page) => $page
            ->component('Error')
            ->where('status', 500)
        );

        $response503 = $this->get('/error/503');
        $response503->assertStatus(503);
        $response503->assertInertia(fn (Assert $page) => $page
            ->component('Error')
            ->where('status', 503)
        );
    }
}
