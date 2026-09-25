<?php

namespace Tests\Feature;

use App\Models\Program;
use App\Models\StudentRegistration;
use App\Models\TeacherRegistration;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StatusCheckTest extends TestCase
{
    use RefreshDatabase;

    public function test_status_page_renders_without_lookup(): void
    {
        $response = $this->get(route('status.check'));

        $response->assertSuccessful();
        $response->assertInertia(fn ($page) => $page
            ->component('Public/StatusCheck', false)
            ->where('searched', false)
            ->where('result', null)
        );
    }

    public function test_finds_student_by_ticket_and_phone(): void
    {
        $program = Program::create(['name' => 'Reguler', 'level' => 'SMP', 'is_active' => true]);
        $reg = StudentRegistration::factory()->create([
            'student_name' => 'Anak Status',
            'parent_contact' => '081234567890',
            'program_id' => $program->id,
            'program' => 'Reguler',
            'registration_no' => 'ALC-2026-00001',
            'status' => 'pending',
        ]);

        $response = $this->get(route('status.check', [
            'ticket' => 'alc-2026-00001',
            'phone' => '0812-3456-7890',
        ]));

        $response->assertSuccessful();
        $response->assertInertia(fn ($page) => $page
            ->component('Public/StatusCheck', false)
            ->where('searched', true)
            ->where('result.ticket', 'ALC-2026-00001')
            ->where('result.name', 'Anak Status')
            ->where('result.type', 'student')
            ->where('result.status', 'pending')
            ->where('result.program', 'Reguler')
        );
    }

    public function test_wrong_phone_returns_not_found(): void
    {
        StudentRegistration::factory()->create([
            'parent_contact' => '081234567890',
            'registration_no' => 'ALC-2026-00002',
            'status' => 'pending',
        ]);

        $response = $this->get(route('status.check', [
            'ticket' => 'ALC-2026-00002',
            'phone' => '089999999999',
        ]));

        $response->assertSuccessful();
        $response->assertInertia(fn ($page) => $page
            ->component('Public/StatusCheck', false)
            ->where('searched', true)
            ->where('result', null)
        );
    }

    public function test_unknown_ticket_returns_not_found(): void
    {
        $response = $this->get(route('status.check', [
            'ticket' => 'ALC-2026-99999',
            'phone' => '081234567890',
        ]));

        $response->assertSuccessful();
        $response->assertInertia(fn ($page) => $page
            ->component('Public/StatusCheck', false)
            ->where('searched', true)
            ->where('result', null)
        );
    }

    public function test_finds_teacher_by_ticket_and_contact(): void
    {
        TeacherRegistration::factory()->create([
            'name' => 'Guru Status',
            'contact' => '081298765432',
            'subjects' => 'Matematika',
            'registration_no' => 'ALC-2026-00003',
            'status' => 'approved',
            'approved_at' => now(),
        ]);

        $response = $this->get(route('status.check', [
            'ticket' => 'ALC-2026-00003',
            'phone' => '081298765432',
        ]));

        $response->assertSuccessful();
        $response->assertInertia(fn ($page) => $page
            ->component('Public/StatusCheck', false)
            ->where('searched', true)
            ->where('result.type', 'teacher')
            ->where('result.name', 'Guru Status')
            ->where('result.status', 'approved')
        );
    }

    public function test_rejected_result_includes_admin_note(): void
    {
        StudentRegistration::factory()->create([
            'student_name' => 'Anak Ditolak',
            'parent_contact' => '081234567890',
            'registration_no' => 'ALC-2026-00004',
            'status' => 'rejected',
            'admin_note' => 'Kuota penuh.',
            'rejected_at' => now(),
        ]);

        $response = $this->get(route('status.check', [
            'ticket' => 'ALC-2026-00004',
            'phone' => '081234567890',
        ]));

        $response->assertSuccessful();
        $response->assertInertia(fn ($page) => $page
            ->component('Public/StatusCheck', false)
            ->where('result.status', 'rejected')
            ->where('result.admin_note', 'Kuota penuh.')
        );
    }
}
