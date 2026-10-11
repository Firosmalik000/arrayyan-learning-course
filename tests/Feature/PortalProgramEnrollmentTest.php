<?php

namespace Tests\Feature;

use App\Models\ClassGroup;
use App\Models\Invoice;
use App\Models\Package;
use App\Models\Program;
use App\Models\Role;
use App\Models\Schedule;
use App\Models\Student;
use App\Models\StudentRegistration;
use App\Models\User;
use App\Support\AcademicService;
use App\Support\PermissionCatalog;
use App\Support\PortalAccountService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PortalProgramEnrollmentTest extends TestCase
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

    public function test_parent_can_submit_additional_program_enrollment_for_selected_student(): void
    {
        $programPrivat = Program::create([
            'name' => 'Bimbel Privat',
            'level' => 'SMA',
            'price' => 500000,
            'is_active' => true,
        ]);
        $pkgMath = Package::create([
            'program_id' => $programPrivat->id,
            'name' => 'Privat 8 Sesi',
            'level' => 'SMA',
            'sessions' => 8,
            'price' => 500000,
            'is_active' => true,
        ]);

        $programReguler = Program::create([
            'name' => 'Bimbel Reguler SNBT',
            'level' => 'SMA',
            'price' => 800000,
            'is_active' => true,
        ]);
        $pkgReg = Package::create([
            'program_id' => $programReguler->id,
            'name' => 'Reguler 12 Sesi',
            'level' => 'SMA',
            'sessions' => 12,
            'price' => 800000,
            'is_active' => true,
        ]);

        $student = Student::create([
            'name' => 'Ahmad Rafi',
            'school_name' => 'SMA 1',
            'level' => 'SMA',
            'class_level' => 'Kelas 12',
            'subjects' => 'Matematika',
            'program_id' => $programPrivat->id,
            'package_id' => $pkgMath->id,
            'parent_contact' => '081234567890',
            'parent_email' => 'wali.rafi@example.com',
            'is_active' => true,
        ]);

        $portalResult = PortalAccountService::createOrLinkForStudent($student, 'wali.rafi@example.com');
        $this->assertNotNull($portalResult);
        $parentAccount = $portalResult['account'];
        $parentAccount->update(['must_change_password' => false]);

        $response = $this->actingAs($parentAccount, 'portal')
            ->post(route('portal.programs.store'), [
                'program_id' => $programReguler->id,
                'package_id' => $pkgReg->id,
                'subjects' => 'Tes Potensi Skolastik (TPS)',
                'preferred_mode' => 'offline',
                'notes' => 'Ingin mulai minggu depan',
            ]);

        $response->assertSessionHasNoErrors();
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('student_registrations', [
            'student_id' => $student->id,
            'student_name' => 'Ahmad Rafi',
            'parent_contact' => '081234567890',
            'parent_email' => 'wali.rafi@example.com',
            'program_id' => $programReguler->id,
            'package_id' => $pkgReg->id,
            'subjects' => 'Tes Potensi Skolastik (TPS)',
            'status' => 'pending',
        ]);

        // Dashboard now reflects the pending registration
        $dashResponse = $this->actingAs($parentAccount, 'portal')->get(route('portal.dashboard'));
        $dashResponse->assertSuccessful();
        $dashResponse->assertInertia(fn ($page) => $page
            ->component('Portal/Dashboard')
            ->has('summary.pending_registrations', 1)
            ->where('summary.pending_registrations.0.subjects', 'Tes Potensi Skolastik (TPS)')
        );
    }

    public function test_parent_portal_program_enrollment_validates_required_fields(): void
    {
        $student = Student::create([
            'name' => 'Dewi',
            'level' => 'SMP',
            'parent_contact' => '081234567890',
            'parent_email' => 'wali.dewi@example.com',
            'is_active' => true,
        ]);

        $portalResult = PortalAccountService::createOrLinkForStudent($student, 'wali.dewi@example.com');
        $parentAccount = $portalResult['account'];
        $parentAccount->update(['must_change_password' => false]);

        $response = $this->actingAs($parentAccount, 'portal')
            ->post(route('portal.programs.store'), [
                'program_id' => '',
                'subjects' => '',
            ]);

        $response->assertSessionHasErrors(['program_id', 'subjects']);
    }

    public function test_admin_approving_enrollment_links_existing_student_without_duplicating_and_creates_invoice(): void
    {
        $admin = $this->actingAsAdmin();

        $programPrivat = Program::create([
            'name' => 'Bimbel Privat',
            'level' => 'SMA',
            'price' => 500000,
            'is_active' => true,
        ]);
        $pkgEnglish = Package::create([
            'program_id' => $programPrivat->id,
            'name' => 'Privat 8 Sesi',
            'level' => 'SMA',
            'sessions' => 8,
            'price' => 500000,
            'is_active' => true,
        ]);

        $student = Student::create([
            'name' => 'Siti Aisyah',
            'school_name' => 'SMA 2',
            'level' => 'SMA',
            'class_level' => 'Kelas 11',
            'subjects' => 'Matematika',
            'program_id' => $programPrivat->id,
            'parent_contact' => '081299998888',
            'parent_email' => 'wali.aisyah@example.com',
            'is_active' => true,
        ]);

        $registration = StudentRegistration::create([
            'student_id' => $student->id,
            'registration_no' => 'ALC-2026-99999',
            'student_name' => 'Siti Aisyah',
            'address' => 'Jl. Mawar',
            'school_name' => 'SMA 2',
            'level' => 'SMA',
            'class_level' => 'Kelas 11',
            'subjects' => 'Bahasa Inggris',
            'program_id' => $programPrivat->id,
            'package_id' => $pkgEnglish->id,
            'program' => $programPrivat->name,
            'package' => $pkgEnglish->displayName(),
            'parent_contact' => '081299998888',
            'parent_email' => 'wali.aisyah@example.com',
            'preferred_mode' => 'offline',
            'status' => 'pending',
        ]);

        $response = $this->actingAs($admin, PermissionCatalog::GUARD)
            ->post(route('admin.registrations.student.approve', $registration));

        $response->assertSessionHas('success');

        // Only 1 Student row must exist
        $this->assertEquals(1, Student::query()->where('name', 'Siti Aisyah')->count());

        // Registration is approved and linked to student
        $this->assertDatabaseHas('student_registrations', [
            'id' => $registration->id,
            'status' => 'approved',
            'student_id' => $student->id,
        ]);

        // Invoice was created for this registration
        $this->assertDatabaseHas('invoices', [
            'student_registration_id' => $registration->id,
            'student_id' => $student->id,
            'program_id' => $programPrivat->id,
            'amount' => 500000,
            'status' => 'unpaid',
        ]);

        // Student's subjects includes Bahasa Inggris
        $this->assertStringContainsString('Bahasa Inggris', (string) $student->fresh()->subjects);
    }

    public function test_student_can_be_added_to_multiple_classes_in_same_program(): void
    {
        $programPrivat = Program::create([
            'name' => 'Bimbel Privat',
            'level' => 'SMP',
            'price' => 600000,
            'is_active' => true,
        ]);

        $student = Student::create([
            'name' => 'Budi Santoso',
            'school_name' => 'SMP 1',
            'level' => 'SMP',
            'class_level' => 'Kelas 8',
            'subjects' => 'Matematika, IPA',
            'program_id' => $programPrivat->id,
            'parent_contact' => '081211112222',
            'parent_email' => 'wali.budi@example.com',
            'is_active' => true,
        ]);

        // Mark invoice as paid
        Invoice::create([
            'invoice_no' => 'INV-TEST-001',
            'student_id' => $student->id,
            'program_id' => $programPrivat->id,
            'amount' => 600000,
            'status' => Invoice::STATUS_PAID,
            'paid_at' => now(),
        ]);

        // 2 approved registrations for Privat Math & Privat IPA
        StudentRegistration::create([
            'student_id' => $student->id,
            'registration_no' => 'ALC-2026-REG-01',
            'student_name' => 'Budi Santoso',
            'level' => 'SMP',
            'subjects' => 'Matematika',
            'program_id' => $programPrivat->id,
            'parent_contact' => '081211112222',
            'status' => 'approved',
        ]);

        StudentRegistration::create([
            'student_id' => $student->id,
            'registration_no' => 'ALC-2026-REG-02',
            'student_name' => 'Budi Santoso',
            'level' => 'SMP',
            'subjects' => 'IPA',
            'program_id' => $programPrivat->id,
            'parent_contact' => '081211112222',
            'status' => 'approved',
        ]);

        $classMath = ClassGroup::create([
            'program_id' => $programPrivat->id,
            'name' => 'Privat Matematika Budi',
            'quota' => 5,
            'is_active' => true,
        ]);
        Schedule::create([
            'class_group_id' => $classMath->id,
            'day_of_week' => 1, // Senin
            'start_time' => '16:00',
            'end_time' => '17:30',
        ]);

        $classIpa = ClassGroup::create([
            'program_id' => $programPrivat->id,
            'name' => 'Privat IPA Budi',
            'quota' => 5,
            'is_active' => true,
        ]);
        Schedule::create([
            'class_group_id' => $classIpa->id,
            'day_of_week' => 3, // Rabu
            'start_time' => '16:00',
            'end_time' => '17:30',
        ]);

        // Add to first class
        $member1 = AcademicService::addMember($classMath, $student->id);
        $this->assertEquals('active', $member1->status);

        // Add to second class under same program (should succeed!)
        $member2 = AcademicService::addMember($classIpa, $student->id);
        $this->assertEquals('active', $member2->status);

        // Verify both memberships exist
        $this->assertEquals(2, $student->classMembers()->where('status', 'active')->count());

        // Verify schedules in portal
        $portalResult = PortalAccountService::createOrLinkForStudent($student, 'wali.budi@example.com');
        $parentAccount = $portalResult['account'];
        $parentAccount->update(['must_change_password' => false]);

        $response = $this->actingAs($parentAccount, 'portal')->get(route('portal.schedule'));
        $response->assertSuccessful();
        $response->assertInertia(fn ($page) => $page
            ->component('Portal/Schedule')
            ->has('schedules', 2)
        );
    }
}
