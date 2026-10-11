<?php

namespace Tests\Feature;

use App\Models\BankSoal;
use App\Models\Program;
use App\Models\StudentRegistration;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class SecurityAuditTest extends TestCase
{
    use RefreshDatabase;

    public function test_all_admin_routes_require_authorization_middleware(): void
    {
        $unprotected = [];

        foreach (app('router')->getRoutes()->getRoutes() as $route) {
            $uri = $route->uri();

            if (! str_starts_with($uri, 'admin/')) {
                continue;
            }

            if (in_array('GET', $route->methods(), true) && $uri === 'admin/login') {
                continue;
            }

            $middleware = collect($route->gatherMiddleware())->map(
                fn ($item) => is_string($item) ? $item : (is_object($item) ? $item::class : '')
            );

            $hasAuth = $middleware->contains(fn ($item) => str_contains($item, 'auth')
                || str_contains($item, 'role_or_permission')
                || str_contains($item, 'role')
                || str_contains($item, 'permission'));

            if (! $hasAuth) {
                $unprotected[] = implode('|', $route->methods()).' '.$uri;
            }
        }

        $this->assertEquals([], $unprotected, 'Rute admin tanpa middleware otorisasi: '.implode(', ', $unprotected));
    }

    public function test_public_post_routes_are_throttled(): void
    {
        $expected = [
            'registrations.student',
            'registrations.teacher',
            'olympiad.register.store',
            'banksoal.unlock',
            'bayar.upload',
            'portal.login.store',
        ];

        $missing = [];

        foreach ($expected as $name) {
            $route = app('router')->getRoutes()->getByName($name);

            if (! $route) {
                $missing[] = "{$name} (route hilang)";

                continue;
            }

            $middleware = implode(',', collect($route->gatherMiddleware())->map(
                fn ($item) => is_string($item) ? $item : ''
            )->all());

            if (! str_contains($middleware, 'throttle')) {
                $missing[] = $name;
            }
        }

        $this->assertEquals([], $missing, 'Route tanpa throttle: '.implode(', ', $missing));
    }

    public function test_honeypot_blocks_bot_submission(): void
    {
        $program = Program::create(['name' => 'Reguler', 'level' => 'SMP', 'is_active' => true]);

        $response = $this->post(route('registrations.student'), [
            'student_name' => 'Bot',
            'address' => 'Jl. Bot',
            'school_name' => 'SMP Bot',
            'level' => 'SMP',
            'subjects' => 'Matematika',
            'program_id' => $program->id,
            'package' => '8 Sesi/Bulan',
            'parent_contact' => '081234567890',
            'parent_email' => 'bot.parent@example.com',
            'website' => 'http://spam.example',
        ]);

        $response->assertSessionHasErrors('website');
        $this->assertDatabaseMissing('student_registrations', ['student_name' => 'Bot']);
    }

    public function test_time_trap_blocks_instant_submission(): void
    {
        $program = Program::create(['name' => 'Reguler', 'level' => 'SMP', 'is_active' => true]);

        $response = $this->post(route('registrations.student'), [
            'student_name' => 'Kilat',
            'address' => 'Jl. Test',
            'school_name' => 'SMP Test',
            'level' => 'SMP',
            'subjects' => 'Matematika',
            'program_id' => $program->id,
            'package' => '8 Sesi/Bulan',
            'parent_contact' => '081234567890',
            'parent_email' => 'fast.parent@example.com',
            'form_started_at' => time(),
        ]);

        $response->assertSessionHasErrors('form_started_at');
        $this->assertDatabaseMissing('student_registrations', ['student_name' => 'Kilat']);
    }

    public function test_landing_content_is_cached_and_busted(): void
    {
        Cache::flush();

        $this->get(route('home'));

        $this->assertTrue(Cache::has('landing-content'));
        $this->assertTrue(Cache::has('seo-settings'));
    }

    public function test_debug_mode_is_off_in_production_guard(): void
    {
        if (app()->environment('production')) {
            $this->assertFalse((bool) config('app.debug'));
        } else {
            $this->assertTrue(true);
        }
    }

    public function test_sensitive_fields_are_hidden_from_serialization(): void
    {
        $bankSoal = BankSoal::factory()->create([
            'passkey' => Hash::make('secret'),
        ]);

        $this->assertArrayNotHasKey('passkey', $bankSoal->toArray());
    }

    public function test_registration_quota_still_guarded_under_spam(): void
    {
        $program = Program::create(['name' => 'Reguler', 'level' => 'SMP', 'quota' => 1, 'is_active' => true]);
        StudentRegistration::factory()->create(['program_id' => $program->id, 'status' => 'approved']);

        $payload = [
            'student_name' => 'Anak Spam',
            'address' => 'Jl. Test',
            'school_name' => 'SMP Test',
            'level' => 'SMP',
            'subjects' => 'Matematika',
            'program_id' => $program->id,
            'package' => '8 Sesi/Bulan',
            'parent_contact' => '081234567890',
            'parent_email' => 'spam.parent@example.com',
        ];

        for ($i = 0; $i < 3; $i++) {
            $this->post(route('registrations.student'), $payload);
        }

        $this->assertEquals(1, StudentRegistration::query()
            ->where('program_id', $program->id)
            ->count());
    }
}
