<?php

namespace Tests\Feature;

use App\Models\Program;
use App\Models\Role;
use App\Models\StudentRegistration;
use App\Models\User;
use App\Support\PermissionCatalog;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProgramQuotaTest extends TestCase
{
    use RefreshDatabase;

    private function actingAsAdmin(): User
    {
        Role::create([
            'name' => 'administrator',
            'label' => 'Administrator',
            'guard_name' => PermissionCatalog::GUARD,
        ]);

        $user = User::factory()->create();
        $user->assignRole('administrator');

        return $user;
    }

    private function studentPayload(Program $program, string $contact = '081234567890'): array
    {
        return [
            'student_name' => 'Anak Kuota',
            'address' => 'Jl. Test',
            'school_name' => 'SMP Test',
            'level' => 'SMP',
            'subjects' => 'Matematika',
            'program_id' => $program->id,
            'package' => '8 Sesi/Bulan',
            'parent_contact' => $contact,
            'parent_email' => 'quota.parent@example.com',
        ];
    }

    public function test_registration_blocked_when_quota_full(): void
    {
        $program = Program::create([
            'name' => 'Reguler Penuh',
            'level' => 'SMP',
            'quota' => 1,
            'is_active' => true,
        ]);
        StudentRegistration::factory()->create([
            'program_id' => $program->id,
            'status' => 'approved',
        ]);

        $response = $this->post(route('registrations.student'), $this->studentPayload($program));

        $response->assertSessionHasErrors('program_id');
        $this->assertDatabaseMissing('student_registrations', ['student_name' => 'Anak Kuota']);
    }

    public function test_rejected_registrations_do_not_consume_quota(): void
    {
        $program = Program::create([
            'name' => 'Reguler Longgar',
            'level' => 'SMP',
            'quota' => 1,
            'is_active' => true,
        ]);
        StudentRegistration::factory()->create([
            'program_id' => $program->id,
            'status' => 'rejected',
        ]);

        $response = $this->post(route('registrations.student'), $this->studentPayload($program));

        $response->assertSessionHasNoErrors();
        $this->assertDatabaseHas('student_registrations', ['student_name' => 'Anak Kuota']);
    }

    public function test_pending_registrations_consume_quota(): void
    {
        $program = Program::create([
            'name' => 'Reguler Antre',
            'level' => 'SMP',
            'quota' => 1,
            'is_active' => true,
        ]);
        StudentRegistration::factory()->create([
            'program_id' => $program->id,
            'status' => 'pending',
        ]);

        $response = $this->post(route('registrations.student'), $this->studentPayload($program, '081299988877'));

        $response->assertSessionHasErrors('program_id');
    }

    public function test_program_without_quota_accepts_registrations(): void
    {
        $program = Program::create([
            'name' => 'Reguler Bebas',
            'level' => 'SMP',
            'quota' => null,
            'is_active' => true,
        ]);
        StudentRegistration::factory()->count(5)->create([
            'program_id' => $program->id,
            'status' => 'approved',
        ]);

        $response = $this->post(route('registrations.student'), $this->studentPayload($program));

        $response->assertSessionHasNoErrors();
        $this->assertDatabaseHas('student_registrations', ['student_name' => 'Anak Kuota']);
    }

    public function test_program_detail_resolves_by_slug_and_legacy_id(): void
    {
        $program = Program::create([
            'name' => 'Privat Elite',
            'slug' => 'privat-elite',
            'level' => 'SMA',
            'price' => 350000,
            'quota' => 10,
            'syllabus' => ['Aljabar', 'Geometri'],
            'is_active' => true,
        ]);

        foreach (['privat-elite', (string) $program->id] as $key) {
            $response = $this->get(route('programs.detail', $key));

            $response->assertSuccessful();
            $response->assertInertia(fn ($page) => $page
                ->component('Public/Program/Detail', false)
                ->where('program.id', $program->id)
                ->where('program.slug', 'privat-elite')
                ->where('program.quota_remaining', 10)
                ->where('program.is_full', false)
            );
        }
    }

    public function test_register_page_exposes_quota_info(): void
    {
        $program = Program::create([
            'name' => 'Reguler Info',
            'level' => 'SMP',
            'quota' => 2,
            'is_active' => true,
        ]);
        StudentRegistration::factory()->create([
            'program_id' => $program->id,
            'status' => 'approved',
        ]);

        $response = $this->get(route('register'));

        $response->assertSuccessful();
        $response->assertInertia(fn ($page) => $page
            ->component('Public/Register', false)
            ->has('programs', 1)
            ->where('programs.0.quota_remaining', 1)
            ->where('programs.0.is_full', false)
        );
    }

    public function test_admin_can_set_marketing_fields_with_auto_slug(): void
    {
        $user = $this->actingAsAdmin();

        $response = $this->actingAs($user, PermissionCatalog::GUARD)->post(route('admin.programs.store'), [
            'name' => 'Kelas Intensif UTBK',
            'level' => 'SMA',
            'mode' => 'offline',
            'price' => 500000,
            'duration' => '3 bulan',
            'quota' => 25,
            'schedule_info' => 'Senin & Kamis 16.00',
            'syllabus' => ['TPS', 'TKA'],
            'is_active' => 1,
            'is_featured' => 1,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('programs', [
            'name' => 'Kelas Intensif UTBK',
            'slug' => 'kelas-intensif-utbk',
            'price' => 500000,
            'quota' => 25,
            'is_featured' => true,
        ]);
    }
}
