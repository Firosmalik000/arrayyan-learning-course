<?php

namespace Tests\Feature;

use App\Models\Attendance;
use App\Models\ClassGroup;
use App\Models\ClassMember;
use App\Models\Grade;
use App\Models\Invoice;
use App\Models\Package;
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

    public function test_add_member_allows_payment_after_joining_class(): void
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
        $this->assertDatabaseHas('class_members', [
            'class_group_id' => $class->id,
            'student_id' => $student->id,
            'status' => 'active',
            'is_scholarship' => false,
        ]);
    }

    public function test_add_member_records_scholarship_status(): void
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
            'subject' => 'Matematika',
            'material' => 'Penjumlahan dua angka',
            'rows' => [[
                'student_id' => $student->id,
                'status' => 'hadir',
                'understanding_score' => 4,
                'evaluation' => 'Murid mampu menyelesaikan latihan secara mandiri.',
            ]],
        ];

        $this->actingAs($user, PermissionCatalog::GUARD)->post(route('admin.academic.attendance.store', $class), $payload);
        $this->assertDatabaseHas('attendances', [
            'class_group_id' => $class->id,
            'student_id' => $student->id,
            'subject' => 'Matematika',
            'material' => 'Penjumlahan dua angka',
            'understanding_score' => 4,
            'evaluation' => 'Murid mampu menyelesaikan latihan secara mandiri.',
        ]);

        $this->actingAs($user, PermissionCatalog::GUARD)->post(route('admin.academic.attendance.store', $class), [
            'date' => now()->toDateString(),
            'subject' => 'Matematika',
            'material' => 'Penjumlahan dua angka',
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
        $this->assertNull(Attendance::query()->first()->understanding_score);
        $this->assertNull(Attendance::query()->first()->evaluation);
    }

    public function test_present_attendance_requires_understanding_score_and_evaluation(): void
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

        $response = $this->actingAs($user, PermissionCatalog::GUARD)->post(
            route('admin.academic.attendance.store', $class),
            [
                'date' => now()->toDateString(),
                'subject' => 'Bahasa Inggris',
                'material' => 'Kosakata benda sehari-hari',
                'rows' => [['student_id' => $student->id, 'status' => 'hadir']],
            ]
        );

        $response->assertSessionHasErrors([
            'rows.0.understanding_score',
            'rows.0.evaluation',
        ]);
        $this->assertDatabaseCount('attendances', 0);
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
                'subject' => 'Matematika',
                'material' => 'Penjumlahan',
                'rows' => [[
                    'student_id' => $outsider->id,
                    'status' => 'hadir',
                    'understanding_score' => 3,
                    'evaluation' => 'Cukup memahami materi.',
                ]],
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

    public function test_academic_page_passes_program_quota(): void
    {
        $user = $this->actingAsAdmin();
        $program = Program::create([
            'name' => 'Program Kuota',
            'level' => 'SMA',
            'quota' => 25,
            'is_active' => true,
        ]);

        $response = $this->actingAs($user, PermissionCatalog::GUARD)->get(route('admin.academic'));

        $response->assertSuccessful();
        $response->assertInertia(fn ($page) => $page
            ->has('programs.0.quota')
        );
    }

    public function test_store_class_saves_quota_without_room(): void
    {
        $user = $this->actingAsAdmin();
        $program = $this->makeProgram();
        $teacher = Teacher::create(['name' => 'Guru Kelas', 'is_active' => true]);

        $response = $this->actingAs($user, PermissionCatalog::GUARD)->post(route('admin.academic.classes.store'), [
            'program_id' => $program->id,
            'teacher_id' => $teacher->id,
            'name' => 'Kelas Baru',
            'quota' => 15,
            'is_active' => true,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('class_groups', [
            'program_id' => $program->id,
            'teacher_id' => $teacher->id,
            'name' => 'Kelas Baru',
            'quota' => 15,
        ]);
    }

    public function test_active_class_requires_a_teacher(): void
    {
        $user = $this->actingAsAdmin();
        $program = $this->makeProgram();

        $response = $this->actingAs($user, PermissionCatalog::GUARD)->post(route('admin.academic.classes.store'), [
            'program_id' => $program->id,
            'name' => 'Kelas Tanpa Guru',
            'quota' => 15,
            'is_active' => true,
        ]);

        $response->assertSessionHasErrors([
            'teacher_id' => 'Pengajar wajib dipilih untuk kelas aktif.',
        ]);
        $this->assertDatabaseMissing('class_groups', [
            'name' => 'Kelas Tanpa Guru',
        ]);
    }

    public function test_store_schedule_works_without_room(): void
    {
        $user = $this->actingAsAdmin();
        $program = $this->makeProgram();
        $class = $this->makeClass($program);

        $response = $this->actingAs($user, PermissionCatalog::GUARD)->post(route('admin.academic.schedules.store', $class), [
            'day_of_week' => 1,
            'start_time' => '08:00',
            'end_time' => '09:30',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('schedules', [
            'class_group_id' => $class->id,
            'day_of_week' => 1,
            'start_time' => '08:00',
            'end_time' => '09:30',
        ]);
    }

    public function test_store_class_saves_level_and_package_sessions(): void
    {
        $user = $this->actingAsAdmin();
        $program = $this->makeProgram();
        $teacher = Teacher::create(['name' => 'Guru Paket', 'is_active' => true]);
        $package = Package::create([
            'program_id' => $program->id,
            'name' => 'Paket SD 8 Sesi',
            'level' => 'SD',
            'sessions' => 8,
            'is_active' => true,
        ]);

        $response = $this->actingAs($user, PermissionCatalog::GUARD)->post(route('admin.academic.classes.store'), [
            'program_id' => $program->id,
            'teacher_id' => $teacher->id,
            'level' => 'SD',
            'package_id' => $package->id,
            'name' => 'Kelas SD 8 Sesi',
            'quota' => 10,
            'is_active' => true,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('class_groups', [
            'program_id' => $program->id,
            'level' => 'SD',
            'package_id' => $package->id,
            'total_sessions' => 8,
            'name' => 'Kelas SD 8 Sesi',
        ]);
    }

    public function test_generate_sessions_creates_attendances_from_schedules(): void
    {
        $user = $this->actingAsAdmin();
        $program = $this->makeProgram();
        $class = $this->makeClass($program);
        $student = $this->makeStudent($program);
        $this->makePaid($student);

        // Add member
        $this->actingAs($user, PermissionCatalog::GUARD)->post(
            route('admin.academic.members.store', $class),
            ['student_ids' => [$student->id]]
        );

        // Add weekly schedule (Monday)
        $this->actingAs($user, PermissionCatalog::GUARD)->post(
            route('admin.academic.schedules.store', $class),
            ['day_of_week' => 1, 'start_time' => '16:00', 'end_time' => '17:30']
        );

        // Generate 4 sessions starting from Monday 2026-10-12
        $response = $this->actingAs($user, PermissionCatalog::GUARD)->post(
            route('admin.academic.sessions.generate', $class),
            ['start_date' => '2026-10-12', 'count' => 4]
        );

        $response->assertRedirect();
        $this->assertEquals(4, Attendance::query()->where('class_group_id', $class->id)->count());
        $this->assertEquals('belum_absen', Attendance::query()->where('class_group_id', $class->id)->first()->status);
    }

    public function test_generate_sessions_accepts_custom_dates_array(): void
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

        $response = $this->actingAs($user, PermissionCatalog::GUARD)->post(
            route('admin.academic.sessions.generate', $class),
            ['dates' => ['2026-10-15', '2026-10-22', '2026-10-29']]
        );

        $response->assertRedirect();
        $this->assertEquals(3, Attendance::query()->where('class_group_id', $class->id)->count());
        $this->assertEquals(
            ['2026-10-15', '2026-10-22', '2026-10-29'],
            Attendance::query()->where('class_group_id', $class->id)->orderBy('date')->pluck('date')->map(fn ($d) => substr((string) $d, 0, 10))->all()
        );
        $this->assertEquals('belum_absen', Attendance::query()->where('class_group_id', $class->id)->first()->status);
    }

    public function test_generate_sessions_reschedules_and_cleans_up_removed_unattended_dates(): void
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

        // Initial generation: 3 dates
        $this->actingAs($user, PermissionCatalog::GUARD)->post(
            route('admin.academic.sessions.generate', $class),
            ['dates' => ['2026-10-15', '2026-10-22', '2026-10-29']]
        );

        // Mark 2026-10-15 as hadir
        Attendance::query()->where('class_group_id', $class->id)->whereDate('date', '2026-10-15')->update(['status' => 'hadir']);

        // Now reschedule: replace 2026-10-29 with 2026-10-30, and remove 2026-10-22
        $this->actingAs($user, PermissionCatalog::GUARD)->post(
            route('admin.academic.sessions.generate', $class),
            ['dates' => ['2026-10-15', '2026-10-30']]
        );

        $dates = Attendance::query()->where('class_group_id', $class->id)->orderBy('date')->pluck('date')->map(fn ($d) => substr((string) $d, 0, 10))->all();
        $this->assertEquals(['2026-10-15', '2026-10-30'], $dates);
        $this->assertEquals('hadir', Attendance::query()->where('class_group_id', $class->id)->whereDate('date', '2026-10-15')->first()->status);
        $this->assertEquals('belum_absen', Attendance::query()->where('class_group_id', $class->id)->whereDate('date', '2026-10-30')->first()->status);
    }

    public function test_monthly_session_sync_edits_only_selected_month_and_preserves_recorded_attendance(): void
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

        Attendance::create([
            'class_group_id' => $class->id,
            'student_id' => $student->id,
            'date' => '2026-10-05',
            'status' => 'hadir',
        ]);
        Attendance::create([
            'class_group_id' => $class->id,
            'student_id' => $student->id,
            'date' => '2026-10-12',
            'status' => 'belum_absen',
        ]);
        Attendance::create([
            'class_group_id' => $class->id,
            'student_id' => $student->id,
            'date' => '2026-11-02',
            'status' => 'belum_absen',
        ]);

        $response = $this->actingAs($user, PermissionCatalog::GUARD)->post(
            route('admin.academic.sessions.generate', $class),
            [
                'month' => '2026-10',
                'dates' => ['2026-10-05', '2026-10-19'],
            ]
        );

        $response->assertSessionHas('success');
        $this->assertTrue(Attendance::query()
            ->where('class_group_id', $class->id)
            ->where('student_id', $student->id)
            ->whereDate('date', '2026-10-05')
            ->where('status', 'hadir')
            ->exists());
        $this->assertFalse(Attendance::query()
            ->where('class_group_id', $class->id)
            ->where('student_id', $student->id)
            ->whereDate('date', '2026-10-12')
            ->exists());
        $this->assertTrue(Attendance::query()
            ->where('class_group_id', $class->id)
            ->where('student_id', $student->id)
            ->whereDate('date', '2026-10-19')
            ->where('status', 'belum_absen')
            ->exists());
        $this->assertTrue(Attendance::query()
            ->where('class_group_id', $class->id)
            ->where('student_id', $student->id)
            ->whereDate('date', '2026-11-02')
            ->where('status', 'belum_absen')
            ->exists());
    }

    public function test_monthly_session_sync_rejects_dates_outside_selected_month(): void
    {
        $user = $this->actingAsAdmin();
        $program = $this->makeProgram();
        $class = $this->makeClass($program);

        $response = $this->actingAs($user, PermissionCatalog::GUARD)->post(
            route('admin.academic.sessions.generate', $class),
            [
                'month' => '2026-10',
                'dates' => ['2026-11-02'],
            ]
        );

        $response->assertSessionHasErrors('dates.0');
        $this->assertDatabaseCount('attendances', 0);
    }

    public function test_attendance_enforces_session_limit(): void
    {
        $user = $this->actingAsAdmin();
        $program = $this->makeProgram();
        $package = Package::create([
            'program_id' => $program->id,
            'name' => 'Paket 1 Sesi',
            'level' => 'SMP',
            'sessions' => 1,
            'is_active' => true,
        ]);

        $class = ClassGroup::create([
            'program_id' => $program->id,
            'package_id' => $package->id,
            'total_sessions' => 1,
            'name' => 'Kelas 1 Sesi',
            'is_active' => true,
        ]);

        $student = Student::create([
            'name' => 'Anak Limit',
            'program_id' => $program->id,
            'package_id' => $package->id,
            'is_active' => true,
        ]);
        $this->makePaid($student);

        $this->actingAs($user, PermissionCatalog::GUARD)->post(
            route('admin.academic.members.store', $class),
            ['student_ids' => [$student->id]]
        );

        // 1st attendance succeeds
        $res1 = $this->actingAs($user, PermissionCatalog::GUARD)->post(
            route('admin.academic.attendance.store', $class),
            [
                'date' => '2026-10-10',
                'subject' => 'Matematika',
                'material' => 'Penjumlahan',
                'rows' => [[
                    'student_id' => $student->id,
                    'status' => 'hadir',
                    'understanding_score' => 4,
                    'evaluation' => 'Memahami materi.',
                ]],
            ]
        );
        $res1->assertSessionHas('success');

        // 2nd attendance exceeds limit and fails
        $res2 = $this->actingAs($user, PermissionCatalog::GUARD)->post(
            route('admin.academic.attendance.store', $class),
            [
                'date' => '2026-10-11',
                'subject' => 'Matematika',
                'material' => 'Pengurangan',
                'rows' => [[
                    'student_id' => $student->id,
                    'status' => 'hadir',
                    'understanding_score' => 4,
                    'evaluation' => 'Memahami materi.',
                ]],
            ]
        );
        $res2->assertSessionHas('error');
    }

    public function test_member_period_generates_pending_attendance_from_weekly_schedule(): void
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
        $this->actingAs($user, PermissionCatalog::GUARD)->post(
            route('admin.academic.schedules.store', $class),
            ['day_of_week' => 1, 'start_time' => '16:00', 'end_time' => '17:30']
        );

        $member = ClassMember::query()->where('student_id', $student->id)->firstOrFail();
        $response = $this->actingAs($user, PermissionCatalog::GUARD)->post(
            route('admin.academic.members.periods.store', $member),
            [
                'start_date' => '2026-11-01',
                'end_date' => '2026-11-30',
                'session_limit' => 4,
                'notes' => 'Perpanjangan November',
            ]
        );

        $response->assertSessionHas('success');
        $this->assertDatabaseHas('class_member_periods', [
            'class_member_id' => $member->id,
            'session_limit' => 4,
        ]);
        $period = $member->periods()->firstOrFail();
        $this->assertSame('2026-11-01', $period->start_date->toDateString());
        $this->assertSame('2026-11-30', $period->end_date->toDateString());
        $this->assertEquals(
            ['2026-11-02', '2026-11-09', '2026-11-16', '2026-11-23'],
            Attendance::query()
                ->where('class_group_id', $class->id)
                ->where('student_id', $student->id)
                ->orderBy('date')
                ->pluck('date')
                ->map(fn ($date) => substr((string) $date, 0, 10))
                ->all()
        );
        $this->assertEquals(4, Attendance::query()->where('status', 'belum_absen')->count());
    }

    public function test_member_period_rejects_overlapping_date_ranges(): void
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
        $this->actingAs($user, PermissionCatalog::GUARD)->post(
            route('admin.academic.schedules.store', $class),
            ['day_of_week' => 1, 'start_time' => '16:00', 'end_time' => '17:30']
        );
        $member = ClassMember::query()->where('student_id', $student->id)->firstOrFail();

        $this->actingAs($user, PermissionCatalog::GUARD)->post(
            route('admin.academic.members.periods.store', $member),
            ['start_date' => '2026-11-01', 'end_date' => '2026-11-30', 'session_limit' => 4]
        );
        $response = $this->actingAs($user, PermissionCatalog::GUARD)->post(
            route('admin.academic.members.periods.store', $member),
            ['start_date' => '2026-11-15', 'end_date' => '2026-12-15', 'session_limit' => 4]
        );

        $response->assertSessionHasErrors('start_date');
        $this->assertDatabaseCount('class_member_periods', 1);
    }

    public function test_new_period_resets_attendance_session_limit_without_new_class_registration(): void
    {
        $user = $this->actingAsAdmin();
        $program = $this->makeProgram();
        $package = Package::create([
            'program_id' => $program->id,
            'name' => 'Paket Bulanan 1 Sesi',
            'level' => 'SMP',
            'sessions' => 1,
            'is_active' => true,
        ]);
        $class = ClassGroup::create([
            'program_id' => $program->id,
            'package_id' => $package->id,
            'total_sessions' => 1,
            'name' => 'Kelas Lanjutan',
            'is_active' => true,
        ]);
        $student = Student::create([
            'name' => 'Anak Berlanjut',
            'program_id' => $program->id,
            'package_id' => $package->id,
            'is_active' => true,
        ]);
        $this->makePaid($student);

        $this->actingAs($user, PermissionCatalog::GUARD)->post(
            route('admin.academic.members.store', $class),
            ['student_ids' => [$student->id]]
        );
        $this->actingAs($user, PermissionCatalog::GUARD)->post(
            route('admin.academic.schedules.store', $class),
            ['day_of_week' => 1, 'start_time' => '16:00', 'end_time' => '17:30']
        );
        $member = ClassMember::query()->where('student_id', $student->id)->firstOrFail();

        foreach ([
            ['start_date' => '2026-10-01', 'end_date' => '2026-10-31'],
            ['start_date' => '2026-11-01', 'end_date' => '2026-11-30'],
        ] as $period) {
            $this->actingAs($user, PermissionCatalog::GUARD)->post(
                route('admin.academic.members.periods.store', $member),
                [...$period, 'session_limit' => 1]
            )->assertSessionHas('success');
        }

        foreach (['2026-10-05', '2026-11-02'] as $date) {
            $this->actingAs($user, PermissionCatalog::GUARD)->post(
                route('admin.academic.attendance.store', $class),
                [
                    'date' => $date,
                    'subject' => 'Matematika',
                    'material' => 'Latihan berkala',
                    'rows' => [[
                        'student_id' => $student->id,
                        'status' => 'hadir',
                        'understanding_score' => 4,
                        'evaluation' => 'Memahami materi.',
                    ]],
                ]
            )->assertSessionHas('success');
        }

        $this->assertDatabaseCount('class_members', 1);
        $this->assertDatabaseCount('class_member_periods', 2);
        $this->assertEquals(2, Attendance::query()->where('status', 'hadir')->count());
    }

    public function test_completing_class_membership_keeps_student_active_and_preserves_history_by_default(): void
    {
        $user = $this->actingAsAdmin();
        $program = $this->makeProgram();
        $class = $this->makeClass($program);
        $student = $this->makeStudent($program);
        $member = ClassMember::create([
            'class_group_id' => $class->id,
            'student_id' => $student->id,
            'status' => ClassMember::STATUS_ACTIVE,
            'joined_at' => '2026-10-01',
        ]);
        $member->periods()->create([
            'start_date' => '2026-10-01',
            'end_date' => '2026-10-31',
            'session_limit' => 4,
        ]);
        Attendance::create([
            'class_group_id' => $class->id,
            'student_id' => $student->id,
            'date' => '2026-10-05',
            'status' => 'hadir',
        ]);

        $response = $this->actingAs($user, PermissionCatalog::GUARD)->patch(
            route('admin.academic.members.complete', $member),
            ['deactivate_student' => false],
        );

        $response->assertSessionHas('success');
        $this->assertDatabaseHas('class_members', [
            'id' => $member->id,
            'status' => ClassMember::STATUS_GRADUATED,
        ]);
        $this->assertTrue($student->fresh()->is_active);
        $this->assertDatabaseCount('class_member_periods', 1);
        $this->assertDatabaseCount('attendances', 1);
    }

    public function test_member_with_invoice_history_cannot_be_deleted(): void
    {
        $user = $this->actingAsAdmin();
        $program = $this->makeProgram();
        $class = $this->makeClass($program);
        $student = $this->makeStudent($program);
        $member = ClassMember::create([
            'class_group_id' => $class->id,
            'student_id' => $student->id,
            'status' => ClassMember::STATUS_ACTIVE,
            'joined_at' => now(),
        ]);
        Invoice::create([
            'invoice_no' => 'INV-2026-HISTORY',
            'student_id' => $student->id,
            'class_member_id' => $member->id,
            'class_group_id' => $class->id,
            'billing_type' => 'monthly',
            'billing_month' => now()->startOfMonth(),
            'amount' => 350000,
            'status' => Invoice::STATUS_UNPAID,
        ]);

        $response = $this->actingAs($user, PermissionCatalog::GUARD)->delete(
            route('admin.academic.members.destroy', $member),
        );

        $response->assertSessionHas('error');
        $this->assertDatabaseHas('class_members', ['id' => $member->id]);
        $this->assertDatabaseCount('invoices', 1);
    }

    public function test_completing_class_membership_can_optionally_deactivate_student(): void
    {
        $user = $this->actingAsAdmin();
        $program = $this->makeProgram();
        $class = $this->makeClass($program);
        $student = $this->makeStudent($program);
        $member = ClassMember::create([
            'class_group_id' => $class->id,
            'student_id' => $student->id,
            'status' => ClassMember::STATUS_ACTIVE,
            'joined_at' => now(),
        ]);

        $response = $this->actingAs($user, PermissionCatalog::GUARD)->patch(
            route('admin.academic.members.complete', $member),
            ['deactivate_student' => true],
        );

        $response->assertSessionHas('success');
        $this->assertSame(ClassMember::STATUS_GRADUATED, $member->fresh()->status);
        $this->assertFalse($student->fresh()->is_active);
        $this->assertSame($user->id, $student->fresh()->updated_by);
    }

    public function test_student_with_another_active_class_cannot_be_deactivated_when_completing_membership(): void
    {
        $user = $this->actingAsAdmin();
        $program = $this->makeProgram();
        $otherProgram = $this->makeProgram('Intensif');
        $class = $this->makeClass($program);
        $otherClass = $this->makeClass($otherProgram);
        $student = $this->makeStudent($program);
        $member = ClassMember::create([
            'class_group_id' => $class->id,
            'student_id' => $student->id,
            'status' => ClassMember::STATUS_ACTIVE,
            'joined_at' => now(),
        ]);
        ClassMember::create([
            'class_group_id' => $otherClass->id,
            'student_id' => $student->id,
            'status' => ClassMember::STATUS_ACTIVE,
            'joined_at' => now(),
        ]);

        $response = $this->actingAs($user, PermissionCatalog::GUARD)->patch(
            route('admin.academic.members.complete', $member),
            ['deactivate_student' => true],
        );

        $response->assertSessionHas('error');
        $this->assertSame(ClassMember::STATUS_ACTIVE, $member->fresh()->status);
        $this->assertTrue($student->fresh()->is_active);
    }

    public function test_admin_can_complete_and_reactivate_class_without_changing_history_or_members(): void
    {
        $user = $this->actingAsAdmin();
        $program = $this->makeProgram();
        $class = $this->makeClass($program);
        $student = $this->makeStudent($program);
        $member = ClassMember::create([
            'class_group_id' => $class->id,
            'student_id' => $student->id,
            'status' => ClassMember::STATUS_ACTIVE,
            'joined_at' => now(),
        ]);
        $class->schedules()->create([
            'day_of_week' => 1,
            'start_time' => '15:00',
            'end_time' => '16:00',
        ]);
        Attendance::create([
            'class_group_id' => $class->id,
            'student_id' => $student->id,
            'date' => '2026-10-05',
            'status' => 'hadir',
        ]);
        Grade::create([
            'class_group_id' => $class->id,
            'student_id' => $student->id,
            'subject' => 'Matematika',
            'term' => 'Oktober',
            'score' => 90,
        ]);

        $this->actingAs($user, PermissionCatalog::GUARD)
            ->patch(route('admin.academic.classes.status.update', $class), ['is_active' => false])
            ->assertSessionHas('success');

        $this->assertFalse($class->fresh()->is_active);
        $this->assertSame(ClassMember::STATUS_ACTIVE, $member->fresh()->status);
        $this->assertDatabaseCount('schedules', 1);
        $this->assertDatabaseCount('attendances', 1);
        $this->assertDatabaseCount('grades', 1);

        $this->actingAs($user, PermissionCatalog::GUARD)
            ->patch(route('admin.academic.classes.status.update', $class), ['is_active' => true])
            ->assertSessionHas('success');

        $this->assertTrue($class->fresh()->is_active);
        $this->assertSame(ClassMember::STATUS_ACTIVE, $member->fresh()->status);
        $this->assertDatabaseCount('schedules', 1);
        $this->assertDatabaseCount('attendances', 1);
        $this->assertDatabaseCount('grades', 1);
    }

    public function test_class_metadata_update_cannot_bypass_the_dedicated_status_action(): void
    {
        $user = $this->actingAsAdmin();
        $program = $this->makeProgram();
        $teacher = Teacher::create(['name' => 'Guru Kelas', 'is_active' => true]);
        $class = $this->makeClass($program, $teacher);
        $class->update(['is_active' => false]);

        $this->actingAs($user, PermissionCatalog::GUARD)
            ->put(route('admin.academic.classes.update', $class), [
                'program_id' => $program->id,
                'teacher_id' => $teacher->id,
                'name' => 'Kelas Diperbarui',
                'is_active' => true,
            ])
            ->assertSessionHas('success');

        $class->refresh();

        $this->assertSame('Kelas Diperbarui', $class->name);
        $this->assertFalse($class->is_active);
    }

    public function test_inactive_class_rejects_new_academic_operations(): void
    {
        $user = $this->actingAsAdmin();
        $program = $this->makeProgram();
        $class = $this->makeClass($program);
        $student = $this->makeStudent($program);
        $member = ClassMember::create([
            'class_group_id' => $class->id,
            'student_id' => $student->id,
            'status' => ClassMember::STATUS_ACTIVE,
            'joined_at' => now(),
        ]);
        $class->update(['is_active' => false]);

        $this->actingAs($user, PermissionCatalog::GUARD)->post(
            route('admin.academic.schedules.store', $class),
            ['day_of_week' => 1, 'start_time' => '15:00', 'end_time' => '16:00'],
        )->assertSessionHas('error');

        $this->actingAs($user, PermissionCatalog::GUARD)->post(
            route('admin.academic.attendance.store', $class),
            [
                'date' => '2026-10-05',
                'subject' => 'Matematika',
                'material' => 'Aljabar',
                'rows' => [[
                    'student_id' => $student->id,
                    'status' => 'hadir',
                    'understanding_score' => 4,
                    'evaluation' => 'Baik',
                ]],
            ],
        )->assertSessionHas('error');

        $this->actingAs($user, PermissionCatalog::GUARD)->post(
            route('admin.academic.sessions.generate', $class),
            ['month' => '2026-10', 'dates' => ['2026-10-05']],
        )->assertSessionHas('error');

        $this->actingAs($user, PermissionCatalog::GUARD)->post(
            route('admin.academic.grades.store', $class),
            [
                'subject' => 'Matematika',
                'term' => 'Oktober',
                'rows' => [['student_id' => $student->id, 'score' => 90]],
            ],
        )->assertSessionHas('error');

        $this->actingAs($user, PermissionCatalog::GUARD)->post(
            route('admin.academic.members.periods.store', $member),
            [
                'start_date' => '2026-10-01',
                'end_date' => '2026-10-31',
                'session_limit' => 4,
            ],
        )->assertSessionHas('error');

        $this->assertDatabaseCount('schedules', 0);
        $this->assertDatabaseCount('attendances', 0);
        $this->assertDatabaseCount('grades', 0);
        $this->assertDatabaseCount('class_member_periods', 0);
    }

    public function test_inactive_class_cannot_be_reactivated_when_teacher_schedule_now_conflicts(): void
    {
        $user = $this->actingAsAdmin();
        $program = $this->makeProgram();
        $teacher = Teacher::create(['name' => 'Guru Jadwal', 'is_active' => true]);
        $activeClass = $this->makeClass($program, $teacher);
        $inactiveClass = ClassGroup::create([
            'program_id' => $program->id,
            'teacher_id' => $teacher->id,
            'name' => 'Kelas Lama',
            'is_active' => false,
        ]);
        $activeClass->schedules()->create([
            'day_of_week' => 1,
            'start_time' => '15:00',
            'end_time' => '16:00',
        ]);
        $inactiveClass->schedules()->create([
            'day_of_week' => 1,
            'start_time' => '15:30',
            'end_time' => '16:30',
        ]);

        $this->actingAs($user, PermissionCatalog::GUARD)
            ->patch(route('admin.academic.classes.status.update', $inactiveClass), ['is_active' => true])
            ->assertSessionHas('error');

        $this->assertFalse($inactiveClass->fresh()->is_active);
    }
}
