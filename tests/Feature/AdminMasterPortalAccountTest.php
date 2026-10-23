<?php

namespace Tests\Feature;

use App\Mail\PortalAccountInformationMail;
use App\Models\PortalAccount;
use App\Models\Program;
use App\Models\Role;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\User;
use App\Support\PermissionCatalog;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class AdminMasterPortalAccountTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_creates_student_and_parent_portal_account_from_master_data(): void
    {
        Mail::fake();
        $admin = $this->actingAsAdmin();
        $program = Program::create(['name' => 'Reguler', 'level' => 'SD', 'is_active' => true]);

        $response = $this->actingAs($admin, PermissionCatalog::GUARD)
            ->post(route('admin.students.store'), [
                'name' => 'Ahmad Fauzi',
                'address' => 'Jl. Pendidikan No. 1',
                'school_name' => 'SD Negeri 1',
                'level' => 'SD',
                'class_level' => 'Kelas 5',
                'subjects' => 'Matematika',
                'program_id' => $program->id,
                'parent_contact' => '0812-3456-7890',
                'parent_email' => 'wali.ahmad@example.com',
                'preferred_mode' => 'offline',
                'temporary_password' => 'Sementara123',
                'temporary_password_confirmation' => 'Sementara123',
            ]);

        $response->assertRedirect()->assertSessionHas('success');

        $student = Student::query()->where('name', 'Ahmad Fauzi')->firstOrFail();
        $account = PortalAccount::query()->where('email', 'wali.ahmad@example.com')->firstOrFail();

        $this->assertSame($account->id, $student->parent_portal_account_id);
        $this->assertSame($admin->id, $student->created_by);
        $this->assertTrue(Hash::check('Sementara123', $account->password));
        $this->assertTrue($account->must_change_password);

        Mail::assertSent(PortalAccountInformationMail::class, fn (PortalAccountInformationMail $mail): bool => $mail->hasTo('wali.ahmad@example.com')
            && $mail->temporaryPassword === 'Sementara123');
    }

    public function test_second_student_is_linked_to_existing_parent_without_replacing_password(): void
    {
        Mail::fake();
        $admin = $this->actingAsAdmin();
        $program = Program::create(['name' => 'Reguler', 'level' => 'SD', 'is_active' => true]);
        $account = PortalAccount::create([
            'type' => PortalAccount::TYPE_PARENT,
            'name' => 'Orang Tua Ahmad',
            'email' => 'wali@example.com',
            'contact' => '081234567890',
            'password' => Hash::make('PasswordLama'),
            'must_change_password' => false,
            'is_active' => true,
        ]);

        $this->actingAs($admin, PermissionCatalog::GUARD)
            ->post(route('admin.students.store'), [
                'name' => 'Adik Ahmad',
                'address' => 'Jl. Pendidikan No. 1',
                'school_name' => 'SD Negeri 1',
                'level' => 'SD',
                'subjects' => 'IPA',
                'program_id' => $program->id,
                'parent_contact' => '081234567890',
                'parent_email' => 'wali@example.com',
                'temporary_password' => 'TidakDipakai123',
                'temporary_password_confirmation' => 'TidakDipakai123',
            ])
            ->assertRedirect()
            ->assertSessionHas('success');

        $this->assertSame(1, PortalAccount::query()->where('email', 'wali@example.com')->count());
        $this->assertSame($account->id, Student::query()->where('name', 'Adik Ahmad')->firstOrFail()->parent_portal_account_id);
        $this->assertTrue(Hash::check('PasswordLama', $account->fresh()->password));

        Mail::assertSent(PortalAccountInformationMail::class, fn (PortalAccountInformationMail $mail): bool => $mail->temporaryPassword === null);
    }

    public function test_admin_creates_teacher_and_teacher_portal_account_from_master_data(): void
    {
        Mail::fake();
        $admin = $this->actingAsAdmin();

        $this->actingAs($admin, PermissionCatalog::GUARD)
            ->post(route('admin.teachers.store'), [
                'name' => 'Dewi Lestari',
                'email' => 'dewi@example.com',
                'address' => 'Jl. Guru No. 1',
                'education' => 'S1 Pendidikan',
                'subjects' => 'Bahasa Inggris',
                'contact' => '081234567899',
                'temporary_password' => 'GuruBaru123',
                'temporary_password_confirmation' => 'GuruBaru123',
            ])
            ->assertRedirect()
            ->assertSessionHas('success');

        $teacher = Teacher::query()->where('email', 'dewi@example.com')->firstOrFail();
        $account = PortalAccount::query()->where('email', 'dewi@example.com')->firstOrFail();

        $this->assertSame($teacher->id, $account->teacher_id);
        $this->assertTrue(Hash::check('GuruBaru123', $account->password));
        Mail::assertSent(PortalAccountInformationMail::class);
    }

    public function test_reset_creates_missing_legacy_account_and_resend_keeps_password_private(): void
    {
        Mail::fake();
        $admin = $this->actingAsAdmin();
        $program = Program::create(['name' => 'Reguler', 'level' => 'SMP', 'is_active' => true]);
        $student = Student::create([
            'name' => 'Pelajar Lama',
            'program_id' => $program->id,
            'parent_contact' => '081234567898',
            'parent_email' => 'wali.lama@example.com',
            'is_active' => true,
        ]);

        $this->actingAs($admin, PermissionCatalog::GUARD)
            ->patch(route('admin.students.portal-password', $student), [
                'password' => 'PasswordBaru123',
                'password_confirmation' => 'PasswordBaru123',
            ])
            ->assertRedirect()
            ->assertSessionHas('success');

        $account = $student->fresh()->parentAccount;
        $this->assertNotNull($account);
        $this->assertTrue(Hash::check('PasswordBaru123', $account->password));

        Mail::assertSent(PortalAccountInformationMail::class, fn (PortalAccountInformationMail $mail): bool => $mail->temporaryPassword === 'PasswordBaru123');

        Mail::fake();

        $this->actingAs($admin, PermissionCatalog::GUARD)
            ->post(route('admin.students.portal-information', $student))
            ->assertRedirect()
            ->assertSessionHas('success');

        Mail::assertSent(PortalAccountInformationMail::class, fn (PortalAccountInformationMail $mail): bool => $mail->hasTo('wali.lama@example.com')
            && $mail->temporaryPassword === null);
    }

    private function actingAsAdmin(): User
    {
        $role = Role::create([
            'name' => 'administrator',
            'label' => 'Administrator',
            'guard_name' => PermissionCatalog::GUARD,
        ]);

        $user = User::factory()->create();
        $user->assignRole($role);

        return $user;
    }
}
