<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreMonthlyInvoiceRequest;
use App\Http\Requests\StoreSelectedMonthlyInvoicesRequest;
use App\Jobs\SendInvoiceNotification;
use App\Jobs\SendRegistrationNotification;
use App\Models\ActivityLog;
use App\Models\ClassGroup;
use App\Models\ClassMember;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\Program;
use App\Models\Student;
use App\Models\StudentRegistration;
use App\Support\InvoiceService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use RuntimeException;
use Symfony\Component\HttpFoundation\StreamedResponse;

class InvoiceController extends Controller
{
    private const STATUSES = ['unpaid', 'pending', 'paid', 'expired', 'rejected'];

    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search', ''));
        $status = $request->filled('status') ? (string) $request->query('status') : '';
        $month = preg_match('/^\d{4}-\d{2}$/', (string) $request->query('month'))
            ? (string) $request->query('month')
            : '';
        $year = preg_match('/^\d{4}$/', (string) $request->query('year'))
            ? (string) $request->query('year')
            : '';
        $programId = $request->integer('program_id') ?: null;
        $classGroupId = $request->integer('class_group_id') ?: null;

        $applyInvoiceFilters = function ($query) use ($status, $month, $year, $programId, $classGroupId): void {
            $query
                ->when(in_array($status, self::STATUSES, true), fn ($builder) => $builder->where('status', $status))
                ->when($month !== '', fn ($builder) => $builder->whereDate('billing_month', $month.'-01'))
                ->when($year !== '' && $month === '', fn ($builder) => $builder->whereYear('billing_month', $year))
                ->when($programId, fn ($builder) => $builder->where('program_id', $programId))
                ->when($classGroupId, fn ($builder) => $builder->where('class_group_id', $classGroupId));
        };

        $hasInvoiceStateFilters = in_array($status, self::STATUSES, true) || $month !== '' || $year !== '';
        $hasAnyFilters = $hasInvoiceStateFilters || $programId !== null || $classGroupId !== null;

        $perPage = min(max($request->integer('per_page', 10), 5), 100);

        $students = Student::query()
            ->when($search !== '', function ($query) use ($search): void {
                $query->where(function ($inner) use ($search): void {
                    $inner->where('name', 'like', "%{$search}%")
                        ->orWhere('parent_contact', 'like', "%{$search}%")
                        ->orWhereHas('invoices', fn ($invoiceQuery) => $invoiceQuery->where('invoice_no', 'like', "%{$search}%"));
                });
            })
            ->when($hasInvoiceStateFilters, fn ($query) => $query->whereHas('invoices', $applyInvoiceFilters))
            ->when($programId, fn ($query) => $query->where(function ($inner) use ($programId): void {
                $inner->whereHas('classMembers.classGroup', fn ($classQuery) => $classQuery->where('program_id', $programId))
                    ->orWhereHas('invoices', fn ($invoiceQuery) => $invoiceQuery->where('program_id', $programId));
            }))
            ->when($classGroupId, fn ($query) => $query->where(function ($inner) use ($classGroupId): void {
                $inner->whereHas('classMembers', fn ($memberQuery) => $memberQuery->where('class_group_id', $classGroupId))
                    ->orWhereHas('invoices', fn ($invoiceQuery) => $invoiceQuery->where('class_group_id', $classGroupId));
            }))
            ->when(! $hasAnyFilters, fn ($query) => $query->where(fn ($inner) => $inner
                ->whereHas('classMembers')
                ->orWhereHas('invoices')))
            ->with([
                'invoices' => function ($query) use ($applyInvoiceFilters): void {
                    $applyInvoiceFilters($query);
                    $query->with(['program:id,name', 'classGroup:id,name', 'payments'])->latest('billing_month')->latest();
                },
                'classMembers' => fn ($query) => $query->with([
                    'classGroup:id,program_id,package_id,name,is_active',
                    'classGroup.program:id,name',
                    'classGroup.package:id,name,price',
                    'classGroup.lifecycles',
                ])->latest('joined_at'),
            ])
            ->orderBy('name')
            ->paginate($perPage)
            ->withQueryString();
        $students->through(fn (Student $student) => $this->formatStudentBilling($student));

        $statsQuery = Invoice::query();
        $applyInvoiceFilters($statsQuery);
        $counts = (clone $statsQuery)
            ->selectRaw('status, COUNT(*) as aggregate')
            ->groupBy('status')
            ->pluck('aggregate', 'status');

