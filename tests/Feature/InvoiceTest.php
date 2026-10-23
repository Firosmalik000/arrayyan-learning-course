<?php

namespace Tests\Feature;

use App\Models\ClassGroup;
use App\Models\ClassMember;
use App\Models\Invoice;
use App\Models\NotificationLog;
use App\Models\Package;
use App\Models\Payment;
use App\Models\Program;
use App\Models\Role;
use App\Models\Student;
use App\Models\StudentRegistration;
use App\Models\User;
use App\Support\AcademicService;
use App\Support\PermissionCatalog;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class InvoiceTest extends TestCase
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

    private function approvedRegistration(int $price = 350000): StudentRegistration
    {
        $program = Program::create([
            'name' => 'Reguler',
            'level' => 'SMP',
            'price' => $price,
            'is_active' => true,
        ]);

        return StudentRegistration::factory()->create([
            'student_name' => 'Anak Bayar',
            'parent_contact' => '081234567890',
            'program_id' => $program->id,
            'program' => 'Reguler',
            'registration_no' => 'ALC-2026-01001',
            'status' => 'approved',
            'approved_at' => now(),
        ]);
    }

    /**
     * @return array{program: Program, package: Package, student: Student, class: ClassGroup, member: ClassMember}
     */
    private function monthlyBillingFixture(bool $isScholarship = false, string $studentName = 'Anak Bulanan'): array
    {
        $program = Program::create([
            'name' => 'Program Bulanan '.$studentName,
            'level' => 'SMP',
            'price' => 425000,
            'is_active' => true,
        ]);
        $package = Package::create([
            'program_id' => $program->id,
            'name' => 'Paket Bulanan '.$studentName,
            'price' => 375000,
            'is_active' => true,
        ]);
        $student = Student::create([
            'name' => $studentName,
            'program_id' => $program->id,
            'package_id' => $package->id,
            'program' => $program->name,
            'package' => $package->name,
            'parent_contact' => '081234567890',
            'is_active' => true,
        ]);
        $class = ClassGroup::create([
            'program_id' => $program->id,
            'package_id' => $package->id,
            'name' => 'Kelas Bulanan '.$studentName,
            'is_active' => true,
        ]);
        $member = ClassMember::create([
            'class_group_id' => $class->id,
            'student_id' => $student->id,
            'status' => ClassMember::STATUS_ACTIVE,
            'joined_at' => now()->toDateString(),
            'is_scholarship' => $isScholarship,
        ]);

        return compact('program', 'package', 'student', 'class', 'member');
    }

    public function test_approve_creates_exactly_one_invoice(): void
    {
        $user = $this->actingAsAdmin();
        $program = Program::create([
            'name' => 'Reguler',
            'level' => 'SMP',
            'price' => 500000,
            'is_active' => true,
        ]);
        $reg = StudentRegistration::factory()->create([
            'program_id' => $program->id,
            'status' => 'pending',
        ]);

        $this->actingAs($user, PermissionCatalog::GUARD)->post(route('admin.registrations.student.approve', $reg));

        $invoices = Invoice::query()->where('student_registration_id', $reg->id)->get();
        $this->assertCount(1, $invoices);
        $this->assertMatchesRegularExpression('/^INV-\d{4}-\d{5}$/', $invoices->first()->invoice_no);
        $this->assertEquals('unpaid', $invoices->first()->status);
        $this->assertEquals(500000, (int) $invoices->first()->amount);
        $this->assertNotNull($invoices->first()->due_date);
    }

    public function test_create_invoice_from_registration_is_idempotent(): void
    {
        $user = $this->actingAsAdmin();
        $reg = $this->approvedRegistration();

        $this->actingAs($user, PermissionCatalog::GUARD)->post(route('admin.keuangan.create-from-registration', $reg));
        $second = $this->actingAs($user, PermissionCatalog::GUARD)->post(route('admin.keuangan.create-from-registration', $reg));

        $second->assertSessionHas('success');
        $this->assertEquals(1, Invoice::query()->where('student_registration_id', $reg->id)->count());
    }

    public function test_create_invoice_rejected_for_non_approved_registration(): void
    {
        $user = $this->actingAsAdmin();
        $reg = StudentRegistration::factory()->create(['status' => 'pending']);

        $response = $this->actingAs($user, PermissionCatalog::GUARD)->post(route('admin.keuangan.create-from-registration', $reg));

        $response->assertSessionHas('error');
        $this->assertEquals(0, Invoice::query()->where('student_registration_id', $reg->id)->count());
    }

    public function test_public_upload_moves_invoice_to_pending(): void
    {
        Storage::fake('public');
        $reg = $this->approvedRegistration();
        $invoice = Invoice::create([
            'invoice_no' => 'INV-2026-00001',
            'student_registration_id' => $reg->id,
            'program_id' => $reg->program_id,
            'amount' => 350000,
            'status' => 'unpaid',
            'due_date' => now()->addDays(7)->toDateString(),
        ]);

        $response = $this->post(route('bayar.upload', $invoice), [
            'phone' => '0812-3456-7890',
            'proof' => UploadedFile::fake()->image('bukti.jpg'),
            'note' => 'Transfer BCA',
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');
        $this->assertEquals('pending', $invoice->fresh()->status);
        $this->assertDatabaseHas('payments', [
            'invoice_id' => $invoice->id,
            'status' => 'pending',
        ]);
        $this->assertDatabaseHas('notification_logs', [
            'event' => 'payment',
            'recipient' => '081234567890',
            'status' => 'sent',
        ]);
    }

    public function test_public_upload_rejects_invalid_file_and_wrong_phone(): void
    {
        Storage::fake('public');
        $reg = $this->approvedRegistration();
        $invoice = Invoice::create([
            'invoice_no' => 'INV-2026-00002',
            'student_registration_id' => $reg->id,
            'amount' => 350000,
            'status' => 'unpaid',
        ]);

        $badFile = $this->post(route('bayar.upload', $invoice), [
            'phone' => '081234567890',
            'proof' => UploadedFile::fake()->create('bukti.txt', 100, 'text/plain'),
        ]);
        $badFile->assertSessionHasErrors('proof');

        $badPhone = $this->post(route('bayar.upload', $invoice), [
            'phone' => '089999999999',
            'proof' => UploadedFile::fake()->image('bukti.jpg'),
        ]);
        $badPhone->assertSessionHasErrors('phone');

        $this->assertEquals('unpaid', $invoice->fresh()->status);
        $this->assertEquals(0, Payment::query()->where('invoice_id', $invoice->id)->count());
    }

    public function test_verify_marks_invoice_paid_and_notifies(): void
    {
        $user = $this->actingAsAdmin();
        $reg = $this->approvedRegistration();
        $invoice = Invoice::create([
            'invoice_no' => 'INV-2026-00003',
            'student_registration_id' => $reg->id,
            'amount' => 350000,
            'status' => 'pending',
        ]);
        $payment = Payment::create([
            'invoice_id' => $invoice->id,
            'proof_path' => 'payment-proofs/bukti.jpg',
            'status' => 'pending',
        ]);

        $response = $this->actingAs($user, PermissionCatalog::GUARD)->post(route('admin.keuangan.verify', $payment));

        $response->assertRedirect();
        $this->assertEquals('paid', $invoice->fresh()->status);
        $this->assertNotNull($invoice->fresh()->paid_at);
        $this->assertEquals('verified', $payment->fresh()->status);
        $this->assertEquals($user->id, $payment->fresh()->verified_by);
        $this->assertDatabaseHas('notification_logs', [
            'event' => 'paid',
            'recipient' => '081234567890',
            'status' => 'sent',
        ]);
    }

    public function test_decline_returns_invoice_to_unpaid_with_note(): void
    {
        $user = $this->actingAsAdmin();
        $reg = $this->approvedRegistration();
        $invoice = Invoice::create([
            'invoice_no' => 'INV-2026-00004',
            'student_registration_id' => $reg->id,
            'amount' => 350000,
            'status' => 'pending',
        ]);
        $payment = Payment::create([
            'invoice_id' => $invoice->id,
            'proof_path' => 'payment-proofs/bukti.jpg',
            'status' => 'pending',
        ]);

        $response = $this->actingAs($user, PermissionCatalog::GUARD)->post(
            route('admin.keuangan.decline', $payment),
            ['note' => 'Bukti buram.']
        );

        $response->assertRedirect();
        $this->assertEquals('unpaid', $invoice->fresh()->status);
        $this->assertEquals('rejected', $payment->fresh()->status);
        $this->assertEquals('Bukti buram.', $payment->fresh()->note);
    }

    public function test_verify_twice_is_blocked(): void
    {
        $user = $this->actingAsAdmin();
        $reg = $this->approvedRegistration();
        $invoice = Invoice::create([
            'invoice_no' => 'INV-2026-00005',
            'student_registration_id' => $reg->id,
            'amount' => 350000,
            'status' => 'pending',
        ]);
        $payment = Payment::create([
            'invoice_id' => $invoice->id,
            'proof_path' => 'payment-proofs/bukti.jpg',
            'status' => 'pending',
        ]);

        $this->actingAs($user, PermissionCatalog::GUARD)->post(route('admin.keuangan.verify', $payment));
        $second = $this->actingAs($user, PermissionCatalog::GUARD)->post(route('admin.keuangan.verify', $payment->fresh()));

        $second->assertSessionHas('error');
        $this->assertEquals('paid', $invoice->fresh()->status);
    }

    public function test_expire_command_marks_only_overdue_unpaid(): void
    {
        $reg = $this->approvedRegistration();
        $overdue = Invoice::create([
            'invoice_no' => 'INV-2026-00006',
            'student_registration_id' => $reg->id,
            'amount' => 100000,
            'status' => 'unpaid',
            'due_date' => now()->subDay()->toDateString(),
        ]);
        $pendingProof = Invoice::create([
            'invoice_no' => 'INV-2026-00007',
            'student_registration_id' => $reg->id,
            'amount' => 100000,
            'status' => 'pending',
            'due_date' => now()->subDay()->toDateString(),
        ]);
        $future = Invoice::create([
            'invoice_no' => 'INV-2026-00008',
            'student_registration_id' => $reg->id,
            'amount' => 100000,
            'status' => 'unpaid',
            'due_date' => now()->addDay()->toDateString(),
        ]);

        $this->artisan('invoices:expire-overdue')->assertSuccessful();

        $this->assertEquals('expired', $overdue->fresh()->status);
        $this->assertEquals('pending', $pendingProof->fresh()->status);
        $this->assertEquals('unpaid', $future->fresh()->status);
    }

    public function test_admin_keuangan_page_renders_with_filter(): void
    {
        $user = $this->actingAsAdmin();
        $reg = $this->approvedRegistration();
        Invoice::create([
            'invoice_no' => 'INV-2026-00009',
            'student_registration_id' => $reg->id,
            'amount' => 350000,
            'status' => 'unpaid',
        ]);

        $response = $this->actingAs($user, PermissionCatalog::GUARD)->get(route('admin.keuangan'));

        $response->assertSuccessful();
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Invoices', false)
            ->has('students.data', 0)
            ->has('unlinked_invoices', 1)
            ->where('stats.unpaid', 1)
        );

        $filtered = $this->actingAs($user, PermissionCatalog::GUARD)->get(route('admin.keuangan', [
            'status' => 'paid',
        ]));

        $filtered->assertSuccessful();
        $filtered->assertInertia(fn ($page) => $page
            ->component('Admin/Invoices', false)
            ->has('students.data', 0)
            ->has('unlinked_invoices', 0)
        );
    }

    public function test_admin_can_create_an_idempotent_monthly_invoice_for_a_class_member(): void
    {
        $this->travelTo(Carbon::parse('2026-10-23 10:00:00'));
        $user = $this->actingAsAdmin();
        $fixture = $this->monthlyBillingFixture();
        $payload = [
            'billing_month' => '2026-10',
            'due_date' => '2026-10-28',
            'notes' => 'Tagihan Oktober',
        ];

        $first = $this->actingAs($user, PermissionCatalog::GUARD)->post(
            route('admin.keuangan.monthly.store', $fixture['member']),
            $payload,
        );
        $first->assertSessionHas('success');

        $second = $this->actingAs($user, PermissionCatalog::GUARD)->post(
            route('admin.keuangan.monthly.store', $fixture['member']),
            $payload,
        );

        $second->assertSessionHas('error');
        $this->assertDatabaseCount('invoices', 1);
        $this->assertDatabaseHas('invoices', [
            'student_id' => $fixture['student']->id,
            'class_member_id' => $fixture['member']->id,
            'class_group_id' => $fixture['class']->id,
            'billing_type' => 'monthly',
            'billing_month' => '2026-10-01 00:00:00',
            'amount' => 375000,
            'status' => Invoice::STATUS_UNPAID,
        ]);
    }

    public function test_admin_can_create_a_monthly_invoice_for_a_future_month(): void
    {
        $this->travelTo(Carbon::parse('2026-10-23 10:00:00'));
        $user = $this->actingAsAdmin();
        $fixture = $this->monthlyBillingFixture();

        $response = $this->actingAs($user, PermissionCatalog::GUARD)->post(
            route('admin.keuangan.monthly.store', $fixture['member']),
            ['billing_month' => '2026-11', 'due_date' => '2026-11-10'],
        );

        $response->assertSessionHas('success');
        $this->assertDatabaseHas('invoices', [
            'class_member_id' => $fixture['member']->id,
            'billing_month' => '2026-11-01 00:00:00',
            'status' => Invoice::STATUS_UNPAID,
        ]);
    }

    public function test_completion_month_is_billable_but_following_month_is_not(): void
    {
        $this->travelTo(Carbon::parse('2026-09-01 10:00:00'));
        $user = $this->actingAsAdmin();
        $fixture = $this->monthlyBillingFixture();

        $this->travelTo(Carbon::parse('2026-10-18 10:00:00'));
        AcademicService::completeMember($fixture['member'], false, $user->id);

        $completionMonth = $this->actingAs($user, PermissionCatalog::GUARD)->post(
            route('admin.keuangan.monthly.store', $fixture['member']),
            ['billing_month' => '2026-10', 'due_date' => '2026-10-28'],
        );
        $completionMonth->assertSessionHas('success');

        $this->travelTo(Carbon::parse('2026-11-10 10:00:00'));
        $followingMonth = $this->actingAs($user, PermissionCatalog::GUARD)->post(
            route('admin.keuangan.monthly.store', $fixture['member']),
            ['billing_month' => '2026-11', 'due_date' => '2026-11-28'],
        );

        $followingMonth->assertSessionHas('error');
        $this->assertDatabaseCount('invoices', 1);
    }

    public function test_reactivation_does_not_make_inactive_gap_billable(): void
    {
        $this->travelTo(Carbon::parse('2026-05-01 10:00:00'));
        $user = $this->actingAsAdmin();
        $fixture = $this->monthlyBillingFixture();

        $this->travelTo(Carbon::parse('2026-06-15 10:00:00'));
        AcademicService::setClassActiveStatus($fixture['class'], false);
        $this->travelTo(Carbon::parse('2026-09-01 10:00:00'));
        AcademicService::setClassActiveStatus($fixture['class']->fresh(), true);

        $gap = $this->actingAs($user, PermissionCatalog::GUARD)->post(
            route('admin.keuangan.monthly.store', $fixture['member']),
            ['billing_month' => '2026-07', 'due_date' => '2026-09-10'],
        );
        $gap->assertSessionHas('error');

        $activeAgain = $this->actingAs($user, PermissionCatalog::GUARD)->post(
            route('admin.keuangan.monthly.store', $fixture['member']),
            ['billing_month' => '2026-09', 'due_date' => '2026-09-10'],
        );

        $activeAgain->assertSessionHas('success');
        $this->assertDatabaseCount('invoices', 1);
    }

    public function test_bulk_monthly_billing_skips_scholarships_and_is_idempotent(): void
    {
        $this->travelTo(Carbon::parse('2026-10-23 10:00:00'));
        $user = $this->actingAsAdmin();
        $paying = $this->monthlyBillingFixture(false, 'Murid Bayar');
        $scholarshipStudent = Student::create([
            'name' => 'Murid Beasiswa',
            'program_id' => $paying['program']->id,
            'package_id' => $paying['package']->id,
            'parent_contact' => '081200000002',
            'is_active' => true,
        ]);
        ClassMember::create([
            'class_group_id' => $paying['class']->id,
            'student_id' => $scholarshipStudent->id,
            'status' => ClassMember::STATUS_ACTIVE,
            'joined_at' => now()->toDateString(),
            'is_scholarship' => true,
        ]);
        $payload = ['billing_month' => '2026-10', 'due_date' => '2026-10-28'];

        $first = $this->actingAs($user, PermissionCatalog::GUARD)->post(
            route('admin.keuangan.monthly.bulk-store', $paying['class']),
            $payload,
        );
        $first->assertSessionHas('success', fn (string $message): bool => str_contains($message, '1 tagihan dibuat'));

        $second = $this->actingAs($user, PermissionCatalog::GUARD)->post(
            route('admin.keuangan.monthly.bulk-store', $paying['class']),
            $payload,
        );

        $second->assertSessionHas('success', fn (string $message): bool => str_contains($message, '1 sudah tersedia'));
        $this->assertDatabaseCount('invoices', 1);
    }

    public function test_admin_can_create_monthly_invoices_for_selected_class_members_only(): void
    {
        $this->travelTo(Carbon::parse('2026-10-23 10:00:00'));
        $user = $this->actingAsAdmin();
        $first = $this->monthlyBillingFixture(false, 'Murid Pertama');
        $second = $this->monthlyBillingFixture(false, 'Murid Kedua');
        $payload = [
            'member_ids' => [$first['member']->id],
            'billing_month' => '2026-11',
            'due_date' => '2026-11-10',
        ];

        $response = $this->actingAs($user, PermissionCatalog::GUARD)->post(
            route('admin.keuangan.monthly.selected-store'),
            $payload,
        );

        $response->assertSessionHas('success', fn (string $message): bool => str_contains($message, '1 tagihan dibuat'));
        $this->assertDatabaseCount('invoices', 1);
        $this->assertDatabaseHas('invoices', [
            'class_member_id' => $first['member']->id,
            'billing_month' => '2026-11-01 00:00:00',
            'amount' => 375000,
        ]);
        $this->assertDatabaseMissing('invoices', [
            'class_member_id' => $second['member']->id,
            'billing_month' => '2026-11-01 00:00:00',
        ]);

        $repeated = $this->actingAs($user, PermissionCatalog::GUARD)->post(
            route('admin.keuangan.monthly.selected-store'),
            [...$payload, 'member_ids' => [$first['member']->id, $second['member']->id]],
        );

        $repeated->assertSessionHas('success', fn (string $message): bool => str_contains($message, '1 sudah tersedia'));
        $this->assertDatabaseCount('invoices', 2);
    }

    public function test_selected_monthly_billing_requires_at_least_one_member(): void
    {
        $user = $this->actingAsAdmin();

        $response = $this->actingAs($user, PermissionCatalog::GUARD)->post(
            route('admin.keuangan.monthly.selected-store'),
            [
                'member_ids' => [],
                'billing_month' => '2026-11',
                'due_date' => '2026-11-10',
            ],
        );

        $response->assertSessionHasErrors('member_ids');
        $this->assertDatabaseCount('invoices', 0);
    }

    public function test_collective_billing_list_keeps_one_row_per_class_membership(): void
    {
        $this->travelTo(Carbon::parse('2026-10-23 10:00:00'));
        $user = $this->actingAsAdmin();
        $fixture = $this->monthlyBillingFixture(false, 'Murid Dua Kelas');
        $secondClass = ClassGroup::create([
            'program_id' => $fixture['program']->id,
            'package_id' => $fixture['package']->id,
            'name' => 'Kelas Kedua Murid Dua Kelas',
            'is_active' => true,
        ]);
        ClassMember::create([
            'class_group_id' => $secondClass->id,
            'student_id' => $fixture['student']->id,
            'status' => ClassMember::STATUS_ACTIVE,
            'joined_at' => '2026-10-15',
            'is_scholarship' => false,
        ]);

        $response = $this->actingAs($user, PermissionCatalog::GUARD)->get(route('admin.keuangan'));

        $response->assertInertia(fn ($page) => $page
            ->has('billing_members', 2)
            ->where('billing_members.0.student_name', 'Murid Dua Kelas')
            ->where('billing_members.1.student_name', 'Murid Dua Kelas')
            ->where('billing_members.1.joined_at', '2026-10-15')
        );
    }

    public function test_finance_index_groups_monthly_history_by_student_and_class(): void
    {
        $this->travelTo(Carbon::parse('2026-10-23 10:00:00'));
        $user = $this->actingAsAdmin();
        $fixture = $this->monthlyBillingFixture();

        $this->actingAs($user, PermissionCatalog::GUARD)->post(
            route('admin.keuangan.monthly.store', $fixture['member']),
            ['billing_month' => '2026-10', 'due_date' => '2026-10-28'],
        );

        $response = $this->actingAs($user, PermissionCatalog::GUARD)->get(route('admin.keuangan', [
            'class_group_id' => $fixture['class']->id,
            'year' => '2026',
        ]));

        $response->assertSuccessful();
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Invoices', false)
            ->has('students.data', 1)
            ->where('students.data.0.name', $fixture['student']->name)
            ->where('students.data.0.classes.0.name', $fixture['class']->name)
            ->where('students.data.0.classes.0.invoices.0.billing_month', '2026-10')
            ->where('stats.total', 1)
        );
    }

    public function test_admin_can_open_student_finance_detail_as_a_separate_page(): void
    {
        $this->travelTo(Carbon::parse('2026-10-23 10:00:00'));
        $user = $this->actingAsAdmin();
        $fixture = $this->monthlyBillingFixture();

        $this->actingAs($user, PermissionCatalog::GUARD)->post(
            route('admin.keuangan.monthly.store', $fixture['member']),
            ['billing_month' => '2026-10', 'due_date' => '2026-10-28'],
        );

        $response = $this->actingAs($user, PermissionCatalog::GUARD)->get(
            route('admin.keuangan.show', $fixture['student']),
        );

        $response->assertSuccessful();
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Invoices/Show', false)
            ->where('student.name', $fixture['student']->name)
            ->has('student.classes', 1)
            ->where('student.classes.0.name', $fixture['class']->name)
            ->where('student.classes.0.invoices.0.billing_month', '2026-10')
        );
    }

    public function test_initial_paid_invoice_is_linked_to_the_first_class_month(): void
    {
        $this->travelTo(Carbon::parse('2026-10-19 10:00:00'));
        $user = $this->actingAsAdmin();
        $program = Program::create([
            'name' => 'Privat',
            'level' => 'SD',
            'price' => 400000,
            'is_active' => true,
        ]);
        $package = Package::create([
            'program_id' => $program->id,
            'name' => 'Paket Privat',
            'price' => 400000,
            'is_active' => true,
        ]);
        $student = Student::create([
            'name' => 'Murid Tagihan Awal',
            'program_id' => $program->id,
            'package_id' => $package->id,
            'parent_contact' => '081234567899',
            'is_active' => true,
        ]);
        $class = ClassGroup::create([
            'program_id' => $program->id,
            'package_id' => $package->id,
            'name' => 'Kelas Privat',
            'is_active' => true,
        ]);
        $invoice = Invoice::create([
            'invoice_no' => 'INV-2026-INITIAL',
            'student_id' => $student->id,
            'program_id' => $program->id,
            'package_id' => $package->id,
            'billing_type' => 'registration',
            'amount' => 400000,
            'status' => Invoice::STATUS_PAID,
            'paid_at' => now(),
        ]);

        $member = AcademicService::addMember($class, $student->id);

        $this->assertDatabaseHas('invoices', [
            'id' => $invoice->id,
            'class_member_id' => $member->id,
            'class_group_id' => $class->id,
            'billing_month' => '2026-10-01 00:00:00',
            'status' => Invoice::STATUS_PAID,
        ]);

        $this->actingAs($user, PermissionCatalog::GUARD)
            ->get(route('admin.keuangan.show', $student))
            ->assertInertia(fn ($page) => $page
                ->where('student.classes.0.invoices.0.invoice_no', 'INV-2026-INITIAL')
                ->where('student.classes.0.invoices.0.status', Invoice::STATUS_PAID)
                ->where('student.classes.0.invoices.0.billing_month', '2026-10')
                ->has('student.classes.0.lifecycles', 1)
            );
    }

    public function test_status_check_includes_invoices(): void
    {
        $reg = $this->approvedRegistration();
        Invoice::create([
            'invoice_no' => 'INV-2026-00010',
            'student_registration_id' => $reg->id,
            'amount' => 350000,
            'status' => 'unpaid',
            'due_date' => now()->addDays(7)->toDateString(),
        ]);

        $response = $this->get(route('status.check', [
            'ticket' => 'ALC-2026-01001',
            'phone' => '081234567890',
        ]));

        $response->assertSuccessful();
        $response->assertInertia(fn ($page) => $page
            ->component('Public/StatusCheck', false)
            ->has('result.invoices', 1)
            ->where('result.invoices.0.invoice_no', 'INV-2026-00010')
        );
    }

    public function test_upload_to_paid_invoice_is_blocked(): void
    {
        Storage::fake('public');
        $reg = $this->approvedRegistration();
        $invoice = Invoice::create([
            'invoice_no' => 'INV-2026-00011',
            'student_registration_id' => $reg->id,
            'amount' => 350000,
            'status' => 'paid',
            'paid_at' => now(),
        ]);

        $response = $this->post(route('bayar.upload', $invoice), [
            'phone' => '081234567890',
            'proof' => UploadedFile::fake()->image('bukti.jpg'),
        ]);

        $response->assertSessionHas('error');
        $this->assertEquals(0, Payment::query()->where('invoice_id', $invoice->id)->count());
    }

    public function test_due_reminder_is_sent_once(): void
    {
        $reg = $this->approvedRegistration();
        Invoice::create([
            'invoice_no' => 'INV-2026-00012',
            'student_registration_id' => $reg->id,
            'amount' => 350000,
            'status' => 'unpaid',
            'due_date' => now()->addDay()->toDateString(),
        ]);

        $this->artisan('invoices:send-due-reminders')->assertSuccessful();
        $this->artisan('invoices:send-due-reminders')->assertSuccessful();

        $this->assertEquals(1, NotificationLog::query()
            ->where('event', 'invoice_due')
            ->count());
    }

    public function test_admin_can_confirm_invoice(): void
    {
        $user = $this->actingAsAdmin();
        $reg = $this->approvedRegistration();
        $invoice = Invoice::create([
            'invoice_no' => 'INV-2026-00013',
            'student_registration_id' => $reg->id,
            'amount' => 350000,
            'status' => 'pending',
        ]);
        $payment = Payment::create([
            'invoice_id' => $invoice->id,
            'proof_path' => 'payment-proofs/bukti.jpg',
            'status' => 'pending',
        ]);

        $response = $this->actingAs($user, PermissionCatalog::GUARD)->post(
            route('admin.keuangan.invoice.confirm', $invoice)
        );

        $response->assertRedirect();
        $response->assertSessionHas('success');
        $this->assertEquals('paid', $invoice->fresh()->status);
        $this->assertNotNull($invoice->fresh()->paid_at);
        $this->assertEquals('verified', $payment->fresh()->status);
        $this->assertEquals($user->id, $payment->fresh()->verified_by);
    }

    public function test_admin_can_decline_invoice(): void
    {
        $user = $this->actingAsAdmin();
        $reg = $this->approvedRegistration();
        $invoice = Invoice::create([
            'invoice_no' => 'INV-2026-00014',
            'student_registration_id' => $reg->id,
            'amount' => 350000,
            'status' => 'pending',
        ]);
        $payment = Payment::create([
            'invoice_id' => $invoice->id,
            'proof_path' => 'payment-proofs/bukti.jpg',
            'status' => 'pending',
        ]);

        $response = $this->actingAs($user, PermissionCatalog::GUARD)->post(
            route('admin.keuangan.invoice.decline', $invoice),
            ['note' => 'Bukti buram']
        );

        $response->assertRedirect();
        $response->assertSessionHas('success');
        $this->assertEquals('unpaid', $invoice->fresh()->status);
        $this->assertEquals('rejected', $payment->fresh()->status);
        $this->assertEquals('Bukti buram', $payment->fresh()->note);
    }

    public function test_public_pembayaran_redirects_to_portal_invoices(): void
    {
        $response = $this->get('/pembayaran?invoice=INV-2026-00001&phone=085236446961');
        $response->assertRedirect(route('portal.invoices'));
    }
}
