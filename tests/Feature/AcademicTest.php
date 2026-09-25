<?php

namespace Tests\Feature;

use App\Models\Attendance;
use App\Models\ClassGroup;
use App\Models\Grade;
use App\Models\Invoice;
use App\Models\Program;
use App\Models\Role;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\User;
use App\Support\PermissionCatalog;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AcademicTest extends TestCase
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

    private function makeProgram(string $name = 'Reguler'): Program
    {
        return Program::create([
            'name' => $name,
            'level' => 'SMP',
            'is_active' => true,
        ]);
    }

    private function makeStudent(Program $program, string $name = 'Anak Kelas'): Student
    {
        return Student::create([
            'name' => $name,
            'program_id' => $program->id,
            'program' => $program->name,
            'parent_contact' => '081234567890',
            'is_active' => true,
        ]);
    }

    private function makePaid(Student $student): void
    {
        Invoice::create([
            'invoice_no' => 'INV-2026-'.str_pad((string) $student->id, 5, '0', STR_PAD_LEFT),
            'student_id' => $student->id,
            'amount' => 350000,
            'status' => 'paid',
            'paid_at' => now(),
        ]);
    }

    private function makeClass(Program $program, ?Teacher $teacher = null, ?int $quota = null): ClassGroup
    {
        return ClassGroup::create([
            'program_id' => $program->id,
            'teacher_id' => $teacher?->id,
            'name' => 'Kelas A',
            'quota' => $quota,
            'is_active' => true,
        ]);
    }

    public function test_academic_page_renders(): void
    {
        $user = $this->actingAsAdmin();

        $response = $this->actingAs($user, PermissionCatalog::GUARD)->get(route('admin.academic'));

        $response->assertSuccessful();
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Academic', false)
            ->has('classes')
            ->has('programs')
            ->has('teachers')
            ->has('students')
        );
    }

    public function test_add_member_requires_paid_invoice(): void
    {
        $user = $this->actingAsAdmin();
        $program = $this->makeProgram();
        $class = $this->makeClass($program);
        $student = $this->makeStudent($program);

        $response = $this->actingAs($user, PermissionCatalog::GUARD)->post(
            route('admin.academic.members.store', $class),
            ['student_ids' => [$student->id]]
        );

        $response->assertRedirect();
        $this->assertDatabaseMissing('class_members', [
            'class_group_id' => $class->id,
            'student_id' => $student->id,
        ]);
    }

    public function test_add_member_with_scholarship_bypasses_paid_check(): void
    {
        $user = $this->actingAsAdmin();
        $program = $this->makeProgram();
        $class = $this->makeClass($program);
        $student = $this->makeStudent($program);

        $response = $this->actingAs($user, PermissionCatalog::GUARD)->post(
            route('admin.academic.members.store', $class),
            ['student_ids' => [$student->id], 'is_scholarship' => true]
        );

        $response->assertRedirect();
        $this->assertDatabaseHas('class_members', [
            'class_group_id' => $class->id,
            'student_id' => $student->id,
            'status' => 'active',
            'is_scholarship' => true,
        ]);
    }

    public function test_student_cannot_join_two_active_classes_same_program(): void
    {
        $user = $this->actingAsAdmin();
        $program = $this->makeProgram();
        $classA = $this->makeClass($program);
        $classB = ClassGroup::create([
            'program_id' => $program->id,
            'name' => 'Kelas B',
            'is_active' => true,
        ]);
        $student = $this->makeStudent($program);
        $this->makePaid($student);

        $this->actingAs($user, PermissionCatalog::GUARD)->post(
            route('admin.academic.members.store', $classA),
            ['student_ids' => [$student->id]]
        );

        $this->actingAs($user, PermissionCatalog::GUARD)->post(
            route('admin.academic.members.store', $classB),
            ['student_ids' => [$student->id]]
        );

        $this->assertDatabaseMissing('class_members', [
            'class_group_id' => $classB->id,
            'student_id' => $student->id,
        ]);
    }

    public function test_class_quota_is_enforced(): void
    {
        $user = $this->actingAsAdmin();
        $program = $this->makeProgram();
        $class = $this->makeClass($program, null, 1);
        $first = $this->makeStudent($program, 'Anak Satu');
        $second = $this->makeStudent($program, 'Anak Dua');
        $this->makePaid($first);
        $this->makePaid($second);

        $this->actingAs($user, PermissionCatalog::GUARD)->post(
            route('admin.academic.members.store', $class),
            ['student_ids' => [$first->id]]
        );
        $this->actingAs($user, PermissionCatalog::GUARD)->post(
            route('admin.academic.members.store', $class),
            ['student_ids' => [$second->id]]
        );

        $this->assertDatabaseHas('class_members', [
            'class_group_id' => $class->id,
            'student_id' => $first->id,
        ]);
        $this->assertDatabaseMissing('class_members', [
            'class_group_id' => $class->id,
            'student_id' => $second->id,
        ]);
    }

    public function test_teacher_schedule_clash_is_blocked(): void
    {
        $user = $this->actingAsAdmin();
        $program = $this->makeProgram();
        $teacher = Teacher::create(['name' => 'Guru Bentrok', 'is_active' => true]);
        $classA = $this->makeClass($program, $teacher);
        $classB = ClassGroup::create([
            'program_id' => $program->id,
            'teacher_id' => $teacher->id,
            'name' => 'Kelas B',
            'is_active' => true,
        ]);

        $this->actingAs($user, PermissionCatalog::GUARD)->post(
            route('admin.academic.schedules.store', $classA),
            ['day_of_week' => 1, 'start_time' => '16:00', 'end_time' => '17:30']
        );

        $response = $this->actingAs($user, PermissionCatalog::GUARD)->post(
            route('admin.academic.schedules.store', $classB),
            ['day_of_week' => 1, 'start_time' => '17:00', 'end_time' => '18:30']
        );

        $response->assertSessionHas('error');
        $this->assertDatabaseMissing('schedules', ['class_group_id' => $classB->id]);

        $ok = $this->actingAs($user, PermissionCatalog::GUARD)->post(
            route('admin.academic.schedules.store', $classB),
            ['day_of_week' => 2, 'start_time' => '17:00', 'end_time' => '18:30']
        );

        $ok->assertSessionHas('success');
        $this->assertDatabaseHas('schedules', ['class_group_id' => $classB->id, 'day_of_week' => 2]);
    }

    public function test_attendance_upserts_per_date(): void
    {
        $user = $this->actingAsAdmin();
        $program = $this->makeProgram();
        $class = $this->makeClass($program);
        $student = $this->makeStudent($program);
        $this->makePaid($student);

        $this->actingAs($user, PermissionCatalog::GUARD)->post(
            route('admin.academic.members.store', $class),
            ['student_ids' => [$student->id]]
        );

        $payload = [
            'date' => now()->toDateString(),
            'rows' => [['student_id' => $student->id, 'status' => 'hadir']],
        ];

        $this->actingAs($user, PermissionCatalog::GUARD)->post(route('admin.academic.attendance.store', $class), $payload);
        $this->actingAs($user, PermissionCatalog::GUARD)->post(route('admin.academic.attendance.store', $class), [
            'date' => now()->toDateString(),
            'rows' => [['student_id' => $student->id, 'status' => 'sakit']],
        ]);

        $this->assertEquals(1, Attendance::query()
            ->where('class_group_id', $class->id)
            ->where('student_id', $student->id)
            ->count());
        $this->assertEquals('sakit', Attendance::query()
            ->where('class_group_id', $class->id)
            ->where('student_id', $student->id)
            ->first()->status);
    }

    public function test_attendance_rejects_non_member(): void
    {
        $user = $this->actingAsAdmin();
        $program = $this->makeProgram();
        $class = $this->makeClass($program);
        $outsider = $this->makeStudent($program, 'Anak Luar');

        $response = $this->actingAs($user, PermissionCatalog::GUARD)->post(
            route('admin.academic.attendance.store', $class),
            [
                'date' => now()->toDateString(),
                'rows' => [['student_id' => $outsider->id, 'status' => 'hadir']],
            ]
        );

        $response->assertSessionHas('error');
        $this->assertEquals(0, Attendance::query()->count());
    }

    public function test_grades_upsert_and_validate_range(): void
    {
        $user = $this->actingAsAdmin();
        $program = $this->makeProgram();
        $class = $this->makeClass($program);
        $student = $this->makeStudent($program);
        $this->makePaid($student);

        $this->actingAs($user, PermissionCatalog::GUARD)->post(
            route('admin.academic.members.store', $class),
            ['student_ids' => [$student->id]]
        );

        $payload = [
            'subject' => 'Matematika',
            'term' => 'UTS Ganjil',
            'rows' => [['student_id' => $student->id, 'score' => 85]],
        ];

        $this->actingAs($user, PermissionCatalog::GUARD)->post(route('admin.academic.grades.store', $class), $payload);
        $this->actingAs($user, PermissionCatalog::GUARD)->post(route('admin.academic.grades.store', $class), [
            'subject' => 'Matematika',
            'term' => 'UTS Ganjil',
            'rows' => [['student_id' => $student->id, 'score' => 90]],
        ]);

        $this->assertEquals(1, Grade::query()->count());
        $this->assertEquals(90, (int) Grade::query()->first()->score);

        $bad = $this->actingAs($user, PermissionCatalog::GUARD)->post(route('admin.academic.grades.store', $class), [
            'subject' => 'Matematika',
            'term' => 'UTS Ganjil',
            'rows' => [['student_id' => $student->id, 'score' => 150]],
        ]);

        $bad->assertSessionHasErrors('rows.0.score');
    }

    public function test_export_members_csv_downloads(): void
    {
        $user = $this->actingAsAdmin();
        $program = $this->makeProgram();
        $class = $this->makeClass($program);
        $student = $this->makeStudent($program);
        $this->makePaid($student);

        $this->actingAs($user, PermissionCatalog::GUARD)->post(
            route('admin.academic.members.store', $class),
            ['student_ids' => [$student->id]]
        );

        $response = $this->actingAs($user, PermissionCatalog::GUARD)->get(
            route('admin.academic.export', [$class, 'members'])
        );

        $response->assertSuccessful();
        $this->assertStringContainsString('text/csv', $response->headers->get('Content-Type'));
        $this->assertStringContainsString('Anak Kelas', $response->streamedContent());
    }
}
