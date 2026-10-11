<?php

namespace Tests\Feature;

use App\Mail\ParentRegistrationApprovedExistingAccountMail;
use App\Mail\ParentRegistrationApprovedNewAccountMail;
use App\Models\Attendance;
use App\Models\ClassGroup;
use App\Models\Invoice;
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
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class PortalTest extends TestCase
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

    private function makeAccount(string $type = 'student', array $overrides = []): PortalAccount
    {
        return PortalAccount::create(array_merge([
            'type' => $type,
            'name' => 'Akun Test',
            'contact' => '081234567890',
            'password' => Hash::make('password123'),
            'must_change_password' => false,
            'is_active' => true,
        ], $overrides));
    }

    public function test_approve_student_creates_portal_account_with_temp_password_notified(): void
    {
        $user = $this->actingAsAdmin();
        $program = Program::create(['name' => 'Reguler', 'level' => 'SMP', 'is_active' => true]);
        $reg = StudentRegistration::factory()->create([
            'student_name' => 'Anak Portal',
            'parent_contact' => '081234567890',
            'program_id' => $program->id,
            'status' => 'pending',
        ]);

        $this->actingAs($user, PermissionCatalog::GUARD)->post(
            route('admin.registrations.student.approve', $reg)
        );

        $account = PortalAccount::query()
            ->whereIn('type', ['parent', 'student'])
            ->where('contact', '081234567890')
            ->first();

        $this->assertNotNull($account);
        $this->assertTrue($account->must_change_password);
        $this->assertTrue($account->is_active);

        $log = NotificationLog::query()
            ->where('event', 'approved')
            ->where('registration_id', $reg->id)
            ->where('channel', 'whatsapp')
            ->first();
        $this->assertNotNull($log);
        $this->assertStringContainsString('portal', strtolower($log->message));
        $this->assertStringContainsString('password sementara', $log->message);
    }

    public function test_approve_teacher_creates_portal_account(): void
    {
        $user = $this->actingAsAdmin();
        $reg = TeacherRegistration::factory()->create([
            'name' => 'Guru Portal',
            'contact' => '081298765432',
            'status' => 'pending',
        ]);

        $this->actingAs($user, PermissionCatalog::GUARD)->post(
            route('admin.registrations.teacher.approve', $reg)
        );

        $this->assertDatabaseHas('portal_accounts', [
            'type' => 'teacher',
            'contact' => '081298765432',
        ]);
    }

    public function test_second_approve_does_not_duplicate_portal_account(): void
    {
        $user = $this->actingAsAdmin();
        $program = Program::create(['name' => 'Reguler', 'level' => 'SMP', 'is_active' => true]);
        $reg = StudentRegistration::factory()->create([
            'parent_contact' => '081234567890',
            'program_id' => $program->id,
            'status' => 'pending',
        ]);

        $guard = PermissionCatalog::GUARD;
        $this->actingAs($user, $guard)->post(route('admin.registrations.student.approve', $reg));
        $this->actingAs($user, $guard)->post(route('admin.registrations.student.approve', $reg->fresh()));

        $this->assertEquals(1, PortalAccount::query()
            ->whereIn('type', ['parent', 'student'])
            ->where('contact', '081234567890')
            ->count());
    }

    public function test_approve_first_student_with_email_creates_parent_account_and_sends_email(): void
    {
        Mail::fake();

        $user = $this->actingAsAdmin();
        $program = Program::create(['name' => 'Tahfidz', 'level' => 'SD', 'is_active' => true]);
        $reg = StudentRegistration::factory()->create([
            'student_name' => 'Anak Pertama',
            'parent_email' => 'orangtua@example.com',
            'parent_contact' => '081234567899',
            'program_id' => $program->id,
            'status' => 'pending',
        ]);

        $this->actingAs($user, PermissionCatalog::GUARD)->post(
            route('admin.registrations.student.approve', $reg)
        );

        $account = PortalAccount::query()
            ->where('email', 'orangtua@example.com')
            ->where('type', 'parent')
            ->first();

        $this->assertNotNull($account);
        $this->assertEquals('081234567899', $account->contact);
        $this->assertTrue($account->must_change_password);

        // Child linked
        $student = Student::where('name', 'Anak Pertama')->first();
        $this->assertNotNull($student);
        $this->assertEquals($account->id, $student->parent_portal_account_id);
        $this->assertEquals('orangtua@example.com', $student->parent_email);

        Mail::assertSent(ParentRegistrationApprovedNewAccountMail::class, function ($mail) {
            return $mail->hasTo('orangtua@example.com') && $mail->studentName === 'Anak Pertama';
        });
    }

    public function test_approve_second_student_for_same_parent_email_links_to_existing_account(): void
    {
        Mail::fake();

        $user = $this->actingAsAdmin();
        $program = Program::create(['name' => 'Olimpiade', 'level' => 'SMP', 'is_active' => true]);

        // First registration
        $reg1 = StudentRegistration::factory()->create([
            'student_name' => 'Kakak',
            'parent_email' => 'bunda@example.com',
            'parent_contact' => '08111222333',
            'program_id' => $program->id,
            'status' => 'pending',
        ]);
        $this->actingAs($user, PermissionCatalog::GUARD)->post(route('admin.registrations.student.approve', $reg1));

        $existingAccount = PortalAccount::where('email', 'bunda@example.com')->first();
        $originalPassword = $existingAccount->password;

        // Second registration with same parent_email
        $reg2 = StudentRegistration::factory()->create([
            'student_name' => 'Adik',
            'parent_email' => 'bunda@example.com',
            'parent_contact' => '08111222333',
            'program_id' => $program->id,
            'status' => 'pending',
        ]);
        $this->actingAs($user, PermissionCatalog::GUARD)->post(route('admin.registrations.student.approve', $reg2));

        // Account count is still 1
        $this->assertEquals(1, PortalAccount::where('email', 'bunda@example.com')->count());

        // Password not reset
        $existingAccount->refresh();
        $this->assertEquals($originalPassword, $existingAccount->password);

        // Both children belong to the same parent account
        $children = $existingAccount->students()->get();
        $this->assertCount(2, $children);
        $this->assertTrue($children->contains('name', 'Kakak'));
        $this->assertTrue($children->contains('name', 'Adik'));

        Mail::assertSent(ParentRegistrationApprovedExistingAccountMail::class, function ($mail) {
            return $mail->hasTo('bunda@example.com') && $mail->studentName === 'Adik';
        });
    }

    public function test_login_with_parent_email_and_switch_child(): void
    {
        $parent = PortalAccount::create([
            'type' => 'parent',
            'name' => 'Orang Tua Hebat',
            'email' => 'parent@example.com',
            'contact' => '08555666777',
            'password' => Hash::make('secret123'),
            'must_change_password' => false,
            'is_active' => true,
        ]);

        $child1 = Student::create([
            'name' => 'Anak Satu',
            'parent_portal_account_id' => $parent->id,
            'parent_email' => 'parent@example.com',
            'is_active' => true,
        ]);

        $child2 = Student::create([
            'name' => 'Anak Dua',
            'parent_portal_account_id' => $parent->id,
            'parent_email' => 'parent@example.com',
            'is_active' => true,
        ]);

        // Login using email
        $response = $this->post(route('portal.login.store'), [
            'contact' => 'parent@example.com',
            'password' => 'secret123',
        ]);
        $response->assertRedirect(route('portal.dashboard'));
        $this->assertAuthenticatedAs($parent, 'portal');

        // Switch child
        $switch = $this->actingAs($parent, 'portal')->post(route('portal.switch_student', $child2));
        $switch->assertRedirect();
        $this->assertEquals($child2->id, session('portal.selected_student_id'));
    }

    public function test_login_with_contact_and_password(): void
    {
        $this->makeAccount();

        $response = $this->post(route('portal.login.store'), [
            'contact' => '0812-3456-7890',
            'password' => 'password123',
        ]);

        $response->assertRedirect(route('portal.dashboard'));
        $this->assertAuthenticatedAs(
            PortalAccount::query()->first(),
            'portal'
        );
    }

    public function test_login_rejects_wrong_password_and_inactive(): void
    {
        $this->makeAccount();
        $this->makeAccount('student', ['contact' => '089999999999', 'is_active' => false]);

        $bad = $this->post(route('portal.login.store'), [
            'contact' => '081234567890',
            'password' => 'salah',
        ]);
        $bad->assertSessionHasErrors('contact');
        $this->assertGuest('portal');

        $inactive = $this->post(route('portal.login.store'), [
            'contact' => '089999999999',
            'password' => 'password123',
        ]);
        $inactive->assertSessionHasErrors('contact');
        $this->assertGuest('portal');
    }

    public function test_must_change_password_redirects_until_changed(): void
    {
        $account = $this->makeAccount('student', ['must_change_password' => true]);

        $dashboard = $this->actingAs($account, 'portal')->get(route('portal.dashboard'));
        $dashboard->assertRedirect(route('portal.password'));

        $passwordPage = $this->actingAs($account, 'portal')->get(route('portal.password'));
        $passwordPage->assertSuccessful();

        $update = $this->actingAs($account, 'portal')->put(route('portal.password.update'), [
            'current_password' => 'password123',
            'password' => 'barupassword123',
            'password_confirmation' => 'barupassword123',
        ]);

        $update->assertRedirect(route('portal.dashboard'));
        $this->assertFalse($account->fresh()->must_change_password);

        $after = $this->actingAs($account, 'portal')->get(route('portal.dashboard'));
        $after->assertSuccessful();
        $after->assertInertia(fn ($page) => $page->component('Portal/Dashboard', false));
    }

    public function test_student_only_sees_own_invoices(): void
    {
        $program = Program::create(['name' => 'Reguler', 'level' => 'SMP', 'is_active' => true]);
        $studentA = Student::create(['name' => 'Murid A', 'program_id' => $program->id, 'parent_contact' => '081111111111', 'is_active' => true]);
        $studentB = Student::create(['name' => 'Murid B', 'program_id' => $program->id, 'parent_contact' => '082222222222', 'is_active' => true]);
        Invoice::create(['invoice_no' => 'INV-A', 'student_id' => $studentA->id, 'amount' => 100000, 'status' => 'unpaid']);
        Invoice::create(['invoice_no' => 'INV-B', 'student_id' => $studentB->id, 'amount' => 200000, 'status' => 'unpaid']);

        $accountA = $this->makeAccount('student', [
            'contact' => '081111111111',
            'student_id' => $studentA->id,
        ]);

        $response = $this->actingAs($accountA, 'portal')->get(route('portal.invoices'));

        $response->assertSuccessful();
        $response->assertInertia(fn ($page) => $page
            ->component('Portal/Invoices', false)
            ->has('invoices', 1)
            ->where('invoices.0.invoice_no', 'INV-A')
        );
    }

    public function test_teacher_only_manages_own_classes(): void
    {
        $program = Program::create(['name' => 'Reguler', 'level' => 'SMP', 'is_active' => true]);
        $teacherA = Teacher::create(['name' => 'Guru A', 'contact' => '081111111111', 'is_active' => true]);
        $teacherB = Teacher::create(['name' => 'Guru B', 'contact' => '082222222222', 'is_active' => true]);
        $classA = ClassGroup::create(['program_id' => $program->id, 'teacher_id' => $teacherA->id, 'name' => 'Kelas A', 'is_active' => true]);
        $classB = ClassGroup::create(['program_id' => $program->id, 'teacher_id' => $teacherB->id, 'name' => 'Kelas B', 'is_active' => true]);

        $accountA = $this->makeAccount('teacher', [
            'contact' => '081111111111',
            'teacher_id' => $teacherA->id,
        ]);

        $dashboard = $this->actingAs($accountA, 'portal')->get(route('portal.dashboard'));
        $dashboard->assertInertia(fn ($page) => $page
            ->has('summary.classes', 1)
            ->where('summary.classes.0.name', 'Kelas A')
        );

        $forbidden = $this->actingAs($accountA, 'portal')->get(route('portal.classes.show', $classB));
        $forbidden->assertForbidden();

        $forbiddenPost = $this->actingAs($accountA, 'portal')->post(
            route('portal.classes.attendance.store', $classB),
            ['date' => now()->toDateString(), 'rows' => []]
        );
        $forbiddenPost->assertForbidden();
    }

    public function test_teacher_loses_access_after_class_reassigned(): void
    {
        $program = Program::create(['name' => 'Reguler', 'level' => 'SMP', 'is_active' => true]);
        $teacherA = Teacher::create(['name' => 'Guru A', 'contact' => '081111111111', 'is_active' => true]);
        $teacherB = Teacher::create(['name' => 'Guru B', 'contact' => '082222222222', 'is_active' => true]);
        $class = ClassGroup::create(['program_id' => $program->id, 'teacher_id' => $teacherA->id, 'name' => 'Kelas A', 'is_active' => true]);

        $accountA = $this->makeAccount('teacher', ['contact' => '081111111111', 'teacher_id' => $teacherA->id]);

        $this->actingAs($accountA, 'portal')->get(route('portal.classes.show', $class))->assertSuccessful();

        $class->update(['teacher_id' => $teacherB->id]);

        $this->actingAs($accountA, 'portal')->get(route('portal.classes.show', $class))->assertForbidden();
    }

    public function test_portal_user_cannot_access_admin(): void
    {
        $account = $this->makeAccount();

        $response = $this->actingAs($account, 'portal')->get(route('admin.dashboard'));

        $response->assertRedirect(route('login'));
    }

    public function test_admin_user_cannot_access_portal(): void
    {
        $admin = $this->actingAsAdmin();

        $response = $this->actingAs($admin, PermissionCatalog::GUARD)->get(route('portal.dashboard'));

        $response->assertRedirect(route('portal.login'));
    }

    public function test_portal_guest_redirects_to_portal_login(): void
    {
        $response = $this->get(route('portal.dashboard'));

        $response->assertRedirect(route('portal.login'));
    }

    public function test_unified_login_page_authenticates_admin_user(): void
    {
        $admin = $this->actingAsAdmin();
        auth('admin')->logout();
        auth('web')->logout();

        $response = $this->post(route('login.store'), [
            'identity' => $admin->email,
            'password' => 'password',
        ]);

        $response->assertRedirect(route('admin.dashboard'));
        $this->assertAuthenticatedAs($admin, 'admin');
    }

    public function test_unified_login_page_authenticates_portal_parent_by_email(): void
    {
        $account = $this->makeAccount('parent', [
            'email' => 'wali.murid@example.com',
            'contact' => '081233334444',
            'password' => Hash::make('rahasia123'),
            'must_change_password' => false,
        ]);

        $response = $this->post(route('login.store'), [
            'identity' => 'wali.murid@example.com',
            'password' => 'rahasia123',
        ]);

        $response->assertRedirect(route('portal.dashboard'));
        $this->assertAuthenticatedAs($account, 'portal');
    }

    public function test_unified_login_page_authenticates_portal_parent_by_phone(): void
    {
        $account = $this->makeAccount('parent', [
            'email' => 'wali.phone@example.com',
            'contact' => '081255556666',
            'password' => Hash::make('rahasia123'),
            'must_change_password' => false,
        ]);

        $response = $this->post(route('login.store'), [
            'identity' => '0812-5555-6666',
            'password' => 'rahasia123',
        ]);

        $response->assertRedirect(route('portal.dashboard'));
        $this->assertAuthenticatedAs($account, 'portal');
    }

    public function test_parent_can_upload_payment_proof_in_portal(): void
    {
        Storage::fake('public');
        $program = Program::create(['name' => 'Reguler', 'level' => 'SMP', 'is_active' => true]);
        $student = Student::create([
            'name' => 'Anak Portal',
            'program_id' => $program->id,
            'parent_contact' => '081234567890',
            'is_active' => true,
        ]);
        $invoice = Invoice::create([
            'invoice_no' => 'INV-2026-99001',
            'student_id' => $student->id,
            'program_id' => $program->id,
            'amount' => 500000,
            'status' => 'unpaid',
            'due_date' => now()->addDays(7)->toDateString(),
        ]);

        $account = $this->makeAccount('parent', [
            'contact' => '081234567890',
            'student_id' => $student->id,
        ]);

        $response = $this->actingAs($account, 'portal')->post(
            route('portal.invoices.pay', $invoice),
            [
                'proof' => UploadedFile::fake()->image('bukti_transfer.jpg'),
                'note' => 'Transfer via BCA an Fulan',
            ]
        );

        $response->assertRedirect();
        $response->assertSessionHas('success');
        $this->assertEquals('pending', $invoice->fresh()->status);
        $this->assertDatabaseHas('payments', [
            'invoice_id' => $invoice->id,
            'status' => 'pending',
            'note' => 'Transfer via BCA an Fulan',
        ]);
    }

    public function test_parent_cannot_upload_payment_proof_for_unowned_invoice(): void
    {
        Storage::fake('public');
        $program = Program::create(['name' => 'Reguler', 'level' => 'SMP', 'is_active' => true]);
        $studentA = Student::create(['name' => 'Murid A', 'program_id' => $program->id, 'parent_contact' => '081111111111', 'is_active' => true]);
        $studentB = Student::create(['name' => 'Murid B', 'program_id' => $program->id, 'parent_contact' => '082222222222', 'is_active' => true]);

        $invoiceB = Invoice::create([
            'invoice_no' => 'INV-2026-99002',
            'student_id' => $studentB->id,
            'amount' => 200000,
            'status' => 'unpaid',
        ]);

        $accountA = $this->makeAccount('parent', [
            'contact' => '081111111111',
            'student_id' => $studentA->id,
        ]);

        $response = $this->actingAs($accountA, 'portal')->post(
            route('portal.invoices.pay', $invoiceB),
            [
                'proof' => UploadedFile::fake()->image('bukti.jpg'),
            ]
        );

        $response->assertForbidden();
    }

    public function test_parent_cannot_upload_payment_for_already_paid_invoice(): void
    {
        Storage::fake('public');
        $program = Program::create(['name' => 'Reguler', 'level' => 'SMP', 'is_active' => true]);
        $student = Student::create(['name' => 'Murid Lunas', 'program_id' => $program->id, 'parent_contact' => '081234567890', 'is_active' => true]);
        $invoice = Invoice::create([
            'invoice_no' => 'INV-2026-99003',
            'student_id' => $student->id,
            'amount' => 300000,
            'status' => 'paid',
            'paid_at' => now(),
        ]);

        $account = $this->makeAccount('parent', [
            'contact' => '081234567890',
            'student_id' => $student->id,
        ]);

        $response = $this->actingAs($account, 'portal')->post(
            route('portal.invoices.pay', $invoice),
            [
                'proof' => UploadedFile::fake()->image('bukti.jpg'),
            ]
        );

        $response->assertSessionHas('error');
    }

    public function test_teacher_can_manage_schedule_and_record_attendance_on_any_date_in_portal(): void
    {
        $program = Program::create(['name' => 'Reguler', 'level' => 'SMP', 'is_active' => true]);
        $teacher = Teacher::create(['name' => 'Guru Hebat', 'contact' => '081233333333', 'is_active' => true]);
        $class = ClassGroup::create([
            'program_id' => $program->id,
            'teacher_id' => $teacher->id,
            'name' => 'Kelas Hebat',
            'is_active' => true,
        ]);
        $student = Student::create([
            'name' => 'Anak Hebat',
            'program_id' => $program->id,
            'parent_contact' => '081244444444',
            'is_active' => true,
        ]);
        $class->members()->create([
            'student_id' => $student->id,
            'status' => 'active',
        ]);

        $teacherAccount = $this->makeAccount('teacher', [
            'contact' => '081233333333',
            'teacher_id' => $teacher->id,
        ]);

        // Teacher adds schedule
        $schResponse = $this->actingAs($teacherAccount, 'portal')->post(
            route('portal.classes.schedules.store', $class),
            [
                'day_of_week' => 1,
                'start_time' => '15:00',
                'end_time' => '16:30',
            ]
        );
        $schResponse->assertRedirect();
        $this->assertDatabaseHas('schedules', [
            'class_group_id' => $class->id,
            'day_of_week' => 1,
        ]);

        // Teacher records attendance on upcoming/future date (e.g. 5 days from now)
        $futureDate = now()->addDays(5)->toDateString();
        $attResponse = $this->actingAs($teacherAccount, 'portal')->post(
            route('portal.classes.attendance.store', $class),
            [
                'date' => $futureDate,
                'rows' => [
                    ['student_id' => $student->id, 'status' => 'hadir'],
                ],
            ]
        );
        $attResponse->assertRedirect();
        $this->assertEquals(1, Attendance::query()
            ->where('class_group_id', $class->id)
            ->where('student_id', $student->id)
            ->whereDate('date', $futureDate)
            ->where('status', 'hadir')
            ->count());

        // Teacher generates sessions with custom dates
        $genResponse = $this->actingAs($teacherAccount, 'portal')->post(
            route('portal.classes.sessions.generate', $class),
            ['dates' => ['2026-10-18', '2026-10-25']]
        );
        $genResponse->assertRedirect();
        $this->assertEquals(3, Attendance::query()->where('class_group_id', $class->id)->count());
        $this->assertEquals('belum_absen', Attendance::query()->where('class_group_id', $class->id)->whereDate('date', '2026-10-18')->first()->status);
    }
}