        $billingMembers = ClassMember::query()
            ->with([
                'student:id,name,parent_contact,package_id',
                'student.packageItem:id,name,price',
                'classGroup:id,program_id,package_id,name,is_active',
                'classGroup.program:id,name,price',
                'classGroup.package:id,name,price',
                'classGroup.lifecycles',
                'invoices:id,class_member_id,billing_month',
            ])
            ->whereHas('student')
            ->whereHas('classGroup')
            ->get()
            ->sortBy([
                fn (ClassMember $member): string => $member->classGroup?->name ?? '',
                fn (ClassMember $member): string => $member->student?->name ?? '',
            ])
            ->map(fn (ClassMember $member): array => [
                'id' => $member->id,
                'student_id' => $member->student_id,
                'student_name' => $member->student?->name ?? 'Pelajar tidak tersedia',
                'class_group_id' => $member->class_group_id,
                'class_name' => $member->classGroup?->name ?? 'Kelas tidak tersedia',
                'program_name' => $member->classGroup?->program?->name ?? '-',
                'package_name' => $member->classGroup?->package?->name,
                'default_amount' => InvoiceService::defaultMonthlyAmount($member),
                'member_status' => $member->status,
                'is_scholarship' => (bool) $member->is_scholarship,
                'joined_at' => $member->joined_at?->toDateString(),
                'ended_at' => $member->ended_at?->toDateString(),
                'lifecycles' => $member->classGroup?->lifecycles->map(fn ($lifecycle) => [
                    'activated_at' => $lifecycle->activated_at->toDateString(),
                    'deactivated_at' => $lifecycle->deactivated_at?->toDateString(),
                ])->values()->all() ?? [],
                'billed_months' => $member->invoices
                    ->filter(fn (Invoice $invoice): bool => $invoice->billing_month !== null)
                    ->map(fn (Invoice $invoice): string => $invoice->billing_month->format('Y-m'))
                    ->unique()
                    ->values()
                    ->all(),
            ])
            ->values();

