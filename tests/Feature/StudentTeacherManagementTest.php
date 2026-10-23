<?php

namespace Tests\Feature;

use App\Models\EducationLevel;
use App\Models\Program;
use App\Models\Role;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\User;
use App\Support\PermissionCatalog;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class StudentTeacherManagementTest extends TestCase
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

    public function test_admin_can_update_student(): void
    {
        $user = $this->actingAsAdmin();
        $program = Program::create([
            'name' => 'Reguler',
            'level' => 'SMP',
            'is_active' => true,
        ]);

        $student = Student::create([
            'name' => 'Murid Lama',
            'level' => 'SMP',
            'program' => 'Lama',
            'is_active' => true,
        ]);

        $payload = [
            'name' => 'Murid Baru',
            'address' => 'Jl. Baru',
            'school_name' => 'SMP 1',
            'level' => 'SMP',
            'subjects' => 'Matematika',
            'program_id' => $program->id,
            'package' => '8 Pertemuan',
            'parent_contact' => '081234',
            'parent_email' => 'wali@example.com',
            'preferred_mode' => 'Online',
            'notes' => 'Catatan',
            'is_active' => true,
        ];

        $response = $this->actingAs($user, PermissionCatalog::GUARD)
            ->put(route('admin.students.update', $student), $payload);

        $response->assertRedirect();
        $this->assertDatabaseHas('students', [
            'id' => $student->id,
            'name' => 'Murid Baru',
            'parent_email' => 'wali@example.com',
            'program_id' => $program->id,
            'program' => 'Reguler',
            'updated_by' => $user->id,
        ]);
    }

    public function test_admin_can_soft_delete_student(): void
    {
        $user = $this->actingAsAdmin();
        $student = Student::create([
            'name' => 'Murid Nonaktif',
            'level' => 'SMP',
            'program' => 'Reguler',
            'is_active' => true,
        ]);

        $response = $this->actingAs($user, PermissionCatalog::GUARD)
            ->delete(route('admin.students.destroy', $student));

        $response->assertRedirect();
        $this->assertDatabaseHas('students', [
            'id' => $student->id,
            'is_active' => false,
            'updated_by' => $user->id,
        ]);
    }

    public function test_admin_can_create_teacher(): void
    {
        $user = $this->actingAsAdmin();
        Storage::fake('public');

        $payload = [
            'name' => 'Ustadzah Hana',
            'email' => 'hana@example.com',
            'address' => 'Jl. Mawar',
            'education' => 'S1',
            'subjects' => 'Matematika',
            'experience' => '2 tahun',
            'contact' => '081234567890',
            'cv' => UploadedFile::fake()->create('cv.pdf', 120, 'application/pdf'),
            'notes' => 'Catatan',
            'is_active' => true,
            'temporary_password' => 'Sementara123',
            'temporary_password_confirmation' => 'Sementara123',
        ];

        $response = $this->actingAs($user, PermissionCatalog::GUARD)
            ->post(route('admin.teachers.store'), $payload);

        $response->assertRedirect();
        $this->assertDatabaseHas('teachers', [
            'name' => 'Ustadzah Hana',
            'created_by' => $user->id,
        ]);
        $teacher = Teacher::where('name', 'Ustadzah Hana')->first();
        $this->assertNotNull($teacher?->cv_path);
        Storage::disk('public')->assertExists($teacher->cv_path);
    }

    public function test_admin_can_update_teacher(): void
    {
        $user = $this->actingAsAdmin();
        Storage::fake('public');
        $teacher = Teacher::create([
            'name' => 'Guru Lama',
            'subjects' => 'IPA',
            'is_active' => true,
        ]);

        $payload = [
            'name' => 'Guru Baru',
            'subjects' => 'Matematika',
            'cv' => UploadedFile::fake()->create('new-cv.pdf', 80, 'application/pdf'),
            'is_active' => false,
        ];

        $response = $this->actingAs($user, PermissionCatalog::GUARD)
            ->put(route('admin.teachers.update', $teacher), $payload);

        $response->assertRedirect();
        $this->assertDatabaseHas('teachers', [
            'id' => $teacher->id,
            'name' => 'Guru Baru',
            'is_active' => false,
            'updated_by' => $user->id,
        ]);
        $teacher->refresh();
        $this->assertNotNull($teacher->cv_path);
        Storage::disk('public')->assertExists($teacher->cv_path);
    }

    public function test_admin_can_soft_delete_teacher(): void
    {
        $user = $this->actingAsAdmin();
        $teacher = Teacher::create([
            'name' => 'Guru Nonaktif',
            'subjects' => 'IPA',
            'is_active' => true,
        ]);

        $response = $this->actingAs($user, PermissionCatalog::GUARD)
            ->delete(route('admin.teachers.destroy', $teacher));

        $response->assertRedirect();
        $this->assertDatabaseHas('teachers', [
            'id' => $teacher->id,
            'is_active' => false,
            'updated_by' => $user->id,
        ]);
    }

    public function test_admin_can_view_students_list_with_email(): void
    {
        $user = $this->actingAsAdmin();
        Student::create([
            'name' => 'Murid Email',
            'level' => 'SD',
            'program' => 'Reguler',
            'parent_email' => 'ortu.murid@example.com',
            'is_active' => true,
        ]);

        $response = $this->actingAs($user, PermissionCatalog::GUARD)
            ->get(route('admin.students'));

        $response->assertSuccessful();
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Students', false)
            ->where('students.0.parent_email', 'ortu.murid@example.com')
        );
    }

    public function test_admin_teacher_form_uses_master_levels_and_distinct_education_options(): void
    {
        $user = $this->actingAsAdmin();

        EducationLevel::query()->update(['is_active' => false]);
        EducationLevel::query()->updateOrCreate(['name' => 'SMP / MTs'], ['sort_order' => 30, 'is_active' => true]);
        EducationLevel::query()->updateOrCreate(['name' => 'SD / MI'], ['sort_order' => 20, 'is_active' => true]);
        EducationLevel::query()->create(['name' => 'Jenjang Nonaktif', 'sort_order' => 10, 'is_active' => false]);

        Teacher::query()->create(['name' => 'Guru S2', 'education' => 'S2 Pendidikan', 'subjects' => 'IPA']);
        Teacher::query()->create(['name' => 'Guru S1', 'education' => 'S1 Pendidikan', 'subjects' => 'Matematika']);
        Teacher::query()->create(['name' => 'Guru S1 Lain', 'education' => 'S1 Pendidikan', 'subjects' => 'Bahasa Inggris']);

        $response = $this->actingAs($user, PermissionCatalog::GUARD)
            ->get(route('admin.teachers'));

        $response->assertSuccessful();
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Teachers', false)
            ->where('teacherLevelOptions', ['SD / MI', 'SMP / MTs'])
            ->where('educationOptions', ['S1 Pendidikan', 'S2 Pendidikan'])
        );
    }
}
