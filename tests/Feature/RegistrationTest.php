<?php

namespace Tests\Feature;

use App\Models\Program;
use App\Models\Role;
use App\Models\StudentRegistration;
use App\Models\TeacherRegistration;
use App\Models\User;
use App\Support\PermissionCatalog;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class RegistrationTest extends TestCase
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

    public function test_public_registration_page_displays_active_programs(): void
    {
        Program::create([
            'name' => 'Reguler',
            'level' => 'SMP',
            'is_active' => true,
        ]);

        Program::create([
            'name' => 'Nonaktif',
            'level' => 'SD',
            'is_active' => false,
        ]);

        $response = $this->get(route('register'));

        $response->assertSuccessful();
        $response->assertInertia(fn ($page) => $page
            ->component('Public/Register', false)
            ->has('programs', 1)
            ->where('programs.0.name', 'Reguler')
        );
    }

    // ── Student Registration ───────────────────────────────────────

    public function test_student_registration_stores_successfully(): void
    {
        $program = Program::create([
            'name' => 'Reguler',
            'level' => 'SMP',
            'is_active' => true,
        ]);

        $payload = [
            'student_name' => 'Ahmad Fauzi',
            'address' => 'Jl. Merdeka No. 10',
            'school_name' => 'SMP Negeri 1',
            'level' => 'SMP',
            'subjects' => 'Matematika',
            'program_id' => $program->id,
            'package' => '8 Sesi/Bulan',
            'parent_contact' => '081234567890',
            'preferred_mode' => 'Online',
            'notes' => 'Catatan test',
        ];

        $response = $this->post(route('registrations.student'), $payload);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('student_registrations', [
            'student_name' => 'Ahmad Fauzi',
            'level' => 'SMP',
            'program_id' => $program->id,
            'program' => 'Reguler',
            'package' => '8 Sesi/Bulan',
        ]);
    }

    public function test_student_registration_requires_mandatory_fields(): void
    {
        $response = $this->post(route('registrations.student'), []);

        $response->assertSessionHasErrors([
            'student_name',
            'address',
            'school_name',
            'level',
            'subjects',
            'program_id',
            'package',
            'parent_contact',
        ]);
    }

    public function test_student_registration_allows_nullable_fields(): void
    {
        $program = Program::create([
            'name' => 'Privat',
            'level' => 'SD',
            'is_active' => true,
        ]);

        $payload = [
            'student_name' => 'Budi',
            'address' => 'Jl. Test',
            'school_name' => 'SD Test',
            'level' => 'SD',
            'subjects' => 'IPA',
            'program_id' => $program->id,
            'package' => '12 Sesi/Bulan',
            'parent_contact' => '0812345',
            'preferred_mode' => null,
            'notes' => null,
        ];

        $response = $this->post(route('registrations.student'), $payload);

        $response->assertRedirect();
        $this->assertDatabaseHas('student_registrations', [
            'student_name' => 'Budi',
            'preferred_mode' => null,
            'notes' => null,
        ]);
    }

    // ── Teacher Registration ───────────────────────────────────────

    public function test_teacher_registration_stores_successfully(): void
    {
        Storage::fake('public');

        $payload = [
            'name' => 'Siti Aminah',
            'address' => 'Jl. Guru No. 5',
            'education' => 'S1 Pendidikan Matematika',
            'subjects' => 'Matematika',
            'experience' => '5 tahun mengajar',
            'contact' => '081298765432',
            'cv' => UploadedFile::fake()->create('cv.pdf', 100, 'application/pdf'),
            'notes' => 'Catatan pengajar',
        ];

        $response = $this->post(route('registrations.teacher'), $payload);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('teacher_registrations', [
            'name' => 'Siti Aminah',
            'education' => 'S1 Pendidikan Matematika',
        ]);

        $teacher = TeacherRegistration::where('name', 'Siti Aminah')->first();
        $this->assertNotNull($teacher->cv_path);
        Storage::disk('public')->assertExists($teacher->cv_path);
    }

    public function test_teacher_registration_requires_mandatory_fields(): void
    {
        $response = $this->post(route('registrations.teacher'), []);

        $response->assertSessionHasErrors([
            'name',
            'address',
            'education',
            'subjects',
            'contact',
            'cv',
        ]);
    }

    public function test_teacher_registration_rejects_invalid_cv_format(): void
    {
        $payload = [
            'name' => 'Test',
            'address' => 'Test',
            'education' => 'S1',
            'subjects' => 'Math',
            'contact' => '08123',
            'cv' => UploadedFile::fake()->create('cv.txt', 100, 'text/plain'),
        ];

        $response = $this->post(route('registrations.teacher'), $payload);

        $response->assertSessionHasErrors('cv');
    }

    // ── Admin Pendaftaran Page ─────────────────────────────────────

    public function test_admin_registrations_page_displays_student_registrations(): void
    {
        $user = $this->actingAsAdmin();
        $registration = StudentRegistration::factory()->create([
            'student_name' => 'Test Student',
        ]);

        $response = $this->actingAs($user, PermissionCatalog::GUARD)->get(route('admin.registrations'));

        $response->assertSuccessful();
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Registrations', false)
            ->has('studentRegistrations', 1)
            ->where('studentRegistrations.0.student_name', 'Test Student')
        );
    }

    public function test_admin_registrations_page_displays_teacher_registrations(): void
    {
        $user = $this->actingAsAdmin();
        TeacherRegistration::factory()->create(['name' => 'Test Teacher']);

        $response = $this->actingAs($user, PermissionCatalog::GUARD)->get(route('admin.registrations'));

        $response->assertSuccessful();
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Registrations', false)
            ->has('teacherRegistrations', 1)
            ->where('teacherRegistrations.0.name', 'Test Teacher')
        );
    }

    public function test_admin_student_registrations_menu_defaults_to_student_tab(): void
    {
        $user = $this->actingAsAdmin();
        StudentRegistration::factory()->create(['student_name' => 'Student Menu']);

        $response = $this->actingAs($user, PermissionCatalog::GUARD)->get(route('admin.registrations.students'));

        $response->assertSuccessful();
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Registrations', false)
            ->where('initialTab', 'student')
            ->has('studentRegistrations', 1)
        );
    }

    public function test_admin_teacher_registrations_menu_defaults_to_teacher_tab(): void
    {
        $user = $this->actingAsAdmin();
        TeacherRegistration::factory()->create(['name' => 'Teacher Menu']);

        $response = $this->actingAs($user, PermissionCatalog::GUARD)->get(route('admin.registrations.teachers'));

        $response->assertSuccessful();
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Registrations', false)
            ->where('initialTab', 'teacher')
            ->has('teacherRegistrations', 1)
        );
    }

    public function test_admin_registrations_page_includes_rejection_metadata(): void
    {
        $user = $this->actingAsAdmin();
        $rejector = User::factory()->create();

        StudentRegistration::factory()->create([
            'student_name' => 'Rejected Student',
            'status' => 'rejected',
            'rejected_at' => now(),
            'rejected_by' => $rejector->id,
        ]);

        TeacherRegistration::factory()->create([
            'name' => 'Rejected Teacher',
            'status' => 'rejected',
            'rejected_at' => now(),
            'rejected_by' => $rejector->id,
        ]);

        $response = $this->actingAs($user, PermissionCatalog::GUARD)->get(route('admin.registrations'));

        $response->assertSuccessful();
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Registrations', false)
            ->where('studentRegistrations.0.rejected_by_name', $rejector->name)
            ->where('teacherRegistrations.0.rejected_by_name', $rejector->name)
        );
    }

    public function test_admin_registrations_page_requires_auth(): void
    {
        $response = $this->get(route('admin.registrations'));

        $response->assertRedirect(route('login'));
    }

    // ── Approve / Reject / Delete ────────────────────────────────

    public function test_approve_student_creates_student_record(): void
    {
        $user = $this->actingAsAdmin();
        $reg = StudentRegistration::factory()->create([
            'student_name' => 'Anak Pintar',
            'status' => 'pending',
        ]);

        $response = $this->actingAs($user, PermissionCatalog::GUARD)->post(route('admin.registrations.student.approve', $reg));

        $response->assertRedirect();
        $this->assertDatabaseHas('student_registrations', [
            'id' => $reg->id,
            'status' => 'approved',
            'approved_by' => $user->id,
        ]);
        $this->assertNotNull($reg->fresh()->approved_at);
        $this->assertDatabaseHas('students', ['name' => 'Anak Pintar', 'is_active' => true, 'created_by' => $user->id]);
    }

    public function test_reject_student_updates_status(): void
    {
        $user = $this->actingAsAdmin();
        $reg = StudentRegistration::factory()->create(['status' => 'pending']);

        $response = $this->actingAs($user, PermissionCatalog::GUARD)->post(route('admin.registrations.student.reject', $reg));

        $response->assertRedirect();
        $this->assertDatabaseHas('student_registrations', [
            'id' => $reg->id,
            'status' => 'rejected',
            'rejected_by' => $user->id,
        ]);
        $this->assertNotNull($reg->fresh()->rejected_at);
    }

    public function test_delete_student_registration(): void
    {
        $user = $this->actingAsAdmin();
        $reg = StudentRegistration::factory()->create();

        $response = $this->actingAs($user, PermissionCatalog::GUARD)->delete(route('admin.registrations.student.destroy', $reg));

        $response->assertRedirect();
        $this->assertDatabaseMissing('student_registrations', ['id' => $reg->id]);
    }

    public function test_approve_teacher_creates_teacher_record(): void
    {
        $user = $this->actingAsAdmin();
        $reg = TeacherRegistration::factory()->create(['name' => 'Guru Hebat', 'status' => 'pending']);

        $response = $this->actingAs($user, PermissionCatalog::GUARD)->post(route('admin.registrations.teacher.approve', $reg));

        $response->assertRedirect();
        $this->assertDatabaseHas('teacher_registrations', [
            'id' => $reg->id,
            'status' => 'approved',
            'approved_by' => $user->id,
        ]);
        $this->assertNotNull($reg->fresh()->approved_at);
        $this->assertDatabaseHas('teachers', ['name' => 'Guru Hebat', 'is_active' => true, 'created_by' => $user->id]);
    }

    public function test_reject_teacher_updates_status(): void
    {
        $user = $this->actingAsAdmin();
        $reg = TeacherRegistration::factory()->create(['status' => 'pending']);

        $response = $this->actingAs($user, PermissionCatalog::GUARD)->post(route('admin.registrations.teacher.reject', $reg));

        $response->assertRedirect();
        $this->assertDatabaseHas('teacher_registrations', [
            'id' => $reg->id,
            'status' => 'rejected',
            'rejected_by' => $user->id,
        ]);
        $this->assertNotNull($reg->fresh()->rejected_at);
    }

    public function test_delete_teacher_registration(): void
    {
        $user = $this->actingAsAdmin();
        $reg = TeacherRegistration::factory()->create();

        $response = $this->actingAs($user, PermissionCatalog::GUARD)->delete(route('admin.registrations.teacher.destroy', $reg));

        $response->assertRedirect();
        $this->assertDatabaseMissing('teacher_registrations', ['id' => $reg->id]);
    }
}
