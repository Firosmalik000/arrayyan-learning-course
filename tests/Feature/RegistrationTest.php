<?php

namespace Tests\Feature;

use App\Mail\StudentRegistrationReceivedMail;
use App\Mail\TeacherRegistrationApprovedExistingAccountMail;
use App\Mail\TeacherRegistrationApprovedNewAccountMail;
use App\Mail\TeacherRegistrationReceivedMail;
use App\Models\NotificationLog;
use App\Models\PortalAccount;
use App\Models\Program;
use App\Models\Role;
use App\Models\Student;
use App\Models\StudentRegistration;
use App\Models\Teacher;
use App\Models\TeacherRegistration;
use App\Models\User;
use App\Support\PermissionCatalog;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Mail;
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
            'duration' => '60 menit / sesi',
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
            ->where('programs.0.duration', '60 menit / sesi')
        );
    }

    // ── Student Registration ───────────────────────────────────────

    public function test_student_registration_stores_successfully(): void
    {
        Mail::fake();

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
            'parent_email' => 'orangtua@example.com',
            'preferred_mode' => 'Online',
            'notes' => 'Catatan test',
        ];

        $response = $this->post(route('registrations.student'), $payload);

        $registration = StudentRegistration::query()->where('student_name', 'Ahmad Fauzi')->firstOrFail();

        $response->assertRedirect(route('registrations.success', [
            'registrationType' => 'murid',
            'ticket' => $registration->registration_no,
        ]));
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('student_registrations', [
            'student_name' => 'Ahmad Fauzi',
            'level' => 'SMP',
            'program_id' => $program->id,
            'program' => 'Reguler',
            'package' => '8 Sesi/Bulan',
            'parent_email' => 'orangtua@example.com',
        ]);

        Mail::assertSent(StudentRegistrationReceivedMail::class, function (StudentRegistrationReceivedMail $mail) use ($registration): bool {
            return $mail->hasTo('orangtua@example.com')
                && $mail->hasSubject('Pendaftaran '.$registration->registration_no.' Berhasil Diterima - '.config('app.name'))
                && $mail->studentName === 'Ahmad Fauzi'
                && $mail->ticket === $registration->registration_no
                && $mail->statusUrl === route('status.check', ['ticket' => $registration->registration_no]);
        });
    }

    public function test_student_registration_stores_with_class_level(): void
    {
        $program = Program::create([
            'name' => 'Reguler',
            'level' => 'SD',
            'is_active' => true,
        ]);

        $payload = [
            'student_name' => 'Aisyah Putri',
            'address' => 'Jl. Mawar No. 12',
            'school_name' => 'SDIT Nurul Fikri',
            'level' => 'SD',
            'class_level' => 'Kelas 4',
            'subjects' => 'Matematika, IPA',
            'program_id' => $program->id,
            'package' => '8 Sesi/Bulan',
            'parent_contact' => '081234567890',
            'parent_email' => 'aisyah.parent@example.com',
            'preferred_mode' => 'Offline',
        ];

        $response = $this->post(route('registrations.student'), $payload);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('student_registrations', [
            'student_name' => 'Aisyah Putri',
            'level' => 'SD',
            'class_level' => 'Kelas 4',
            'program_id' => $program->id,
        ]);
    }

    public function test_registration_success_page_displays_the_submitted_ticket(): void
    {
        $registration = StudentRegistration::factory()->create([
            'registration_no' => 'ALC-2026-00002',
        ]);

        $response = $this->get(route('registrations.success', [
            'registrationType' => 'murid',
            'ticket' => $registration->registration_no,
        ]));

        $response->assertSuccessful();
        $response->assertInertia(fn ($page) => $page
            ->component('Public/Register/Success', false)
            ->where('registrationType', 'murid')
            ->where('ticket', 'ALC-2026-00002')
        );
    }

    public function test_registration_success_page_rejects_an_unknown_ticket(): void
    {
        $response = $this->get(route('registrations.success', [
            'registrationType' => 'murid',
            'ticket' => 'ALC-2026-99999',
        ]));

        $response->assertNotFound();
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
            'parent_email',
        ]);
    }

    public function test_student_registration_rejects_invalid_parent_email(): void
    {
        $program = Program::create([
            'name' => 'Reguler',
            'level' => 'SMP',
            'is_active' => true,
        ]);

        $response = $this->post(route('registrations.student'), [
            'student_name' => 'Email Tidak Valid',
            'address' => 'Jl. Test',
            'school_name' => 'SMP Test',
            'level' => 'SMP',
            'subjects' => 'Matematika',
            'program_id' => $program->id,
            'package' => '8 Sesi/Bulan',
            'parent_contact' => '081234567890',
            'parent_email' => 'bukan-email',
        ]);

        $response->assertSessionHasErrors('parent_email');
        $this->assertDatabaseMissing('student_registrations', [
            'student_name' => 'Email Tidak Valid',
        ]);
    }

    public function test_student_registration_email_contains_ticket_and_status_link(): void
    {
        $mail = new StudentRegistrationReceivedMail(
            studentName: 'Ahmad Fauzi',
            ticket: 'ALC-2026-00002',
            statusUrl: 'https://example.com/cek-status?ticket=ALC-2026-00002',
        );

        $html = $mail->render();

        $this->assertStringContainsString('Pendaftaran Berhasil Dikirim!', $html);
        $this->assertStringContainsString('Ahmad Fauzi', $html);
        $this->assertStringContainsString('ALC-2026-00002', $html);
        $this->assertStringContainsString('https://example.com/cek-status?ticket=ALC-2026-00002', $html);
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
            'parent_email' => 'budi.parent@example.com',
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
        Mail::fake();

        $payload = [
            'name' => 'Siti Aminah',
            'email' => 'siti.aminah@example.com',
            'address' => 'Jl. Guru No. 5',
            'education' => 'S1 Pendidikan Matematika',
            'subjects' => 'Matematika',
            'experience' => '5 tahun mengajar',
            'contact' => '081298765432',
            'cv' => UploadedFile::fake()->create('cv.pdf', 100, 'application/pdf'),
            'notes' => 'Catatan pengajar',
        ];

        $response = $this->post(route('registrations.teacher'), $payload);

        $registration = TeacherRegistration::query()->where('name', 'Siti Aminah')->firstOrFail();

        $response->assertRedirect(route('registrations.success', [
            'registrationType' => 'pengajar',
            'ticket' => $registration->registration_no,
        ]));
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('teacher_registrations', [
            'name' => 'Siti Aminah',
            'email' => 'siti.aminah@example.com',
            'education' => 'S1 Pendidikan Matematika',
        ]);

        $teacher = TeacherRegistration::where('name', 'Siti Aminah')->first();
        $this->assertNotNull($teacher->cv_path);
        Storage::disk('public')->assertExists($teacher->cv_path);

        Mail::assertSent(TeacherRegistrationReceivedMail::class, function ($mail) use ($registration) {
            return $mail->hasTo('siti.aminah@example.com')
                && $mail->ticket === $registration->registration_no;
        });
    }

    public function test_teacher_registration_stores_with_domicile_and_role(): void
    {
        Storage::fake('public');
        Mail::fake();

        $payload = [
            'name' => 'Fathur Rahman, S.Pd.',
            'email' => 'fathur.rahman@example.com',
            'city' => 'Kota Padang',
            'district' => 'Koto Tangah',
            'address' => 'Jl. Adinegoro No. 88, RT 01 / RW 03',
            'teacher_role' => 'Guru SD (Tematik & Mapel SD)',
            'education' => 'S1 PGSD - Universitas Negeri Padang',
            'subjects' => 'Matematika SD, Tematik, IPA',
            'experience' => '3 tahun mengajar privat dan bimbel',
            'contact' => '081234567890',
            'cv' => UploadedFile::fake()->create('cv.pdf', 100, 'application/pdf'),
            'notes' => 'Siap mengajar area Koto Tangah',
        ];

        $response = $this->post(route('registrations.teacher'), $payload);

        $registration = TeacherRegistration::query()->where('name', 'Fathur Rahman, S.Pd.')->firstOrFail();

        $response->assertRedirect(route('registrations.success', [
            'registrationType' => 'pengajar',
            'ticket' => $registration->registration_no,
        ]));
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('teacher_registrations', [
            'name' => 'Fathur Rahman, S.Pd.',
            'city' => 'Kota Padang',
            'district' => 'Koto Tangah',
            'teacher_role' => 'Guru SD (Tematik & Mapel SD)',
            'subjects' => 'Matematika SD, Tematik, IPA',
        ]);
    }

    public function test_teacher_registration_requires_mandatory_fields(): void
    {
        $response = $this->post(route('registrations.teacher'), []);

        $response->assertSessionHasErrors([
            'name',
            'email',
            'address',
            'education',
            'subjects',
            'contact',
            'cv',
        ]);
    }

    public function test_teacher_registration_rejects_invalid_email(): void
    {
        Storage::fake('public');

        $payload = [
            'name' => 'Siti Aminah',
            'email' => 'bukan-email',
            'address' => 'Jl. Guru No. 5',
            'education' => 'S1 Pendidikan Matematika',
            'subjects' => 'Matematika',
            'contact' => '081298765432',
            'cv' => UploadedFile::fake()->create('cv.pdf', 100, 'application/pdf'),
        ];

        $response = $this->post(route('registrations.teacher'), $payload);

        $response->assertSessionHasErrors('email');
    }

    public function test_teacher_registration_email_contains_ticket_and_status_link(): void
    {
        $mail = new TeacherRegistrationReceivedMail(
            teacherName: 'Siti Aminah',
            ticket: 'ALC-T-2026-00001',
            statusUrl: 'https://example.com/cek-status?ticket=ALC-T-2026-00001',
        );

        $html = $mail->render();

        $this->assertStringContainsString('Lamaran Berhasil Diterima!', $html);
        $this->assertStringContainsString('Siti Aminah', $html);
        $this->assertStringContainsString('ALC-T-2026-00001', $html);
        $this->assertStringContainsString('https://example.com/cek-status?ticket=ALC-T-2026-00001', $html);
    }

    public function test_teacher_registration_rejects_invalid_cv_format(): void
    {
        $payload = [
            'name' => 'Test',
            'email' => 'test@example.com',
            'address' => 'Test',
            'education' => 'S1',
            'subjects' => 'Math',
            'contact' => '081234567890',
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
            ->has('studentRegistrations.data', 1)
            ->where('studentRegistrations.data.0.student_name', 'Test Student')
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
            ->has('teacherRegistrations.data', 1)
            ->where('teacherRegistrations.data.0.name', 'Test Teacher')
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
            ->has('studentRegistrations.data', 1)
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
            ->has('teacherRegistrations.data', 1)
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

        $response = $this->actingAs($user, PermissionCatalog::GUARD)->get(route('admin.registrations', [
            'student_status' => 'rejected',
            'teacher_status' => 'rejected',
        ]));

        $response->assertSuccessful();
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Registrations', false)
            ->where('studentRegistrations.data.0.rejected_by_name', $rejector->name)
            ->where('teacherRegistrations.data.0.rejected_by_name', $rejector->name)
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

    public function test_approve_student_copies_class_level_to_student(): void
    {
        $user = $this->actingAsAdmin();
        $reg = StudentRegistration::factory()->create([
            'student_name' => 'Anak Jenius',
            'level' => 'SD',
            'class_level' => 'Kelas 5',
            'status' => 'pending',
        ]);

        $this->actingAs($user, PermissionCatalog::GUARD)->post(route('admin.registrations.student.approve', $reg));

        $this->assertDatabaseHas('students', [
            'name' => 'Anak Jenius',
            'level' => 'SD',
            'class_level' => 'Kelas 5',
            'is_active' => true,
        ]);
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

    public function test_approve_teacher_copies_domicile_and_role(): void
    {
        $user = $this->actingAsAdmin();
        $reg = TeacherRegistration::factory()->create([
            'name' => 'Guru Domisili',
            'city' => 'Kota Padang',
            'district' => 'Koto Tangah',
            'teacher_role' => 'Guru SMP (Mata Pelajaran SMP)',
            'status' => 'pending',
        ]);

        $response = $this->actingAs($user, PermissionCatalog::GUARD)->post(route('admin.registrations.teacher.approve', $reg));

        $response->assertRedirect();
        $this->assertDatabaseHas('teachers', [
            'name' => 'Guru Domisili',
            'city' => 'Kota Padang',
            'district' => 'Koto Tangah',
            'teacher_role' => 'Guru SMP (Mata Pelajaran SMP)',
            'is_active' => true,
        ]);
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

    // ── M0: Idempotency & Anti-Duplikat ────────────────────────────

    public function test_approve_student_twice_does_not_duplicate_student(): void
    {
        $user = $this->actingAsAdmin();
        $reg = StudentRegistration::factory()->create(['status' => 'pending']);

        $this->actingAs($user, PermissionCatalog::GUARD)->post(route('admin.registrations.student.approve', $reg));
        $second = $this->actingAs($user, PermissionCatalog::GUARD)->post(route('admin.registrations.student.approve', $reg->fresh()));

        $second->assertSessionHas('error');
        $this->assertEquals(1, Student::query()->where('name', $reg->student_name)->count());
    }

    public function test_reject_student_after_approve_is_blocked(): void
    {
        $user = $this->actingAsAdmin();
        $reg = StudentRegistration::factory()->create(['status' => 'pending']);

        $this->actingAs($user, PermissionCatalog::GUARD)->post(route('admin.registrations.student.approve', $reg));
        $response = $this->actingAs($user, PermissionCatalog::GUARD)->post(route('admin.registrations.student.reject', $reg->fresh()));

        $response->assertSessionHas('error');
        $this->assertDatabaseHas('student_registrations', [
            'id' => $reg->id,
            'status' => 'approved',
            'rejected_at' => null,
        ]);
    }

    public function test_approve_student_skips_duplicate_student_record(): void
    {
        $user = $this->actingAsAdmin();
        $program = Program::create(['name' => 'Reguler', 'level' => 'SMP', 'is_active' => true]);
        Student::create([
            'name' => 'Anak Kembar',
            'parent_contact' => '081234567890',
            'program_id' => $program->id,
            'is_active' => true,
        ]);
        $reg = StudentRegistration::factory()->create([
            'student_name' => 'Anak Kembar',
            'parent_contact' => '081234567890',
            'program_id' => $program->id,
            'status' => 'pending',
        ]);

        $response = $this->actingAs($user, PermissionCatalog::GUARD)->post(route('admin.registrations.student.approve', $reg));

        $response->assertSessionHas('success');
        $this->assertDatabaseHas('student_registrations', ['id' => $reg->id, 'status' => 'approved']);
        $this->assertEquals(1, Student::query()
            ->where('name', 'Anak Kembar')
            ->where('parent_contact', '081234567890')
            ->where('program_id', $program->id)
            ->count());
    }

    public function test_approve_teacher_twice_does_not_duplicate_teacher(): void
    {
        $user = $this->actingAsAdmin();
        $reg = TeacherRegistration::factory()->create(['status' => 'pending']);

        $this->actingAs($user, PermissionCatalog::GUARD)->post(route('admin.registrations.teacher.approve', $reg));
        $second = $this->actingAs($user, PermissionCatalog::GUARD)->post(route('admin.registrations.teacher.approve', $reg->fresh()));

        $second->assertSessionHas('error');
        $this->assertEquals(1, Teacher::query()->where('name', $reg->name)->count());
    }

    public function test_approve_teacher_skips_duplicate_teacher_record(): void
    {
        $user = $this->actingAsAdmin();
        Teacher::create(['name' => 'Guru Kembar', 'contact' => '081298765432', 'is_active' => true]);
        $reg = TeacherRegistration::factory()->create([
            'name' => 'Guru Kembar',
            'contact' => '081298765432',
            'status' => 'pending',
        ]);

        $response = $this->actingAs($user, PermissionCatalog::GUARD)->post(route('admin.registrations.teacher.approve', $reg));

        $response->assertSessionHas('success');
        $this->assertDatabaseHas('teacher_registrations', ['id' => $reg->id, 'status' => 'approved']);
        $this->assertEquals(1, Teacher::query()
            ->where('name', 'Guru Kembar')
            ->where('contact', '081298765432')
            ->count());
    }

    // ── M0: Validasi WhatsApp ──────────────────────────────────────

    public function test_student_registration_rejects_invalid_whatsapp_number(): void
    {
        $program = Program::create(['name' => 'Reguler', 'level' => 'SMP', 'is_active' => true]);

        $response = $this->post(route('registrations.student'), [
            'student_name' => 'Ahmad',
            'address' => 'Jl. Test',
            'school_name' => 'SMP Test',
            'level' => 'SMP',
            'subjects' => 'Matematika',
            'program_id' => $program->id,
            'package' => '8 Sesi/Bulan',
            'parent_contact' => 'bukan-nomor',
            'parent_email' => 'ahmad.parent@example.com',
        ]);

        $response->assertSessionHasErrors('parent_contact');
    }

    public function test_student_registration_normalizes_whatsapp_separator(): void
    {
        $program = Program::create(['name' => 'Reguler', 'level' => 'SMP', 'is_active' => true]);

        $response = $this->post(route('registrations.student'), [
            'student_name' => 'Ahmad Rapi',
            'address' => 'Jl. Test',
            'school_name' => 'SMP Test',
            'level' => 'SMP',
            'subjects' => 'Matematika',
            'program_id' => $program->id,
            'package' => '8 Sesi/Bulan',
            'parent_contact' => '0812-3456-7890',
            'parent_email' => 'ahmad.rapi.parent@example.com',
        ]);

        $response->assertSessionHasNoErrors();
        $this->assertDatabaseHas('student_registrations', [
            'student_name' => 'Ahmad Rapi',
            'parent_contact' => '081234567890',
        ]);
    }

    public function test_teacher_registration_rejects_invalid_contact_number(): void
    {
        Storage::fake('public');

        $response = $this->post(route('registrations.teacher'), [
            'name' => 'Guru Test',
            'email' => 'guru.test@example.com',
            'address' => 'Jl. Test',
            'education' => 'S1',
            'subjects' => 'Math',
            'contact' => '12345',
            'cv' => UploadedFile::fake()->create('cv.pdf', 100, 'application/pdf'),
        ]);

        $response->assertSessionHasErrors('contact');
    }

    public function test_admin_approving_teacher_creates_account_with_email_and_sends_new_account_email(): void
    {
        Mail::fake();
        $user = $this->actingAsAdmin();

        $registration = TeacherRegistration::factory()->create([
            'name' => 'Dewi Lestari',
            'email' => 'dewi.lestari@example.com',
            'contact' => '081234567899',
            'subjects' => 'Bahasa Inggris',
            'status' => 'pending',
        ]);

        $response = $this->actingAs($user, PermissionCatalog::GUARD)->post(route('admin.registrations.teacher.approve', $registration));

        $response->assertSessionHas('success');
        $this->assertDatabaseHas('teacher_registrations', [
            'id' => $registration->id,
            'status' => 'approved',
        ]);

        $teacher = Teacher::query()->where('name', 'Dewi Lestari')->first();
        $this->assertNotNull($teacher);
        $this->assertEquals('dewi.lestari@example.com', $teacher->email);

        $portalAccount = PortalAccount::query()
            ->where('type', PortalAccount::TYPE_TEACHER)
            ->where('email', 'dewi.lestari@example.com')
            ->first();
        $this->assertNotNull($portalAccount);
        $this->assertEquals($teacher->id, $portalAccount->teacher_id);
        $this->assertTrue($portalAccount->must_change_password);

        Mail::assertSent(TeacherRegistrationApprovedNewAccountMail::class, function ($mail) {
            return $mail->hasTo('dewi.lestari@example.com')
                && $mail->teacherName === 'Dewi Lestari'
                && ! empty($mail->temporaryPassword);
        });
    }

    public function test_admin_approving_teacher_with_existing_account_reuses_portal_and_sends_existing_email(): void
    {
        Mail::fake();
        $user = $this->actingAsAdmin();

        $existingPortal = PortalAccount::create([
            'type' => PortalAccount::TYPE_TEACHER,
            'name' => 'Dewi Lestari',
            'email' => 'dewi.lestari@example.com',
            'contact' => '081234567899',
            'password' => bcrypt('ExistingPass123'),
            'must_change_password' => false,
            'is_active' => true,
        ]);

        $registration = TeacherRegistration::factory()->create([
            'name' => 'Dewi Lestari Rekrut Ulang',
            'email' => 'dewi.lestari@example.com',
            'contact' => '081234567899',
            'subjects' => 'English & Literature',
            'status' => 'pending',
        ]);

        $response = $this->actingAs($user, PermissionCatalog::GUARD)->post(route('admin.registrations.teacher.approve', $registration));

        $response->assertSessionHas('success');

        Mail::assertSent(TeacherRegistrationApprovedExistingAccountMail::class, function ($mail) {
            return $mail->hasTo('dewi.lestari@example.com')
                && $mail->loginEmail === 'dewi.lestari@example.com';
        });

        Mail::assertNotSent(TeacherRegistrationApprovedNewAccountMail::class);
    }

    // ── M0: Filter & Pagination Server-Side ────────────────────────

    public function test_admin_registrations_supports_status_filter_and_stats(): void
    {
        $user = $this->actingAsAdmin();
        StudentRegistration::factory()->create(['student_name' => 'Pending Kid', 'status' => 'pending']);
        StudentRegistration::factory()->create([
            'student_name' => 'Approved Kid',
            'status' => 'approved',
            'approved_at' => now(),
            'approved_by' => $user->id,
        ]);

        $response = $this->actingAs($user, PermissionCatalog::GUARD)->get(route('admin.registrations', [
            'student_status' => 'approved',
        ]));

        $response->assertSuccessful();
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Registrations', false)
            ->has('studentRegistrations.data', 1)
            ->where('studentRegistrations.data.0.student_name', 'Approved Kid')
            ->where('studentStats.total', 2)
            ->where('studentStats.pending', 1)
            ->where('studentStats.approved', 1)
        );
    }

    public function test_admin_registrations_supports_search_filter(): void
    {
        $user = $this->actingAsAdmin();
        StudentRegistration::factory()->create(['student_name' => 'Cari Saya Unik', 'status' => 'pending']);
        StudentRegistration::factory()->create(['student_name' => 'Anak Lain', 'status' => 'pending']);

        $response = $this->actingAs($user, PermissionCatalog::GUARD)->get(route('admin.registrations', [
            'student_search' => 'Unik',
            'student_status' => '',
        ]));

        $response->assertSuccessful();
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Registrations', false)
            ->has('studentRegistrations.data', 1)
            ->where('studentRegistrations.data.0.student_name', 'Cari Saya Unik')
        );
    }

    // ── M1: Tiket & Notifikasi ───────────────────────────────────

    public function test_student_registration_generates_ticket_and_received_notification(): void
    {
        $program = Program::create(['name' => 'Reguler', 'level' => 'SMP', 'is_active' => true]);

        $response = $this->post(route('registrations.student'), [
            'student_name' => 'Anak Tiket',
            'address' => 'Jl. Test',
            'school_name' => 'SMP Test',
            'level' => 'SMP',
            'subjects' => 'Matematika',
            'program_id' => $program->id,
            'package' => '8 Sesi/Bulan',
            'parent_contact' => '081234567890',
            'parent_email' => 'ticket.parent@example.com',
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('ticket');

        $ticket = session('ticket');
        $this->assertMatchesRegularExpression('/^ALC-\d{4}-\d{5}$/', $ticket);
        $this->assertDatabaseHas('student_registrations', [
            'student_name' => 'Anak Tiket',
            'registration_no' => $ticket,
        ]);
        $this->assertDatabaseHas('notification_logs', [
            'event' => 'received',
            'channel' => 'whatsapp',
            'recipient' => '081234567890',
            'status' => 'sent',
            'registration_type' => 'student',
        ]);
    }

    public function test_teacher_registration_generates_ticket_and_received_notification(): void
    {
        Storage::fake('public');

        $response = $this->post(route('registrations.teacher'), [
            'name' => 'Guru Tiket',
            'email' => 'guru.tiket@example.com',
            'address' => 'Jl. Test',
            'education' => 'S1',
            'subjects' => 'Math',
            'contact' => '081298765432',
            'cv' => UploadedFile::fake()->create('cv.pdf', 100, 'application/pdf'),
        ]);

        $response->assertRedirect();
        $ticket = session('ticket');
        $this->assertMatchesRegularExpression('/^ALC-\d{4}-\d{5}$/', $ticket);
        $this->assertDatabaseHas('teacher_registrations', [
            'name' => 'Guru Tiket',
            'registration_no' => $ticket,
        ]);
        $this->assertDatabaseHas('notification_logs', [
            'event' => 'received',
            'recipient' => '081298765432',
            'status' => 'sent',
            'registration_type' => 'teacher',
        ]);
    }

    public function test_approve_student_sends_approved_notification(): void
    {
        $user = $this->actingAsAdmin();
        $reg = StudentRegistration::factory()->create([
            'student_name' => 'Anak Setuju',
            'parent_contact' => '081234567890',
            'registration_no' => 'ALC-2026-00100',
            'status' => 'pending',
        ]);

        $this->actingAs($user, PermissionCatalog::GUARD)->post(route('admin.registrations.student.approve', $reg));

        $this->assertDatabaseHas('notification_logs', [
            'event' => 'approved',
            'recipient' => '081234567890',
            'status' => 'sent',
            'registration_type' => 'student',
            'registration_id' => $reg->id,
        ]);
        $this->assertNotNull($reg->fresh()->notified_at);
    }

    public function test_reject_student_with_reason_stores_note_and_notifies(): void
    {
        $user = $this->actingAsAdmin();
        $reg = StudentRegistration::factory()->create([
            'parent_contact' => '081234567890',
            'registration_no' => 'ALC-2026-00101',
            'status' => 'pending',
        ]);

        $response = $this->actingAs($user, PermissionCatalog::GUARD)->post(
            route('admin.registrations.student.reject', $reg),
            ['admin_note' => 'Kuota penuh.']
        );

        $response->assertRedirect();
        $this->assertDatabaseHas('student_registrations', [
            'id' => $reg->id,
            'status' => 'rejected',
            'admin_note' => 'Kuota penuh.',
        ]);

        $log = NotificationLog::query()
            ->where('event', 'rejected')
            ->where('registration_id', $reg->id)
            ->first();
        $this->assertNotNull($log);
        $this->assertEquals('sent', $log->status);
        $this->assertStringContainsString('Kuota penuh.', $log->message);
    }

    public function test_bulk_approve_students_processes_pending_only(): void
    {
        $user = $this->actingAsAdmin();
        $pending1 = StudentRegistration::factory()->create(['student_name' => 'Bulk Satu', 'status' => 'pending']);
        $pending2 = StudentRegistration::factory()->create(['student_name' => 'Bulk Dua', 'status' => 'pending']);
        $approved = StudentRegistration::factory()->create(['student_name' => 'Sudah Setuju', 'status' => 'approved']);

        $response = $this->actingAs($user, PermissionCatalog::GUARD)->post(
            route('admin.registrations.student.bulk-approve'),
            ['ids' => [$pending1->id, $pending2->id, $approved->id]]
        );

        $response->assertRedirect();
        $response->assertSessionHas('success', 'Berhasil menyetujui 2 pendaftaran murid.');
        $this->assertEquals('approved', $pending1->fresh()->status);
        $this->assertEquals('approved', $pending2->fresh()->status);
        $this->assertEquals(1, Student::query()->where('name', 'Bulk Satu')->count());
        $this->assertEquals(1, Student::query()->where('name', 'Bulk Dua')->count());
    }

    public function test_bulk_approve_teachers_requires_ids(): void
    {
        $user = $this->actingAsAdmin();

        $response = $this->actingAs($user, PermissionCatalog::GUARD)->post(
            route('admin.registrations.teacher.bulk-approve'),
            ['ids' => []]
        );

        $response->assertSessionHasErrors('ids');
    }

    public function test_notification_failure_does_not_break_registration_flow(): void
    {
        config(['services.whatsapp.driver' => 'fonnte']);
        config(['services.whatsapp.token' => null]);

        $program = Program::create(['name' => 'Reguler', 'level' => 'SMP', 'is_active' => true]);

        $response = $this->post(route('registrations.student'), [
            'student_name' => 'Anak Gagal Notif',
            'address' => 'Jl. Test',
            'school_name' => 'SMP Test',
            'level' => 'SMP',
            'subjects' => 'Matematika',
            'program_id' => $program->id,
            'package' => '8 Sesi/Bulan',
            'parent_contact' => '081234567890',
            'parent_email' => 'notification.parent@example.com',
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('ticket');
        $this->assertDatabaseHas('student_registrations', ['student_name' => 'Anak Gagal Notif']);
        $this->assertDatabaseHas('notification_logs', [
            'event' => 'received',
            'recipient' => '081234567890',
            'status' => 'failed',
        ]);
    }

    public function test_student_registration_records_email_notification_log(): void
    {
        Mail::fake();

        $program = Program::create(['name' => 'Reguler Log', 'level' => 'SMP', 'is_active' => true]);

        $response = $this->post(route('registrations.student'), [
            'student_name' => 'Anak Log Email',
            'address' => 'Jl. Test',
            'school_name' => 'SMP Test',
            'level' => 'SMP',
            'subjects' => 'Matematika',
            'program_id' => $program->id,
            'package' => '8 Sesi/Bulan',
            'parent_contact' => '081234567890',
            'parent_email' => 'log.parent@example.com',
        ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('notification_logs', [
            'event' => 'received',
            'channel' => 'email',
            'recipient' => 'log.parent@example.com',
            'status' => 'sent',
            'registration_type' => 'student',
        ]);
    }

    public function test_admin_can_resend_student_email(): void
    {
        Mail::fake();
        $user = $this->actingAsAdmin();

        $registration = StudentRegistration::factory()->create([
            'parent_email' => 'resend.student@example.com',
            'status' => 'pending',
        ]);

        $response = $this->actingAs($user, PermissionCatalog::GUARD)
            ->post(route('admin.registrations.student.resend-email', $registration));

        $response->assertSessionHas('success');

        Mail::assertSent(StudentRegistrationReceivedMail::class, function ($mail) {
            return $mail->hasTo('resend.student@example.com');
        });
    }

    public function test_admin_can_resend_teacher_email(): void
    {
        Mail::fake();
        $user = $this->actingAsAdmin();

        $registration = TeacherRegistration::factory()->create([
            'email' => 'resend.teacher@example.com',
            'status' => 'pending',
        ]);

        $response = $this->actingAs($user, PermissionCatalog::GUARD)
            ->post(route('admin.registrations.teacher.resend-email', $registration));

        $response->assertSessionHas('success');

        Mail::assertSent(TeacherRegistrationReceivedMail::class, function ($mail) {
            return $mail->hasTo('resend.teacher@example.com');
        });
    }

    public function test_artisan_mail_test_command_sends_email(): void
    {
        Mail::fake();

        $this->artisan('mail:test', ['recipient' => 'test.artisan@example.com'])
            ->expectsOutputToContain('BERHASIL')
            ->assertSuccessful();
    }
}
