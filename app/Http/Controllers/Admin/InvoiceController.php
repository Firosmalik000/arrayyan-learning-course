<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Jobs\SendInvoiceNotification;
use App\Jobs\SendRegistrationNotification;
use App\Models\ActivityLog;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\StudentRegistration;
use App\Support\InvoiceService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class InvoiceController extends Controller
{
    private const STATUSES = ['unpaid', 'pending', 'paid', 'expired', 'rejected'];

    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search', ''));
        $status = $request->filled('status') ? (string) $request->query('status') : '';

        $base = Invoice::query()
            ->with([
                'student:id,name,parent_contact',
                'registration:id,student_name,parent_contact',
                'program:id,name',
                'payments',
            ])
            ->when($search !== '', function ($query) use ($search): void {
                $query->where(function ($inner) use ($search): void {
                    $inner->where('invoice_no', 'like', "%{$search}%")
                        ->orWhereHas('student', fn ($q) => $q->where('name', 'like', "%{$search}%"))
                        ->orWhereHas('registration', fn ($q) => $q->where('student_name', 'like', "%{$search}%"));
                });
            })
            ->when(in_array($status, self::STATUSES, true), fn ($query) => $query->where('status', $status));

        $perPage = min(max($request->integer('per_page', 10), 5), 100);

        $invoices = (clone $base)
            ->latest()
            ->paginate($perPage)
            ->withQueryString();
        $invoices->through(fn (Invoice $invoice) => $this->formatInvoice($invoice));

        $counts = Invoice::query()
            ->selectRaw('status, COUNT(*) as aggregate')
            ->groupBy('status')
            ->pluck('aggregate', 'status');

        return Inertia::render('Admin/Invoices', [
            'invoices' => $invoices,
            'stats' => [
                'total' => (int) $counts->sum(),
                'unpaid' => (int) ($counts['unpaid'] ?? 0),
                'pending' => (int) ($counts['pending'] ?? 0),
                'paid' => (int) ($counts['paid'] ?? 0),
                'expired' => (int) ($counts['expired'] ?? 0),
                'rejected' => (int) ($counts['rejected'] ?? 0),
                'paid_total' => (float) Invoice::query()->where('status', 'paid')->sum('amount'),
            ],
            'filters' => [
                'search' => $search,
                'status' => $status,
                'per_page' => $perPage,
            ],
        ]);
    }

    public function createFromRegistration(StudentRegistration $studentRegistration): RedirectResponse
    {
        return $this->createForRegistration($studentRegistration);
    }

    public function createForRegistration(StudentRegistration $studentRegistration): RedirectResponse
    {
        $registration = $studentRegistration;

        if ($registration->status !== 'approved') {
            return back()->with('error', 'Invoice hanya bisa dibuat untuk pendaftaran yang sudah disetujui.');
        }

        $student = InvoiceService::findStudentFor($registration);

        $invoice = InvoiceService::createForRegistration($registration, $student);

        return back()->with('success', "Invoice {$invoice->invoice_no} siap ditagihkan.");
    }

    public function confirm(Invoice $invoice): RedirectResponse
    {
        if ($invoice->status === Invoice::STATUS_PAID) {
            return back()->with('error', 'Tagihan ini sudah berstatus lunas.');
        }

        $pendingPayment = $invoice->payments()
            ->where('status', Payment::STATUS_PENDING)
            ->latest()
            ->first();

        if ($pendingPayment) {
            $pendingPayment->update([
                'status' => Payment::STATUS_VERIFIED,
                'verified_by' => Auth::id(),
                'verified_at' => now(),
            ]);
        } else {
            $invoice->payments()->create([
                'status' => Payment::STATUS_VERIFIED,
                'verified_by' => Auth::id(),
                'verified_at' => now(),
                'note' => 'Dikonfirmasi langsung oleh admin',
            ]);
        }

        $invoice->update([
            'status' => Invoice::STATUS_PAID,
            'paid_at' => now(),
        ]);

        [$contact, $name] = InvoiceService::resolveRecipient($invoice->fresh());

        if ($contact !== '') {
            SendRegistrationNotification::dispatch(
                event: 'paid',
                recipient: $contact,
                name: $name,
                ticket: $invoice->invoice_no,
                reason: null,
                registrationType: 'invoice',
                registrationId: $invoice->id,
            );
        }

        ActivityLog::record('keuangan.konfirmasi', "Tagihan {$invoice->invoice_no} berhasil dikonfirmasi lunas.", $invoice);

        return back()->with('success', "Tagihan {$invoice->invoice_no} berhasil dikonfirmasi lunas.");
    }

    public function declineInvoice(Request $request, Invoice $invoice): RedirectResponse
    {
        $data = $request->validate([
            'note' => ['nullable', 'string', 'max:500'],
        ]);

        $pendingPayment = $invoice->payments()
            ->where('status', Payment::STATUS_PENDING)
            ->latest()
            ->first();

        if ($pendingPayment) {
            $pendingPayment->update([
                'status' => Payment::STATUS_REJECTED,
                'note' => $data['note'] ?? $pendingPayment->note,
                'verified_by' => Auth::id(),
                'verified_at' => now(),
            ]);
        }

        $invoice->update(['status' => Invoice::STATUS_UNPAID]);

        [$contact, $name] = InvoiceService::resolveRecipient($invoice->fresh());

        if ($contact !== '') {
            SendInvoiceNotification::dispatch(
                event: 'rejected',
                recipient: $contact,
                name: $name,
                invoiceNo: $invoice->invoice_no,
                amount: 'Rp '.number_format((float) $invoice->amount, 0, ',', '.'),
                dueDate: $invoice->due_date?->format('d M Y'),
                invoiceId: $invoice->id,
            );
        }

        ActivityLog::record('keuangan.tolak', "Bukti pembayaran {$invoice->invoice_no} ditolak.", $invoice);

        return back()->with('success', "Bukti pembayaran {$invoice->invoice_no} ditolak. Tagihan kembali ke Belum Bayar.");
    }

    public function verify(Payment $payment): RedirectResponse
    {
        if ($payment->status !== Payment::STATUS_PENDING) {
            return back()->with('error', 'Bukti pembayaran ini sudah diproses sebelumnya.');
        }

        $invoice = $payment->invoice;

        return $this->confirm($invoice);
    }

    public function decline(Request $request, Payment $payment): RedirectResponse
    {
        if ($payment->status !== Payment::STATUS_PENDING) {
            return back()->with('error', 'Bukti pembayaran ini sudah diproses sebelumnya.');
        }

        $invoice = $payment->invoice;

        return $this->declineInvoice($request, $invoice);
    }

    public function export(Request $request): StreamedResponse
    {
        $status = $request->filled('status') ? (string) $request->query('status') : '';

        $invoices = Invoice::query()
            ->with(['student:id,name', 'registration:id,student_name', 'program:id,name', 'payments.verifier:id,name'])
            ->when(in_array($status, self::STATUSES, true), fn ($query) => $query->where('status', $status))
            ->latest()
            ->get();

        return response()->streamDownload(function () use ($invoices): void {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['No. Tagihan', 'Siswa', 'Program', 'Nominal', 'Status', 'Jatuh Tempo', 'Lunas Pada', 'Verifikator']);

            foreach ($invoices as $invoice) {
                $verifiedPayment = $invoice->payments
                    ->first(fn ($payment) => $payment->status === Payment::STATUS_VERIFIED);

                fputcsv($handle, [
                    $invoice->invoice_no,
                    $invoice->student?->name ?? $invoice->registration?->student_name ?? '-',
                    $invoice->program?->name ?? '-',
                    $invoice->amount,
                    $invoice->status,
                    $invoice->due_date?->format('Y-m-d'),
                    $invoice->paid_at?->format('Y-m-d H:i'),
                    $verifiedPayment?->verifier?->name,
                ]);
            }

            fclose($handle);
        }, 'keuangan-'.now()->format('Ymd-His').'.csv', ['Content-Type' => 'text/csv']);
    }

    /**
     * @return array<string, mixed>
     */
    private function formatInvoice(Invoice $invoice): array
    {
        $latestPayment = $invoice->payments->first();

        return [
            'id' => $invoice->id,
            'invoice_no' => $invoice->invoice_no,
            'student_name' => $invoice->student?->name ?? $invoice->registration?->student_name ?? '-',
            'contact' => $invoice->student?->parent_contact ?? $invoice->registration?->parent_contact ?? '-',
            'program' => $invoice->program?->name ?? '-',
            'amount' => $invoice->amount,
            'status' => $invoice->status,
            'due_date' => $invoice->due_date,
            'paid_at' => $invoice->paid_at,
            'payments_count' => $invoice->payments->count(),
            'latest_payment' => $latestPayment ? [
                'id' => $latestPayment->id,
                'status' => $latestPayment->status,
            ] : null,
            'proof_url' => $latestPayment ? Storage::url($latestPayment->proof_path) : null,
            'proof_note' => $latestPayment?->note,
            'created_at' => $invoice->created_at,
        ];
    }
}
