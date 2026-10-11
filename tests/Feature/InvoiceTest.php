<?php

namespace Tests\Feature;

use App\Models\Invoice;
use App\Models\NotificationLog;
use App\Models\Payment;
use App\Models\Program;
use App\Models\Role;
use App\Models\StudentRegistration;
use App\Models\User;
use App\Support\PermissionCatalog;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
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
            ->has('invoices.data', 1)
            ->where('stats.unpaid', 1)
        );

        $filtered = $this->actingAs($user, PermissionCatalog::GUARD)->get(route('admin.keuangan', [
            'status' => 'paid',
        ]));

        $filtered->assertSuccessful();
        $filtered->assertInertia(fn ($page) => $page
            ->component('Admin/Invoices', false)
            ->has('invoices.data', 0)
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
