<?php

namespace Tests\Feature;

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
use Illuminate\Support\Facades\Hash;
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
            ->where('type', 'student')
            ->where('contact', '081234567890')
            ->first();

        $this->assertNotNull($account);
        $this->assertTrue($account->must_change_password);
        $this->assertTrue($account->is_active);

        $log = NotificationLog::query()
            ->where('event', 'approved')
            ->where('registration_id', $reg->id)
            ->first();
        $this->assertNotNull($log);
        $this->assertStringContainsString('Akun portal', $log->message);
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
            ->where('type', 'student')
            ->where('contact', '081234567890')
            ->count());
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
}