        return Inertia::render('Admin/Invoices', [
            'students' => $students,
            'billing_members' => $billingMembers,
            'unlinked_invoices' => Invoice::query()
                ->whereNull('student_id')
                ->with(['registration:id,student_name,parent_contact', 'program:id,name', 'classGroup:id,name', 'payments'])
                ->when($search !== '', function ($query) use ($search): void {
                    $query->where(function ($inner) use ($search): void {
                        $inner->where('invoice_no', 'like', "%{$search}%")
                            ->orWhereHas('registration', fn ($registrationQuery) => $registrationQuery
                                ->where('student_name', 'like', "%{$search}%")
                                ->orWhere('parent_contact', 'like', "%{$search}%"));
                    });
                })
                ->tap($applyInvoiceFilters)
                ->latest()
                ->limit(100)
                ->get()
                ->map(fn (Invoice $invoice) => $this->formatInvoice($invoice))
                ->values(),
            'stats' => [
                'total' => (int) $counts->sum(),
                'unpaid' => (int) ($counts['unpaid'] ?? 0),
                'pending' => (int) ($counts['pending'] ?? 0),
                'paid' => (int) ($counts['paid'] ?? 0),
                'expired' => (int) ($counts['expired'] ?? 0),
                'rejected' => (int) ($counts['rejected'] ?? 0),
                'total_amount' => (float) (clone $statsQuery)->sum('amount'),
                'paid_total' => (float) (clone $statsQuery)->where('status', Invoice::STATUS_PAID)->sum('amount'),
                'outstanding_total' => (float) (clone $statsQuery)
                    ->whereIn('status', [Invoice::STATUS_UNPAID, Invoice::STATUS_EXPIRED, Invoice::STATUS_REJECTED])
                    ->sum('amount'),
            ],
            'filters' => [
                'search' => $search,
                'status' => $status,
                'month' => $month,
                'year' => $year,
                'program_id' => $programId,
                'class_group_id' => $classGroupId,
                'per_page' => $perPage,
            ],
            'filter_options' => [
                'programs' => Program::query()->orderBy('name')->get(['id', 'name']),
                'classes' => ClassGroup::query()->orderBy('name')->get(['id', 'program_id', 'name', 'is_active']),
                'years' => Invoice::query()
                    ->whereNotNull('billing_month')
                    ->pluck('billing_month')
                    ->map(fn ($value) => substr((string) $value, 0, 4))
                    ->unique()
                    ->sortDesc()
                    ->values(),
            ],
        ]);
    }

    public function show(Student $student): Response
    {
        $student->load([
            'invoices' => fn ($query) => $query
                ->with(['program:id,name', 'classGroup:id,name', 'payments'])
                ->latest('billing_month')
                ->latest(),
            'classMembers' => fn ($query) => $query->with([
                'classGroup:id,program_id,package_id,name,is_active',
                'classGroup.program:id,name',
                'classGroup.package:id,name,price',
                'classGroup.lifecycles',
            ])->latest('joined_at'),
        ]);

        return Inertia::render('Admin/Invoices/Show', [
            'student' => $this->formatStudentBilling($student),
        ]);
    }

    public function storeMonthlyInvoice(
        StoreMonthlyInvoiceRequest $request,
        ClassMember $member,
    ): RedirectResponse {
        try {
            $result = InvoiceService::createMonthlyForMember($member, $request->validated());
        } catch (RuntimeException $exception) {
            return back()->with('error', $exception->getMessage());
        }

        $invoice = $result['invoice'];

        if (! $result['created']) {
            return back()->with('error', "Tagihan {$invoice->invoice_no} untuk bulan tersebut sudah ada.");
        }

        ActivityLog::record(
            'keuangan.tagihan-bulanan.buat',
            "Tagihan bulanan {$invoice->invoice_no} dibuat.",
            $invoice,
            ['billing_month' => $invoice->billing_month?->format('Y-m')],
        );

        return back()->with('success', "Tagihan {$invoice->invoice_no} berhasil dibuat.");
    }

    public function storeMonthlyClassInvoices(
        StoreMonthlyInvoiceRequest $request,
        ClassGroup $classGroup,
    ): RedirectResponse {
        $result = InvoiceService::createMonthlyForClass($classGroup, $request->validated());
        $message = "{$result['created']} tagihan dibuat";

        if ($result['existing'] > 0) {
            $message .= ", {$result['existing']} sudah tersedia";
        }

        if ($result['skipped'] !== []) {
            $message .= ', '.count($result['skipped']).' dilewati';
        }

        ActivityLog::record(
            'keuangan.tagihan-bulanan.massal',
            "Tagihan bulanan kelas {$classGroup->name}: {$message}.",
            $classGroup,
            ['billing_month' => $request->validated('billing_month')],
        );

        return back()->with('success', ucfirst($message).'.');
    }

    public function storeSelectedMonthlyInvoices(
        StoreSelectedMonthlyInvoicesRequest $request,
    ): RedirectResponse {
        $validated = $request->validated();
        $memberIds = $validated['member_ids'];
        unset($validated['member_ids']);

        $members = ClassMember::query()
            ->whereKey($memberIds)
            ->get();
        $result = InvoiceService::createMonthlyForMembers($members, $validated);
        $message = "{$result['created']} tagihan dibuat";

        if ($result['existing'] > 0) {
            $message .= ", {$result['existing']} sudah tersedia";
        }

        if ($result['skipped'] !== []) {
            $message .= ', '.count($result['skipped']).' dilewati';
        }

        ActivityLog::record(
            'keuangan.tagihan-bulanan.bersama',
            "Tagihan bulanan bersama: {$message}.",
            null,
            [
                'billing_month' => $validated['billing_month'],
                'member_ids' => $memberIds,
                'skipped' => $result['skipped'],
            ],
        );

        return back()->with('success', ucfirst($message).'.');
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
        $month = preg_match('/^\d{4}-\d{2}$/', (string) $request->query('month')) ? (string) $request->query('month') : '';
        $year = preg_match('/^\d{4}$/', (string) $request->query('year')) ? (string) $request->query('year') : '';
        $programId = $request->integer('program_id') ?: null;
        $classGroupId = $request->integer('class_group_id') ?: null;

        $invoices = Invoice::query()
            ->with(['student:id,name', 'registration:id,student_name', 'program:id,name', 'classGroup:id,name', 'payments.verifier:id,name'])
            ->when(in_array($status, self::STATUSES, true), fn ($query) => $query->where('status', $status))
            ->when($month !== '', fn ($query) => $query->whereDate('billing_month', $month.'-01'))
            ->when($year !== '' && $month === '', fn ($query) => $query->whereYear('billing_month', $year))
            ->when($programId, fn ($query) => $query->where('program_id', $programId))
            ->when($classGroupId, fn ($query) => $query->where('class_group_id', $classGroupId))
            ->latest()
            ->get();

        return response()->streamDownload(function () use ($invoices): void {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['No. Tagihan', 'Siswa', 'Program', 'Kelas', 'Periode', 'Jenis', 'Nominal', 'Status', 'Jatuh Tempo', 'Lunas Pada', 'Verifikator']);

            foreach ($invoices as $invoice) {
                $verifiedPayment = $invoice->payments
                    ->first(fn ($payment) => $payment->status === Payment::STATUS_VERIFIED);

                fputcsv($handle, [
                    $invoice->invoice_no,
                    $invoice->student?->name ?? $invoice->registration?->student_name ?? '-',
                    $invoice->program?->name ?? '-',
                    $invoice->classGroup?->name ?? '-',
                    $invoice->billing_month?->format('Y-m') ?? '-',
                    $invoice->billing_type,
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
            'class_group_id' => $invoice->class_group_id,
            'class_name' => $invoice->classGroup?->name ?? 'Tagihan Awal / Umum',
            'class_member_id' => $invoice->class_member_id,
            'billing_type' => $invoice->billing_type ?? 'registration',
            'billing_month' => $invoice->billing_month?->format('Y-m'),
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

    /**
     * @return array<string, mixed>
     */
    private function formatStudentBilling(Student $student): array
    {
        $invoices = $student->invoices->map(fn (Invoice $invoice) => $this->formatInvoice($invoice));
        $outstandingStatuses = [
            Invoice::STATUS_UNPAID,
            Invoice::STATUS_EXPIRED,
            Invoice::STATUS_REJECTED,
        ];

        $classes = $student->classMembers->map(function (ClassMember $member) use ($invoices): array {
            $classInvoices = $invoices
                ->where('class_member_id', $member->id)
                ->sortByDesc(fn (array $invoice) => $invoice['billing_month'] ?? $invoice['created_at'])
                ->values();

            return [
                'id' => $member->class_group_id,
                'member_id' => $member->id,
                'name' => $member->classGroup?->name ?? 'Kelas tidak tersedia',
                'program' => $member->classGroup?->program?->name ?? '-',
                'package' => $member->classGroup?->package?->name,
                'default_amount' => InvoiceService::defaultMonthlyAmount($member),
                'is_active' => (bool) $member->classGroup?->is_active,
                'member_status' => $member->status,
                'is_scholarship' => $member->is_scholarship,
                'joined_at' => $member->joined_at?->toDateString(),
                'ended_at' => $member->ended_at?->toDateString(),
                'lifecycles' => $member->classGroup?->lifecycles->map(fn ($lifecycle) => [
                    'activated_at' => $lifecycle->activated_at->toDateString(),
                    'deactivated_at' => $lifecycle->deactivated_at?->toDateString(),
                ])->values()->all() ?? [],
                'invoice_count' => $classInvoices->count(),
                'paid_count' => $classInvoices->where('status', Invoice::STATUS_PAID)->count(),
                'outstanding_count' => $classInvoices->whereIn('status', [
                    Invoice::STATUS_UNPAID,
                    Invoice::STATUS_EXPIRED,
                    Invoice::STATUS_REJECTED,
                ])->count(),
                'invoices' => $classInvoices->all(),
            ];
        })->values();

        $generalInvoices = $invoices->whereNull('class_member_id')->values();
        if ($generalInvoices->isNotEmpty()) {
            $classes->push([
                'id' => 'general',
                'member_id' => null,
                'name' => 'Tagihan Awal / Umum',
                'program' => $generalInvoices->first()['program'] ?? '-',
                'package' => null,
                'default_amount' => null,
                'is_active' => false,
                'member_status' => 'history',
                'is_scholarship' => false,
                'joined_at' => null,
                'ended_at' => null,
                'invoice_count' => $generalInvoices->count(),
                'paid_count' => $generalInvoices->where('status', Invoice::STATUS_PAID)->count(),
                'outstanding_count' => $generalInvoices->whereIn('status', $outstandingStatuses)->count(),
                'invoices' => $generalInvoices->all(),
            ]);
        }

        $latestInvoice = $invoices
            ->sortByDesc(fn (array $invoice) => $invoice['billing_month'] ?? $invoice['created_at'])
            ->first();

        return [
            'id' => $student->id,
            'name' => $student->name,
            'contact' => $student->parent_contact,
            'email' => $student->parent_email,
            'school_name' => $student->school_name,
            'level' => $student->level,
            'photo_url' => $student->photo_path ? Storage::url($student->photo_path) : null,
            'is_active' => $student->is_active,
            'class_count' => $classes->where('id', '!=', 'general')->count(),
            'invoice_count' => $invoices->count(),
            'paid_count' => $invoices->where('status', Invoice::STATUS_PAID)->count(),
            'outstanding_count' => $invoices->whereIn('status', $outstandingStatuses)->count(),
            'total_amount' => (float) $invoices->sum('amount'),
            'paid_amount' => (float) $invoices->where('status', Invoice::STATUS_PAID)->sum('amount'),
            'outstanding_amount' => (float) $invoices->whereIn('status', $outstandingStatuses)->sum('amount'),
            'latest_invoice' => $latestInvoice,
            'classes' => $classes->all(),
        ];
    }
}
