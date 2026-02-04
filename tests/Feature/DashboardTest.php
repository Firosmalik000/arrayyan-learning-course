<?php

namespace Tests\Feature;

use App\Models\BankSoal;
use App\Models\Olympiad;
use App\Models\Package;
use App\Models\PageContent;
use App\Models\Program;
use App\Models\Role;
use App\Models\StudentRegistration;
use App\Models\TeacherRegistration;
use App\Models\User;
use App\Support\PermissionCatalog;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_dashboard_shows_pending_registrations_only(): void
    {
        Role::create([
            'name' => 'administrator',
            'label' => 'Administrator',
            'guard_name' => PermissionCatalog::GUARD,
        ]);
        $user = User::factory()->create();
        $user->assignRole('administrator');

        $pendingStudent = StudentRegistration::factory()->create([
            'student_name' => 'Pending Student',
            'created_at' => now()->subMinutes(10),
        ]);

        $pendingTeacher = TeacherRegistration::factory()->create([
            'name' => 'Pending Teacher',
            'created_at' => now()->subMinutes(5),
        ]);

        StudentRegistration::factory()->create([
            'student_name' => 'Approved Student',
            'status' => 'approved',
            'approved_at' => now(),
        ]);

        TeacherRegistration::factory()->create([
            'name' => 'Rejected Teacher',
            'status' => 'rejected',
            'rejected_at' => now(),
        ]);

        $response = $this->actingAs($user, PermissionCatalog::GUARD)->get(route('admin.dashboard'));

        $response->assertSuccessful();
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Dashboard', false)
            ->has('registrations', 2)
            ->where('registrations.0.name', $pendingTeacher->name)
            ->where('registrations.1.name', $pendingStudent->student_name)
            ->where('registrations.0.status', 'Pending')
            ->where('registrations.1.status', 'Pending')
        );
    }

    public function test_admin_dashboard_stats_reflect_active_counts(): void
    {
        Role::create([
            'name' => 'administrator',
            'label' => 'Administrator',
            'guard_name' => PermissionCatalog::GUARD,
        ]);
        $user = User::factory()->create();
        $user->assignRole('administrator');

        Program::create([
            'name' => 'Reguler',
            'level' => 'SD',
            'description' => 'Program reguler SD',
            'subjects' => ['Matematika'],
            'is_active' => true,
        ]);

        Program::create([
            'name' => 'Privat',
            'level' => 'SMP',
            'description' => 'Program privat SMP',
            'subjects' => ['IPA'],
            'is_active' => false,
        ]);

        Package::create([
            'name' => 'Paket SD',
            'level' => 'SD',
            'subjects' => ['Matematika'],
            'sessions' => 8,
            'mode' => 'Online',
            'schedule' => 'Senin - Jumat',
            'is_active' => true,
        ]);

        Package::create([
            'name' => 'Paket SMP',
            'level' => 'SMP',
            'subjects' => ['IPA'],
            'sessions' => 12,
            'mode' => 'Offline',
            'schedule' => 'Sabtu - Minggu',
            'is_active' => false,
        ]);

        BankSoal::factory()->create(['is_active' => true]);
        BankSoal::factory()->create(['is_active' => false]);

        Olympiad::factory()->create([
            'is_active' => true,
            'schedule' => now()->addDays(2),
        ]);
        Olympiad::factory()->create([
            'is_active' => false,
            'schedule' => now()->addDays(5),
        ]);

        StudentRegistration::factory()->create(['status' => 'pending']);
        TeacherRegistration::factory()->create(['status' => 'pending']);
        StudentRegistration::factory()->create([
            'status' => 'approved',
            'approved_at' => now(),
        ]);

        $response = $this->actingAs($user, PermissionCatalog::GUARD)->get(route('admin.dashboard'));

        $response->assertSuccessful();
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Dashboard', false)
            ->has('stats', 4)
            ->where('stats.0.value', 1)
            ->where('stats.1.value', 2)
            ->where('stats.2.value', 1)
            ->where('stats.3.value', 1)
        );
    }

    public function test_admin_landing_shows_olympiad_items_from_table(): void
    {
        Role::create([
            'name' => 'administrator',
            'label' => 'Administrator',
            'guard_name' => PermissionCatalog::GUARD,
        ]);
        $user = User::factory()->create();
        $user->assignRole('administrator');

        $olympiad = Olympiad::factory()->create([
            'name' => 'Olimpiade Matematika',
            'category' => 'free',
            'is_active' => true,
        ]);

        PageContent::create([
            'slug' => 'olympiad',
            'content' => [
                'olympiadContent' => [
                    'id' => [
                        'free' => [
                            'title' => 'Olimpiade Gratis',
                        ],
                    ],
                ],
            ],
        ]);
        PageContent::create([
            'slug' => 'program',
            'content' => [
                'programContent' => [
                    'id' => [
                        'levelLabel' => 'Jenjang Program',
                    ],
                ],
            ],
        ]);

        $response = $this->actingAs($user, PermissionCatalog::GUARD)->get(route('admin.landing'));

        $response->assertSuccessful();
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Landing', false)
            ->has('olympiadHighlights', 1)
            ->where('olympiadHighlights.0.id', $olympiad->id)
            ->where('olympiadHighlights.0.name.id', 'Olimpiade Matematika')
            ->where('landingContent.olympiadContent.id.free.title', 'Olimpiade Gratis')
            ->where('landingContent.programContent.id.levelLabel', 'Jenjang Program')
        );
    }
}
