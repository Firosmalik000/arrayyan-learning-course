<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAttendanceRequest;
use App\Http\Requests\StorePortalProgramEnrollmentRequest;
use App\Http\Requests\SyncAttendanceSessionsRequest;
use App\Http\Requests\UpdatePortalProfileRequest;
use App\Http\Requests\UpdatePortalStudentRequest;
use App\Jobs\SendRegistrationNotification;
use App\Models\ActivityLog;
use App\Models\Attendance;
use App\Models\ClassGroup;
use App\Models\ClassMember;
use App\Models\Grade;
use App\Models\Invoice;
use App\Models\Package;
use App\Models\Payment;
use App\Models\PortalAccount;
use App\Models\Program;
use App\Models\Schedule;
use App\Models\Student;
use App\Models\StudentRegistration;
use App\Support\AcademicService;
use App\Support\InvoiceService;
use App\Support\RegistrationTicket;
use App\Support\StudentRegistrationEmailService;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use RuntimeException;

class PortalController extends Controller
{
    private function account(): PortalAccount
    {
        return Auth::guard('portal')->user();
    }

    /**
     * @return \Illuminate\Support\Collection<int, Student>
     */
    private function parentStudents(PortalAccount $account)
    {
        $students = $account->students()->where('is_active', true)->get();

        if ($students->isEmpty() && $account->student) {
            $students = collect([$account->student]);
        }

        return $students;
    }

    private function currentStudent(PortalAccount $account, ?Request $request = null): ?Student
    {
        if (! $account->isParent()) {
            return null;
        }

        $students = $this->parentStudents($account);
        if ($students->isEmpty()) {
            return null;
        }

        if ($request && $request->has('student_id')) {
            $reqId = (int) $request->query('student_id');
            $found = $students->firstWhere('id', $reqId);
            if ($found) {
                session(['portal.selected_student_id' => $reqId]);

                return $found;
            }
        }

        $selectedId = session('portal.selected_student_id');
        if ($selectedId) {
            $found = $students->firstWhere('id', (int) $selectedId);
            if ($found) {
                return $found;
            }
        }

        $first = $students->first();
        if ($first) {
            session(['portal.selected_student_id' => $first->id]);
        }

        return $first;
    }

    public function switchStudent(Request $request, Student $student): RedirectResponse
    {
        $account = $this->account();
        $students = $this->parentStudents($account);

        if ($students->contains('id', $student->id)) {
            session(['portal.selected_student_id' => $student->id]);
        }

        return back();
    }

    public function dashboard(Request $request): Response
    {
        $account = $this->account();

        if ($account->isParent()) {
            $student = $this->currentStudent($account, $request);

            return Inertia::render('Portal/Dashboard', [
                'account_type' => 'parent',
                'selected_student' => $student ? [
                    'id' => $student->id,
                    'name' => $student->name,
                    'level' => $student->level,
                    'program' => $student->program,
                ] : null,
                'summary' => $this->studentSummary($account, $student),
                'available_programs' => Program::query()
                    ->where('is_active', true)
                    ->with(['packages' => fn ($query) => $query
                        ->where('is_active', true)
                        ->orderBy('sort_order')
                        ->orderBy('level')
                        ->orderBy('sessions'),
                    ])
                    ->orderBy('name')
                    ->get()
                    ->map(fn (Program $program) => [
                        'id' => $program->id,
                        'name' => $program->name,
                        'level' => $program->level,
                        'price' => $program->price,
                        'quota' => $program->quota,
                        'quota_remaining' => $program->quotaRemaining(),
                        'is_full' => ! $program->hasAvailableQuota(),
                        'packages' => $program->packages->map(fn ($package) => [
                            'id' => $package->id,
                            'name' => $package->name,
                            'level' => $package->level,
                            'sessions' => $package->sessions,
                            'intensity' => $package->intensity,
                            'price' => $package->price,
                            'display_name' => $package->displayName(),
                        ])->values()->all(),
                    ])
                    ->values()
                    ->all(),
            ]);
        }

        return Inertia::render('Portal/Dashboard', [
            'account_type' => 'teacher',
            'summary' => $this->teacherSummary($account),
        ]);
    }

    public function storeProgram(StorePortalProgramEnrollmentRequest $request): RedirectResponse
    {
        $account = $this->account();

        if (! $account->isParent()) {
            abort(403, 'Hanya orang tua yang dapat mendaftarkan program anak.');
        }

        $student = $this->currentStudent($account, $request);
        if (! $student) {
            return back()->with('error', 'Silakan pilih data anak terlebih dahulu.');
        }

        $data = $request->validated();
        $program = Program::query()->select(['id', 'name', 'quota'])->findOrFail($data['program_id']);

        if (! $program->hasAvailableQuota()) {
            return back()
                ->withErrors(['program_id' => 'Kuota program "'.$program->name.'" sudah penuh. Silakan pilih program lain atau hubungi admin.'])
                ->withInput();
        }

        $package = null;
        if (! empty($data['package_id'])) {
            $package = Package::query()
                ->whereKey($data['package_id'])
                ->where('program_id', $program->id)
                ->where('is_active', true)
                ->first();

            if (! $package) {
                return back()
                    ->withErrors(['package_id' => 'Pilihan harga tidak sesuai dengan program yang dipilih.'])
                    ->withInput();
            }
        }

        $registrationData = [
            'student_id' => $student->id,
            'student_name' => $student->name,
            'address' => $student->address ?? '-',
            'school_name' => $student->school_name ?? '-',
            'level' => $student->level ?? 'SD',
            'class_level' => $student->class_level,
            'subjects' => $data['subjects'],
            'program_id' => $program->id,
            'package_id' => $package?->id,
            'program' => $program->name,
            'package' => $package ? $package->displayName() : ($data['package'] ?? null),
            'parent_contact' => $student->parent_contact ?? $account->contact,
            'parent_email' => $student->parent_email ?? $account->email,
            'preferred_mode' => $data['preferred_mode'] ?? $student->preferred_mode,
            'notes' => $data['notes'] ?? null,
            'status' => 'pending',
        ];

        $registration = DB::transaction(function () use ($registrationData): StudentRegistration {
            $reg = StudentRegistration::create($registrationData);
            $reg->update([
                'registration_no' => RegistrationTicket::generateFor($reg),
            ]);

            return $reg->fresh();
        });

        SendRegistrationNotification::dispatch(
            event: 'received',
            recipient: $registration->parent_contact,
            name: $registration->student_name,
            ticket: $registration->registration_no,
            reason: null,
            registrationType: 'student',
            registrationId: $registration->id,
        );

        app(StudentRegistrationEmailService::class)->sendReceived($registration);

        return back()->with('success', "Pendaftaran program {$program->name} ({$data['subjects']}) untuk {$student->name} berhasil dikirim! No. tiket: {$registration->registration_no}. Menunggu persetujuan admin.");
    }

    public function schedule(Request $request): Response
    {
        $account = $this->account();
        $student = $this->currentStudent($account, $request);

        $classes = $this->accountClasses($account, $student);
        $classes->load([
            'program:id,name,level',
            'package:id,name,sessions',
            'teacher:id,name,contact',
            'schedules',
            'members.student:id,name,school_name,level,class_level,parent_contact',
        ]);

        $attendances = collect();
        if ($classes->isNotEmpty()) {
            $attQuery = Attendance::query()->whereIn('class_group_id', $classes->pluck('id'));
            if ($account->isParent() && $student) {
                $attQuery->where('student_id', $student->id);
            }
            $attendances = $attQuery->get();
        }

        $todayStr = Carbon::now('Asia/Jakarta')->toDateString();

        $classesData = $classes->map(function (ClassGroup $cls) use ($attendances, $todayStr): array {
            $clsAttendances = $attendances
                ->where('class_group_id', $cls->id)
                ->filter(function (Attendance $attendance) use ($cls, $todayStr): bool {
                    $date = $attendance->date?->format('Y-m-d') ?? substr((string) $attendance->date, 0, 10);

                    return $cls->is_active
                        || $date <= $todayStr
                        || $attendance->status !== 'belum_absen';
                })
                ->map(function (Attendance $a) use ($todayStr): array {
                    $dateStr = $a->date?->format('Y-m-d') ?? substr((string) $a->date, 0, 10);
                    $isFuture = $dateStr > $todayStr;

                    return [
                        'id' => $a->id,
                        'student_id' => $a->student_id,
                        'date' => $dateStr,
                        'status' => $isFuture ? 'terjadwal' : $a->status,
                        'subject' => $a->subject,
                        'material' => $a->material,
                        'understanding_score' => $a->understanding_score,
                        'evaluation' => $a->evaluation,
                        'note' => $a->note,
                    ];
                })
                ->values()
                ->all();

            $clsSchedules = $cls->schedules->map(fn (Schedule $s) => [
                'id' => $s->id,
                'day_of_week' => $s->day_of_week,
                'day' => $s->dayLabel(),
                'start_time' => substr((string) $s->start_time, 0, 5),
                'end_time' => substr((string) $s->end_time, 0, 5),
                'room' => $s->room,
            ])->sortBy('day_of_week')->values()->all();

            $classMembers = $cls->members->map(function (ClassMember $member): array {
                return [
                    'id' => $member->id,
                    'student_id' => $member->student_id,
                    'student_name' => $member->student?->name ?? '-',
                    'status' => $member->status,
                    'joined_at' => $member->joined_at,
                    'is_scholarship' => $member->is_scholarship,
                    'notes' => $member->notes,
                    'student' => $member->student ? [
                        'id' => $member->student->id,
                        'name' => $member->student->name,
                        'school_name' => $member->student->school_name,
                        'level' => $member->student->level,
                        'class_level' => $member->student->class_level,
                        'parent_contact' => $member->student->parent_contact,
                    ] : null,
                ];
            })->values()->all();

            return [
                'id' => $cls->id,
                'name' => $cls->name,
                'program_id' => $cls->program_id,
                'program_name' => $cls->program?->name ?? 'Program Belajar',
                'level' => $cls->level ?? $cls->program?->level,
                'package_name' => $cls->package?->name,
                'total_sessions' => $cls->total_sessions ?? $cls->package?->sessions,
                'teacher_name' => $cls->teacher?->name,
                'teacher_contact' => $cls->teacher?->contact,
                'quota' => $cls->quota,
                'is_active' => $cls->is_active,
                'filled' => $cls->activeMembers()->count(),
                'members_count' => $cls->activeMembers()->count(),
                'members' => $classMembers,
                'schedules' => $clsSchedules,
                'attendances' => $clsAttendances,
            ];
        })->values()->all();

        $activeClassIds = $classes->where('is_active', true)->pluck('id');
        $items = Schedule::query()
            ->with('classGroup:id,name,program_id,teacher_id')
            ->whereIn('class_group_id', $activeClassIds)
            ->orderBy('day_of_week')
            ->orderBy('start_time')
            ->get()
            ->map(fn (Schedule $schedule) => [
                'class' => $schedule->classGroup?->name ?? '-',
                'day_of_week' => $schedule->day_of_week,
                'day' => $schedule->dayLabel(),
                'start_time' => substr((string) $schedule->start_time, 0, 5),
                'end_time' => substr((string) $schedule->end_time, 0, 5),
                'room' => $schedule->room,
            ])
            ->values()
            ->all();

        return Inertia::render('Portal/Schedule', [
            'account_type' => $account->isTeacher() ? 'teacher' : 'parent',
            'selected_student' => $student ? [
                'id' => $student->id,
                'name' => $student->name,
            ] : null,
            'classes' => $classesData,
            'schedules' => $items,
            'days' => Schedule::DAYS,
        ]);
    }

    public function attendance(Request $request): Response
    {
        $account = $this->account();

        if (! $account->isParent()) {
            return Inertia::render('Portal/Attendance', [
                'account_type' => $account->type,
                'records' => [],
                'rate' => null,
            ]);
        }

        $student = $this->currentStudent($account, $request);

        if (! $student) {
            return Inertia::render('Portal/Attendance', [
                'account_type' => 'parent',
                'records' => [],
                'rate' => null,
            ]);
        }

        $rawRecords = Attendance::query()
            ->with([
                'classGroup.teacher:id,name',
                'classGroup.program:id,name,level',
                'classGroup.package:id,name,sessions',
            ])
            ->where('student_id', $student->id)
            ->where('status', '!=', 'belum_absen')
            ->latest('date')
            ->limit(200)
            ->get();

        $studentClasses = $student->classGroups()
            ->with([
                'program:id,name,level',
                'teacher:id,name',
                'package:id,name,sessions',
            ])
            ->get();

        $allClassGroups = $studentClasses->keyBy('id');
        foreach ($rawRecords as $att) {
            if ($att->classGroup && ! $allClassGroups->has($att->class_group_id)) {
                $allClassGroups->put($att->class_group_id, $att->classGroup);
            }
        }

        $nowJakarta = Carbon::now('Asia/Jakarta');
        $todayStr = $nowJakarta->toDateString();

        $classesData = $allClassGroups->values()->map(function (ClassGroup $cls) use ($rawRecords, $todayStr): array {
            $classRecords = $rawRecords->where('class_group_id', $cls->id);
            $pastRecords = $classRecords->filter(fn ($a) => ($a->date?->format('Y-m-d') ?? substr((string) $a->date, 0, 10)) <= $todayStr);
            $totalRecorded = $pastRecords->count();
            $hadirCount = $pastRecords->where('status', 'hadir')->count();
            $scored = $pastRecords->whereNotNull('understanding_score');
            $avgScore = $scored->count() > 0 ? round((float) $scored->avg('understanding_score'), 1) : null;
            $rate = $totalRecorded > 0 ? round(($hadirCount / $totalRecorded) * 100) : null;

            $lastRecord = $pastRecords->sortByDesc('date')->first() ?? $classRecords->sortByDesc('date')->first();
            $lastDate = $lastRecord ? ($lastRecord->date?->format('Y-m-d') ?? substr((string) $lastRecord->date, 0, 10)) : null;

            return [
                'id' => $cls->id,
                'name' => $cls->name,
                'program_id' => $cls->program_id,
                'program_name' => $cls->program?->name ?? 'Program Belajar',
                'level' => $cls->level ?? $cls->program?->level,
                'package_name' => $cls->package?->name,
                'total_sessions' => $cls->total_sessions ?? $cls->package?->sessions,
                'teacher_name' => $cls->teacher?->name,
                'total_recorded' => $totalRecorded,
                'hadir_count' => $hadirCount,
                'attendance_rate' => $rate,
                'average_score' => $avgScore,
                'last_date' => $lastDate,
                'last_subject' => $lastRecord?->subject,
                'last_material' => $lastRecord?->material,
            ];
        })->values()->all();

        $meetingNumbers = [];
        $records = $rawRecords
            ->sortBy('date')
            ->map(function (Attendance $attendance) use (&$meetingNumbers, $todayStr): array {
                $classKey = (string) $attendance->class_group_id;
                $meetingNumbers[$classKey] = ($meetingNumbers[$classKey] ?? 0) + 1;
                $recDate = $attendance->date?->format('Y-m-d') ?? substr((string) $attendance->date, 0, 10);
                $status = $attendance->status;
                if ($recDate > $todayStr && ($status === 'alpa' || $status === 'belum_absen')) {
                    $status = 'terjadwal';
                }

                return [
                    'id' => $attendance->id,
                    'class_group_id' => $attendance->class_group_id,
                    'class' => $attendance->classGroup?->name ?? '-',
                    'program_name' => $attendance->classGroup?->program?->name ?? 'Program Belajar',
                    'program_level' => $attendance->classGroup?->level ?? $attendance->classGroup?->program?->level,
                    'total_sessions' => $attendance->classGroup?->total_sessions ?? $attendance->classGroup?->package?->sessions,
                    'teacher' => $attendance->classGroup?->teacher?->name ?? '-',
                    'meeting_number' => $meetingNumbers[$classKey],
                    'date' => $recDate,
                    'status' => $status,
                    'subject' => $attendance->subject,
                    'material' => $attendance->material,
                    'understanding_score' => $attendance->understanding_score,
                    'evaluation' => $attendance->evaluation,
                    'note' => $attendance->note,
                ];
            })
            ->sortByDesc('date')
            ->values()
            ->all();

        $pastRecords = array_filter($records, fn (array $row) => $row['date'] <= $todayStr);
        $total = count($pastRecords);
        $present = count(array_filter($pastRecords, fn (array $row) => $row['status'] === 'hadir'));

        return Inertia::render('Portal/Attendance', [
            'account_type' => 'parent',
            'selected_student' => [
                'id' => $student->id,
                'name' => $student->name,
                'level' => $student->class_level ?? $student->level,
                'program' => $student->program,
            ],
            'classes' => $classesData,
            'records' => $records,
            'rate' => $total > 0 ? round($present / $total * 100) : null,
        ]);
    }

    public function grades(Request $request): Response
    {
        $account = $this->account();

        if (! $account->isParent()) {
            return Inertia::render('Portal/Grades', [
                'account_type' => $account->type,
                'grades' => [],
            ]);
        }

        $student = $this->currentStudent($account, $request);

        if (! $student) {
            return Inertia::render('Portal/Grades', [
                'account_type' => 'parent',
                'grades' => [],
            ]);
        }

        $grades = Grade::query()
            ->with('classGroup:id,name')
            ->where('student_id', $student->id)
            ->orderBy('term')
            ->orderBy('subject')
            ->get()
            ->map(fn (Grade $grade) => [
                'class' => $grade->classGroup?->name ?? '-',
                'subject' => $grade->subject,
                'term' => $grade->term,
                'score' => $grade->score,
            ])
            ->values()
            ->all();

        return Inertia::render('Portal/Grades', [
            'account_type' => 'parent',
            'selected_student' => [
                'id' => $student->id,
                'name' => $student->name,
            ],
            'grades' => $grades,
        ]);
    }

    public function invoices(Request $request): Response
    {
        $account = $this->account();

        if (! $account->isParent()) {
            abort(403, 'Halaman tagihan hanya untuk orang tua.');
        }

        $student = $this->currentStudent($account, $request);
        $students = $this->parentStudents($account);

        $studentIds = $students->pluck('id');
        $studentRegIds = StudentRegistration::query()
            ->whereIn('student_id', $studentIds)
            ->orWhere(function ($q) use ($account, $students): void {
                $contacts = array_filter([$account->contact, ...$students->pluck('parent_contact')->all()]);
                $q->whereIn('parent_contact', $contacts);
            })
            ->pluck('id');

        $query = Invoice::query()->with([
            'program:id,name',
            'student:id,name',
            'registration:id,student_name',
            'classGroup:id,name',
            'payments' => fn ($q) => $q->latest(),
        ]);

        if ($student) {
            $query->where('student_id', $student->id);
        } else {
            $query->where(function ($q) use ($studentIds, $studentRegIds): void {
                $q->whereIn('student_id', $studentIds);
                if ($studentRegIds->isNotEmpty()) {
                    $q->orWhereIn('student_registration_id', $studentRegIds);
                }
            });
        }

        $invoices = $query
            ->latest()
            ->get()
            ->map(function (Invoice $invoice) {
                $latestPayment = $invoice->payments->first();

                return [
                    'id' => $invoice->id,
                    'invoice_no' => $invoice->invoice_no,
                    'student_name' => $invoice->student?->name ?? $invoice->registration?->student_name ?? '-',
                    'program' => $invoice->program?->name ?? '-',
                    'class_group_id' => $invoice->class_group_id,
                    'class_name' => $invoice->classGroup?->name ?? 'Tagihan Awal / Umum',
                    'billing_type' => $invoice->billing_type ?? 'registration',
                    'billing_month' => $invoice->billing_month?->format('Y-m'),
                    'amount' => $invoice->amount,
                    'status' => $invoice->status,
                    'due_date' => $invoice->due_date,
                    'paid_at' => $invoice->paid_at,
                    'created_at' => $invoice->created_at,
                    'latest_payment' => $latestPayment ? [
                        'id' => $latestPayment->id,
                        'status' => $latestPayment->status,
                        'proof_url' => Storage::url($latestPayment->proof_path),
                        'note' => $latestPayment->note,
                        'created_at' => $latestPayment->created_at,
                    ] : null,
                    'payments' => $invoice->payments->map(fn (Payment $payment) => [
                        'id' => $payment->id,
                        'status' => $payment->status,
                        'proof_url' => Storage::url($payment->proof_path),
                        'note' => $payment->note,
                        'created_at' => $payment->created_at,
                    ])->values()->all(),
                ];
            })
            ->values()
            ->all();

        return Inertia::render('Portal/Invoices', [
            'account_type' => 'parent',
            'selected_student' => $student ? [
                'id' => $student->id,
                'name' => $student->name,
            ] : null,
            'contact' => $account->contact,
            'invoices' => $invoices,
        ]);
    }

    public function uploadPayment(Request $request, Invoice $invoice): RedirectResponse
    {
        $account = $this->account();

        if (! $account->isParent()) {
            abort(403, 'Halaman tagihan hanya untuk orang tua.');
        }

        $students = $this->parentStudents($account);
        $studentIds = $students->pluck('id');

        $allowed = false;
        if ($invoice->student_id && $studentIds->contains($invoice->student_id)) {
            $allowed = true;
        } elseif ($invoice->student_registration_id) {
            $reg = $invoice->registration;
            if ($reg && (
                ($reg->student_id && $studentIds->contains($reg->student_id))
                || ($reg->parent_contact && RegistrationTicket::normalizePhone((string) $reg->parent_contact) === RegistrationTicket::normalizePhone((string) $account->contact))
            )) {
                $allowed = true;
            }
        }

        if (! $allowed) {
            abort(403, 'Anda tidak memiliki akses ke tagihan ini.');
        }

        if ($invoice->status === Invoice::STATUS_PAID) {
            return back()->with('error', 'Tagihan ini sudah lunas. Tidak perlu mengunggah bukti lagi.');
        }

        if ($invoice->status === Invoice::STATUS_PENDING) {
            return back()->with('error', 'Tagihan ini sedang dalam status menunggu konfirmasi admin.');
        }

        $data = $request->validate([
            'proof' => ['required', 'file', 'mimes:jpg,jpeg,png,webp,pdf', 'max:5120'],
            'note' => ['nullable', 'string', 'max:500'],
        ], [
            'proof.required' => 'Bukti pembayaran wajib diunggah.',
            'proof.file' => 'Bukti pembayaran harus berupa file yang valid.',
            'proof.mimes' => 'Bukti pembayaran harus berupa gambar (JPG, PNG, WEBP) atau PDF.',
            'proof.max' => 'Ukuran file bukti pembayaran maksimal 5MB.',
        ]);

        $path = $request->file('proof')->store('payment-proofs', 'public');

        Payment::create([
            'invoice_id' => $invoice->id,
            'proof_path' => $path,
            'note' => $data['note'] ?? null,
            'status' => Payment::STATUS_PENDING,
        ]);

        $invoice->update(['status' => Invoice::STATUS_PENDING]);

        [$contact, $name] = InvoiceService::resolveRecipient($invoice);

        if ($contact !== '') {
            SendRegistrationNotification::dispatch(
                event: 'payment',
                recipient: $contact,
                name: $name,
                ticket: $invoice->invoice_no,
                reason: null,
                registrationType: 'invoice',
                registrationId: $invoice->id,
            );
        }

        ActivityLog::record('portal.pembayaran', "Bukti pembayaran {$invoice->invoice_no} diunggah oleh wali murid.", $invoice);

        return back()->with('success', 'Bukti pembayaran berhasil dikirim! Status tagihan kini Menunggu Konfirmasi dari admin.');
    }

    public function classDetail(ClassGroup $classGroup): Response
    {
        $account = $this->account();

        if (! $account->isTeacher() || $classGroup->teacher_id !== $account->teacher_id) {
            abort(403, 'Anda tidak mengajar di kelas ini.');
        }

        $classGroup->load([
            'program:id,name',
            'members.student:id,name',
        ]);

        return Inertia::render('Portal/ClassDetail', [
            'account_type' => $account->type,
            'class' => [
                'id' => $classGroup->id,
                'name' => $classGroup->name,
                'is_active' => $classGroup->is_active,
                'program' => $classGroup->program?->name ?? '-',
                'quota' => $classGroup->quota,
                'filled' => $classGroup->activeMembers()->count(),
                'members' => $classGroup->members
                    ->where('status', 'active')
                    ->map(fn (ClassMember $member) => [
                        'student_id' => $member->student_id,
                        'student_name' => $member->student?->name ?? '-',
                    ])
                    ->values()
                    ->all(),
                'schedules' => $classGroup->schedules->map(fn (Schedule $schedule) => [
                    'day' => $schedule->dayLabel(),
                    'start_time' => substr((string) $schedule->start_time, 0, 5),
                    'end_time' => substr((string) $schedule->end_time, 0, 5),
                    'room' => $schedule->room,
                ])->values()->all(),
            ],
        ]);
    }

    public function storeClassAttendance(StoreAttendanceRequest $request, ClassGroup $classGroup): RedirectResponse
    {
        $this->authorizeTeacherClass($classGroup);

        $data = $request->validated();

        try {
            $saved = AcademicService::saveAttendance(
                $classGroup,
                $data['date'],
                $data['subject'],
                $data['material'],
                $data['rows'],
                null
            );
        } catch (RuntimeException $e) {
            return back()->with('error', $e->getMessage());
        }

        return back()->with('success', "Absensi {$saved} murid tersimpan.");
    }

    public function storeClassSchedule(Request $request, ClassGroup $classGroup): RedirectResponse
    {
        $this->authorizeTeacherClass($classGroup);

        try {
            AcademicService::assertClassActive($classGroup);
        } catch (RuntimeException $exception) {
            return back()->with('error', $exception->getMessage());
        }

        $data = $request->validate([
            'day_of_week' => ['required', 'integer', 'min:1', 'max:7'],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i', 'after:start_time'],
        ]);

        try {
            AcademicService::assertNoTeacherClash(
                $classGroup->teacher_id,
                (int) $data['day_of_week'],
                $data['start_time'],
                $data['end_time'],
                $classGroup->id
            );
        } catch (RuntimeException $e) {
            return back()->with('error', $e->getMessage());
        }

        $classGroup->schedules()->create($data);

        return back()->with('success', 'Jadwal berhasil ditambahkan.');
    }

    public function updateClassSchedule(Request $request, Schedule $schedule): RedirectResponse
    {
        $this->authorizeTeacherClass($schedule->classGroup);

        try {
            AcademicService::assertClassActive($schedule->classGroup);
        } catch (RuntimeException $exception) {
            return back()->with('error', $exception->getMessage());
        }

        $data = $request->validate([
            'day_of_week' => ['required', 'integer', 'min:1', 'max:7'],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i', 'after:start_time'],
        ]);

        try {
            AcademicService::assertNoTeacherClash(
                $schedule->classGroup->teacher_id,
                (int) $data['day_of_week'],
                $data['start_time'],
                $data['end_time'],
                $schedule->class_group_id,
                $schedule->id
            );
        } catch (RuntimeException $e) {
            return back()->with('error', $e->getMessage());
        }

        $schedule->update($data);

        return back()->with('success', 'Jadwal berhasil diperbarui.');
    }

    public function destroyClassSchedule(Schedule $schedule): RedirectResponse
    {
        $this->authorizeTeacherClass($schedule->classGroup);

        try {
            AcademicService::assertClassActive($schedule->classGroup);
        } catch (RuntimeException $exception) {
            return back()->with('error', $exception->getMessage());
        }

        $schedule->delete();

        return back()->with('success', 'Jadwal dihapus.');
    }

    public function generateClassSessions(SyncAttendanceSessionsRequest $request, ClassGroup $classGroup): RedirectResponse
    {
        $this->authorizeTeacherClass($classGroup);

        $data = $request->validated();

        try {
            AcademicService::assertClassActive($classGroup);
        } catch (RuntimeException $exception) {
            return back()->with('error', $exception->getMessage());
        }

        if (! empty($data['month'])) {
            $result = AcademicService::syncAttendanceSessions($classGroup, $data['month'], $data['dates']);

            return back()->with(
                'success',
                "Jadwal {$data['month']} diperbarui: {$result['created_dates']} tanggal ditambahkan, {$result['removed_dates']} tanggal kosong dihapus, dan {$result['protected_dates']} tanggal berisi absensi dipertahankan."
            );
        }

        $schedules = $classGroup->schedules()->orderBy('day_of_week')->orderBy('start_time')->get();

        if ($schedules->isEmpty() && empty($data['dates'])) {
            return back()->with('error', 'Kelas belum memiliki jadwal mingguan. Tambahkan jadwal mingguan terlebih dahulu.');
        }

        if (! empty($data['dates'])) {
            $dates = array_values(array_unique($data['dates']));
            sort($dates);

            // Clean up any un-attended ('belum_absen') sessions for dates that are no longer in $dates
            $existingDates = Attendance::query()
                ->where('class_group_id', $classGroup->id)
                ->get()
                ->pluck('date')
                ->map(fn ($d) => is_string($d) ? substr($d, 0, 10) : $d->toDateString())
                ->unique();

            foreach ($existingDates as $existingDate) {
                if (! in_array($existingDate, $dates, true)) {
                    $hasAttendedRecord = Attendance::query()
                        ->where('class_group_id', $classGroup->id)
                        ->whereDate('date', $existingDate)
                        ->where('status', '!=', 'belum_absen')
                        ->exists();

                    if (! $hasAttendedRecord) {
                        Attendance::query()
                            ->where('class_group_id', $classGroup->id)
                            ->whereDate('date', $existingDate)
                            ->delete();
                    }
                }
            }
        } else {
            $targetCount = (int) ($data['count'] ?? $classGroup->total_sessions ?? 8);
            $startDate = ! empty($data['start_date']) ? Carbon::parse($data['start_date']) : Carbon::today();
            $scheduledDays = $schedules->pluck('day_of_week')->all();

            // Load existing attended dates first to preserve them
            $attendedDates = Attendance::query()
                ->where('class_group_id', $classGroup->id)
                ->where('status', '!=', 'belum_absen')
                ->get()
                ->pluck('date')
                ->map(fn ($d) => is_string($d) ? substr($d, 0, 10) : $d->toDateString())
                ->unique()
                ->sort()
                ->values()
                ->all();

            $dates = $attendedDates;
            $cursor = $startDate->copy();
            $safety = 0;

            while (count($dates) < $targetCount && $safety < 365) {
                $dayOfWeek = (int) $cursor->dayOfWeekIso;
                $dateString = $cursor->toDateString();
                if (in_array($dayOfWeek, $scheduledDays, true) && ! in_array($dateString, $dates, true)) {
                    $dates[] = $dateString;
                }
                $cursor->addDay();
                $safety++;
            }
            sort($dates);
        }

        $members = $classGroup->activeMembers()->get();
        $generatedDates = 0;

        foreach ($dates as $date) {
            $exists = Attendance::query()
                ->where('class_group_id', $classGroup->id)
                ->whereDate('date', $date)
                ->exists();

            if (! $exists) {
                foreach ($members as $member) {
                    $targetSessions = $member->student?->packageItem?->sessions ?? $classGroup->total_sessions;
                    if ($targetSessions !== null) {
                        $attended = Attendance::query()
                            ->where('class_group_id', $classGroup->id)
                            ->where('student_id', $member->student_id)
                            ->where('status', '!=', 'belum_absen')
                            ->count();
                        if ($attended >= $targetSessions) {
                            continue;
                        }
                    }

                    Attendance::create([
                        'class_group_id' => $classGroup->id,
                        'student_id' => $member->student_id,
                        'date' => $date,
                        'status' => 'belum_absen',
                    ]);
                }
                $generatedDates++;
            }
        }

        return back()->with('success', "Berhasil men-generate {$generatedDates} tanggal pertemuan baru sesuai jadwal mingguan.");
    }

    public function storeClassGrades(Request $request, ClassGroup $classGroup): RedirectResponse
    {
        $this->authorizeTeacherClass($classGroup);

        $data = $request->validate([
            'subject' => ['required', 'string', 'max:100'],
            'term' => ['required', 'string', 'max:100'],
            'rows' => ['required', 'array', 'min:1'],
            'rows.*.student_id' => ['required', 'integer', 'exists:students,id'],
            'rows.*.score' => ['required', 'numeric', 'min:0', 'max:100'],
        ]);

        try {
            $saved = AcademicService::saveGrades($classGroup, $data['subject'], $data['term'], $data['rows']);
        } catch (RuntimeException $e) {
            return back()->with('error', $e->getMessage());
        }

        return back()->with('success', "Nilai {$saved} murid tersimpan.");
    }

    public function profile(): Response
    {
        $account = $this->account();
        $account->load('teacher');

        $students = $this->parentStudents($account)->map(fn ($s) => [
            'id' => $s->id,
            'name' => $s->name,
            'photo_url' => $s->photo_path ? Storage::disk('public')->url($s->photo_path) : null,
            'address' => $s->address,
            'program' => $s->program,
            'package' => $s->package,
            'level' => $s->level,
            'class_level' => $s->class_level,
            'school_name' => $s->school_name,
            'subjects' => $s->subjects,
            'preferred_mode' => $s->preferred_mode,
            'notes' => $s->notes,
        ])->values()->all();

        $teacher = $account->teacher;

        return Inertia::render('Portal/Profile', [
            'account_type' => $account->isTeacher() ? 'teacher' : 'parent',
            'account' => [
                'name' => $account->name,
                'email' => $account->email,
                'contact' => $account->contact,
                'must_change_password' => $account->must_change_password,
                'last_login_at' => $account->last_login_at,
            ],
            'students' => $students,
            'linked' => $account->isTeacher() && $teacher ? [
                'name' => $teacher->name,
                'photo_url' => $teacher->photo_path ? Storage::disk('public')->url($teacher->photo_path) : null,
                'email' => $teacher->email,
                'contact' => $teacher->contact,
                'address' => $teacher->address,
                'city' => $teacher->city,
                'district' => $teacher->district,
                'teacher_role' => $teacher->teacher_role,
                'education' => $teacher->education,
                'subjects' => $teacher->subjects,
                'experience' => $teacher->experience,
                'notes' => $teacher->notes,
                'cv_url' => $teacher->cv_path ? Storage::disk('public')->url($teacher->cv_path) : null,
            ] : null,
        ]);
    }

    public function updateProfile(UpdatePortalProfileRequest $request): RedirectResponse
    {
        $account = $this->account();
        $data = $request->validated();
        $teacher = $account->isTeacher() ? $account->teacher : null;
        $oldPhotoPath = $teacher?->photo_path;
        $newPhotoPath = $account->isTeacher() && $request->hasFile('photo')
            ? $request->file('photo')->store('profile-photos/teachers', 'public')
            : null;

        try {
            DB::transaction(function () use ($account, $data, $teacher, $newPhotoPath): void {
                $account->update([
                    'name' => $data['name'],
                    'email' => $data['email'],
                    'contact' => $data['contact'],
                ]);

                if ($account->isTeacher()) {
                    abort_unless($teacher, 404, 'Data pengajar tidak ditemukan.');
                    $teacher->update(collect($data)->except(['name', 'email', 'contact', 'photo'])->merge([
                        'name' => $data['name'],
                        'email' => $data['email'],
                        'contact' => $data['contact'],
                        ...($newPhotoPath ? ['photo_path' => $newPhotoPath] : []),
                    ])->all());

                    return;
                }

                $this->parentStudents($account)->each->update([
                    'parent_email' => $data['email'],
                    'parent_contact' => $data['contact'],
                ]);
            });
        } catch (\Throwable $exception) {
            if ($newPhotoPath) {
                Storage::disk('public')->delete($newPhotoPath);
            }

            throw $exception;
        }

        if ($newPhotoPath && $oldPhotoPath) {
            Storage::disk('public')->delete($oldPhotoPath);
        }

        return back()->with('success', 'Profil berhasil diperbarui.');
    }

    public function updateStudentProfile(UpdatePortalStudentRequest $request, Student $student): RedirectResponse
    {
        $data = $request->validated();
        $oldPhotoPath = $student->photo_path;
        $newPhotoPath = $request->hasFile('photo')
            ? $request->file('photo')->store('profile-photos/students', 'public')
            : null;

        try {
            $student->update([
                ...collect($data)->except('photo')->all(),
                ...($newPhotoPath ? ['photo_path' => $newPhotoPath] : []),
            ]);
        } catch (\Throwable $exception) {
            if ($newPhotoPath) {
                Storage::disk('public')->delete($newPhotoPath);
            }

            throw $exception;
        }

        if ($newPhotoPath && $oldPhotoPath) {
            Storage::disk('public')->delete($oldPhotoPath);
        }

        return back()->with('success', "Profil {$student->name} berhasil diperbarui.");
    }

    public function password(): Response
    {
        return Inertia::render('Portal/Password', [
            'account_type' => $this->account()->isTeacher() ? 'teacher' : 'parent',
            'must_change' => $this->account()->must_change_password,
        ]);
    }

    public function updatePassword(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'current_password' => ['required', 'string', 'current_password:portal'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ], [
            'current_password.current_password' => 'Password saat ini salah.',
            'password.confirmed' => 'Konfirmasi password tidak cocok.',
            'password.min' => 'Password minimal 8 karakter.',
        ]);

        $account = $this->account();
        $account->update([
            'password' => Hash::make($data['password']),
            'must_change_password' => false,
        ]);

        return redirect()->route('portal.dashboard')->with('success', 'Password berhasil diperbarui.');
    }

    private function authorizeTeacherClass(ClassGroup $classGroup): void
    {
        $account = $this->account();

        if (! $account->isTeacher() || $classGroup->teacher_id !== $account->teacher_id) {
            abort(403, 'Anda tidak mengajar di kelas ini.');
        }
    }

    /**
     * @return Collection<int, ClassGroup>
     */
    private function accountClasses(PortalAccount $account, ?Student $student = null)
    {
        if ($account->isParent()) {
            $studentId = $student?->id ?? $account->student_id;
            if ($studentId) {
                return ClassGroup::query()
                    ->whereHas('activeMembers', fn ($query) => $query->where('student_id', $studentId))
                    ->with('program:id,name')
                    ->get();
            }
        }

        if ($account->isTeacher() && $account->teacher_id) {
            return ClassGroup::query()
                ->where('teacher_id', $account->teacher_id)
                ->with('program:id,name')
                ->get();
        }

        return collect();
    }

    /**
     * @return array<string, mixed>
     */
    private function studentSummary(PortalAccount $account, ?Student $student = null): array
    {
        $studentId = $student?->id ?? $account->student_id;

        if (! $studentId) {
            return [
                'student_name' => 'Belum ada anak terdaftar',
                'classes' => [],
                'unpaid_count' => 0,
                'unpaid_total' => 0.0,
                'contact' => $account->contact,
                'recent_attendance' => [],
                'recent_grades' => [],
                'stats' => [
                    'total_classes' => 0,
                    'total_recorded_meetings' => 0,
                    'hadir_count' => 0,
                    'izin_count' => 0,
                    'sakit_count' => 0,
                    'alpa_count' => 0,
                    'attendance_rate' => null,
                    'average_score' => null,
                    'average_understanding' => null,
                    'highest_score' => null,
                    'completed_sessions' => 0,
                    'total_sessions_target' => 0,
                    'progress_percent' => 0,
                ],
                'upcoming_schedules' => [],
                'latest_evaluation' => null,
                'attendance_trend' => [],
                'grade_by_subject' => [],
                'classes_detailed' => [],
            ];
        }

        $classes = $this->accountClasses($account, $student);
        $classes->load(['program:id,name,level', 'teacher:id,name,contact', 'schedules', 'package:id,name,sessions']);
        $activeClasses = $classes->where('is_active', true)->values();

        $unpaid = Invoice::query()
            ->where('student_id', $studentId)
            ->whereIn('status', [Invoice::STATUS_UNPAID, Invoice::STATUS_PENDING, Invoice::STATUS_EXPIRED])
            ->orderBy('due_date')
            ->get();

        $allAttendances = Attendance::query()
            ->where('student_id', $studentId)
            ->where('status', '!=', 'belum_absen')
            ->with(['classGroup.teacher:id,name', 'classGroup.program:id,name'])
            ->orderByDesc('date')
            ->get();

        $allGrades = Grade::query()
            ->where('student_id', $studentId)
            ->with('classGroup:id,name')
            ->orderByDesc('created_at')
            ->get();

        $pendingRegistrations = StudentRegistration::query()
            ->where(function ($q) use ($studentId, $student, $account): void {
                $q->where('student_id', $studentId);
                if ($student) {
                    $q->orWhere(function ($sub) use ($student, $account): void {
                        $sub->where('student_name', $student->name)
                            ->where(function ($inner) use ($student, $account): void {
                                $inner->where('parent_contact', $student->parent_contact)
                                    ->orWhere('parent_email', $student->parent_email ?? $account->email);
                            });
                    });
                }
            })
            ->where('status', 'pending')
            ->with(['programItem:id,name', 'packageItem:id,name,price'])
            ->latest()
            ->get();

        $nowJakarta = Carbon::now('Asia/Jakarta');
        $todayStr = $nowJakarta->toDateString();
        $todayIso = (int) $nowJakarta->dayOfWeekIso;

        $pastAttendances = $allAttendances->filter(fn ($a) => ($a->date?->format('Y-m-d') ?? substr((string) $a->date, 0, 10)) <= $todayStr);
        $totalRecorded = $pastAttendances->count();
        $hadirCount = $pastAttendances->where('status', 'hadir')->count();
        $izinCount = $pastAttendances->where('status', 'izin')->count();
        $sakitCount = $pastAttendances->where('status', 'sakit')->count();
        $alpaCount = $pastAttendances->where('status', 'alpa')->count();
        $attendanceRate = $totalRecorded > 0 ? round(($hadirCount / $totalRecorded) * 100) : null;

        $scoredAttendances = $pastAttendances->whereNotNull('understanding_score');
        $avgUnderstanding = $scoredAttendances->count() > 0 ? round((float) $scoredAttendances->avg('understanding_score'), 1) : null;

        $avgScore = $allGrades->count() > 0 ? round((float) $allGrades->avg('score'), 1) : null;
        $highestScore = $allGrades->count() > 0 ? (float) $allGrades->max('score') : null;

        $totalSessionsTarget = (int) $activeClasses->sum(fn ($c) => $c->total_sessions ?? $c->package?->sessions ?? 8);
        $progressPercent = $totalSessionsTarget > 0 ? min(100, round(($hadirCount / $totalSessionsTarget) * 100)) : 0;

        $upcomingList = [];
        foreach ($activeClasses as $cls) {
            foreach ($cls->schedules as $sch) {
                $daysUntil = ($sch->day_of_week - $todayIso + 7) % 7;
                $upcomingList[] = [
                    'id' => $sch->id,
                    'class_id' => $cls->id,
                    'class_name' => $cls->name,
                    'program_name' => $cls->program?->name ?? 'Program Belajar',
                    'teacher_name' => $cls->teacher?->name ?? 'Tutor ALC',
                    'day_of_week' => $sch->day_of_week,
                    'day' => $sch->dayLabel(),
                    'start_time' => substr((string) $sch->start_time, 0, 5),
                    'end_time' => substr((string) $sch->end_time, 0, 5),
                    'room' => $sch->room,
                    'is_today' => $sch->day_of_week === $todayIso,
                    'days_until' => $daysUntil,
                ];
            }
        }
        usort($upcomingList, function ($a, $b) {
            if ($a['days_until'] === $b['days_until']) {
                return strcmp($a['start_time'], $b['start_time']);
            }

            return $a['days_until'] <=> $b['days_until'];
        });

        $latestEval = $allAttendances
            ->first(fn ($a) => ! empty($a->evaluation) || ! empty($a->material));

        $latestEvalData = $latestEval ? [
            'date' => $latestEval->date?->format('Y-m-d') ?? substr((string) $latestEval->date, 0, 10),
            'formatted_date' => $latestEval->date ? Carbon::parse($latestEval->date)->locale('id')->translatedFormat('d F Y') : null,
            'subject' => $latestEval->subject ?? 'Materi Belajar',
            'material' => $latestEval->material,
            'evaluation' => $latestEval->evaluation,
            'understanding_score' => $latestEval->understanding_score,
            'teacher_name' => $latestEval->classGroup?->teacher?->name ?? 'Tutor ALC',
            'class_name' => $latestEval->classGroup?->name ?? 'Kelas',
        ] : null;

        $attendanceTrend = $allAttendances->take(8)->map(function ($a) use ($todayStr) {
            $recDate = $a->date?->format('Y-m-d') ?? substr((string) $a->date, 0, 10);
            $status = $a->status;
            if ($recDate > $todayStr && ($status === 'alpa' || $status === 'belum_absen')) {
                $status = 'terjadwal';
            }

            return [
                'date' => $a->date ? Carbon::parse($a->date)->locale('id')->translatedFormat('d M') : substr((string) $a->date, 5, 5),
                'full_date' => $recDate,
                'status' => $status,
                'subject' => $a->subject,
                'material' => $a->material,
                'score' => $a->understanding_score,
            ];
        })->reverse()->values()->all();

        $gradeBySubject = $allGrades->groupBy('subject')->map(function ($subjectGrades, $subject) {
            return [
                'subject' => $subject,
                'average' => round((float) $subjectGrades->avg('score'), 1),
                'highest' => (float) $subjectGrades->max('score'),
                'count' => $subjectGrades->count(),
                'latest_score' => (float) $subjectGrades->first()?->score,
            ];
        })->values()->all();

        $classesDetailed = $classes->map(function (ClassGroup $c) use ($allAttendances, $todayStr) {
            $clsAtt = $allAttendances->where('class_group_id', $c->id);
            $clsPast = $clsAtt->filter(fn ($a) => ($a->date?->format('Y-m-d') ?? substr((string) $a->date, 0, 10)) <= $todayStr);
            $clsHeld = $clsPast->count();
            $clsHadir = $clsPast->where('status', 'hadir')->count();
            $target = $c->total_sessions ?? $c->package?->sessions ?? 8;
            $scored = $clsPast->whereNotNull('understanding_score');
            $avgUnd = $scored->count() > 0 ? round((float) $scored->avg('understanding_score'), 1) : null;

            return [
                'id' => $c->id,
                'name' => $c->name,
                'program_name' => $c->program?->name ?? 'Program Belajar',
                'level' => $c->level ?? $c->program?->level,
                'teacher_name' => $c->teacher?->name,
                'teacher_contact' => $c->teacher?->contact,
                'is_active' => $c->is_active,
                'total_sessions' => $target,
                'attended_sessions' => $clsHadir,
                'total_held' => $clsHeld,
                'progress_percent' => $target > 0 ? min(100, round(($clsHadir / $target) * 100)) : 0,
                'attendance_rate' => $clsHeld > 0 ? round(($clsHadir / $clsHeld) * 100) : null,
                'average_understanding' => $avgUnd,
                'schedules' => $c->schedules->map(fn ($s) => [
                    'day' => $s->dayLabel(),
                    'start_time' => substr((string) $s->start_time, 0, 5),
                    'end_time' => substr((string) $s->end_time, 0, 5),
                    'room' => $s->room,
                ])->values()->all(),
            ];
        })->values()->all();

        return [
            'student_name' => $student?->name ?? 'Anak',
            'classes' => $activeClasses->map(fn (ClassGroup $class) => [
                'id' => $class->id,
                'name' => $class->name,
                'program' => $class->program?->name ?? '-',
            ])->values()->all(),
            'pending_registrations' => $pendingRegistrations->map(fn (StudentRegistration $reg) => [
                'id' => $reg->id,
                'ticket' => $reg->registration_no,
                'program' => $reg->programItem?->name ?? $reg->program,
                'package' => $reg->packageItem?->name ?? $reg->package,
                'subjects' => $reg->subjects,
                'preferred_mode' => $reg->preferred_mode ? ucfirst($reg->preferred_mode) : 'Offline',
                'created_at' => $reg->created_at?->diffForHumans() ?? 'Baru saja',
            ])->values()->all(),
            'unpaid_count' => $unpaid->count(),
            'unpaid_total' => (float) $unpaid->sum('amount'),
            'contact' => $account->contact,
            'recent_attendance' => $allAttendances->take(5)->map(function (Attendance $attendance) use ($todayStr) {
                $recDate = $attendance->date?->format('Y-m-d') ?? substr((string) $attendance->date, 0, 10);
                $status = $attendance->status;
                if ($recDate > $todayStr && ($status === 'alpa' || $status === 'belum_absen')) {
                    $status = 'terjadwal';
                }

                return [
                    'class' => $attendance->classGroup?->name ?? '-',
                    'date' => $attendance->date,
                    'status' => $status,
                    'subject' => $attendance->subject,
                    'material' => $attendance->material,
                    'understanding_score' => $attendance->understanding_score,
                ];
            })->values()->all(),
            'recent_grades' => $allGrades->take(5)->map(fn (Grade $grade) => [
                'class' => $grade->classGroup?->name ?? '-',
                'subject' => $grade->subject,
                'term' => $grade->term,
                'score' => $grade->score,
            ])->values()->all(),
            'stats' => [
                'total_classes' => $activeClasses->count(),
                'total_recorded_meetings' => $totalRecorded,
                'hadir_count' => $hadirCount,
                'izin_count' => $izinCount,
                'sakit_count' => $sakitCount,
                'alpa_count' => $alpaCount,
                'attendance_rate' => $attendanceRate,
                'average_score' => $avgScore,
                'average_understanding' => $avgUnderstanding,
                'highest_score' => $highestScore,
                'completed_sessions' => $hadirCount,
                'total_sessions_target' => $totalSessionsTarget,
                'progress_percent' => $progressPercent,
            ],
            'upcoming_schedules' => $upcomingList,
            'latest_evaluation' => $latestEvalData,
            'attendance_trend' => $attendanceTrend,
            'grade_by_subject' => $gradeBySubject,
            'classes_detailed' => $classesDetailed,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function teacherSummary(PortalAccount $account): array
    {
        $classes = ClassGroup::query()
            ->where('is_active', true)
            ->where('teacher_id', $account->teacher_id)
            ->with([
                'program:id,name,level',
                'package:id,name,sessions',
                'schedules',
                'members.student:id,name,level,class_level',
            ])
            ->withCount('activeMembers')
            ->get();

        $nowJakarta = Carbon::now('Asia/Jakarta');
        $todayIso = (int) $nowJakarta->dayOfWeekIso;
        $todayDate = $nowJakarta->toDateString();

        $classIds = $classes->pluck('id');
        $allAttendances = Attendance::query()
            ->whereIn('class_group_id', $classIds)
            ->with('classGroup:id,name')
            ->orderByDesc('date')
            ->get();

        $recordedAttendances = $allAttendances->where('status', '!=', 'belum_absen');
        $totalRecorded = $recordedAttendances->count();
        $hadirCount = $recordedAttendances->where('status', 'hadir')->count();
        $izinCount = $recordedAttendances->where('status', 'izin')->count();
        $sakitCount = $recordedAttendances->where('status', 'sakit')->count();
        $alpaCount = $recordedAttendances->where('status', 'alpa')->count();
        $pendingSessions = $allAttendances->where('status', 'belum_absen')->count();
        $overallAttendanceRate = $totalRecorded > 0 ? round(($hadirCount / $totalRecorded) * 100) : null;

        $allMembers = $classes->flatMap(fn ($c) => $c->members->where('status', 'active'));
        $uniqueStudentCount = $allMembers->pluck('student_id')->unique()->count();

        $todayAgenda = [];
        foreach ($classes as $c) {
            foreach ($c->schedules as $s) {
                if ($s->day_of_week === $todayIso) {
                    $hasAttendanceToday = $allAttendances
                        ->where('class_group_id', $c->id)
                        ->where('status', '!=', 'belum_absen')
                        ->filter(fn ($a) => ($a->date?->format('Y-m-d') ?? substr((string) $a->date, 0, 10)) === $todayDate)
                        ->isNotEmpty();

                    $todayAgenda[] = [
                        'schedule_id' => $s->id,
                        'class_id' => $c->id,
                        'class_name' => $c->name,
                        'program_name' => $c->program?->name ?? 'Program',
                        'level' => $c->level ?? $c->program?->level,
                        'start_time' => substr((string) $s->start_time, 0, 5),
                        'end_time' => substr((string) $s->end_time, 0, 5),
                        'room' => $s->room,
                        'student_count' => $c->active_members_count,
                        'has_attendance_today' => $hasAttendanceToday,
                    ];
                }
            }
        }
        usort($todayAgenda, fn ($a, $b) => strcmp($a['start_time'], $b['start_time']));

        $weeklySchedule = [];
        for ($d = 1; $d <= 7; $d++) {
            $dayLabel = Schedule::DAYS[$d] ?? "Hari $d";
            $daySchedules = [];
            foreach ($classes as $c) {
                foreach ($c->schedules as $s) {
                    if ($s->day_of_week === $d) {
                        $daySchedules[] = [
                            'class_id' => $c->id,
                            'class_name' => $c->name,
                            'program' => $c->program?->name ?? 'Program',
                            'level' => $c->level ?? $c->program?->level,
                            'start_time' => substr((string) $s->start_time, 0, 5),
                            'end_time' => substr((string) $s->end_time, 0, 5),
                            'room' => $s->room,
                            'student_count' => $c->active_members_count,
                        ];
                    }
                }
            }
            usort($daySchedules, fn ($a, $b) => strcmp($a['start_time'], $b['start_time']));
            $weeklySchedule[] = [
                'day_of_week' => $d,
                'day' => $dayLabel,
                'is_today' => $d === $todayIso,
                'count' => count($daySchedules),
                'schedules' => $daySchedules,
            ];
        }

        $recentActivities = $recordedAttendances
            ->groupBy(fn ($a) => $a->class_group_id.'_'.($a->date?->format('Y-m-d') ?? substr((string) $a->date, 0, 10)))
            ->take(5)
            ->map(function ($group) {
                $first = $group->first();
                $presentCount = $group->where('status', 'hadir')->count();
                $totalCount = $group->count();

                return [
                    'class_id' => $first->class_group_id,
                    'class_name' => $first->classGroup?->name ?? 'Kelas',
                    'date' => $first->date?->format('Y-m-d') ?? substr((string) $first->date, 0, 10),
                    'formatted_date' => $first->date ? Carbon::parse($first->date)->locale('id')->translatedFormat('d M Y') : '-',
                    'subject' => $first->subject ?? 'Materi Belajar',
                    'material' => $first->material,
                    'present_count' => $presentCount,
                    'total_count' => $totalCount,
                ];
            })
            ->values()
            ->all();

        $classesDetailed = $classes->map(function (ClassGroup $c) use ($allAttendances) {
            $clsAtt = $allAttendances->where('class_group_id', $c->id);
            $clsRecorded = $clsAtt->where('status', '!=', 'belum_absen');
            $clsHeldDates = $clsRecorded->pluck('date')->map(fn ($d) => is_string($d) ? substr($d, 0, 10) : $d->toDateString())->unique()->count();
            $clsHadir = $clsRecorded->where('status', 'hadir')->count();
            $clsTotal = $clsRecorded->count();
            $targetSessions = $c->total_sessions ?? $c->package?->sessions ?? 8;
            $rate = $clsTotal > 0 ? round(($clsHadir / $clsTotal) * 100) : null;
            $scored = $clsRecorded->whereNotNull('understanding_score');
            $avgScore = $scored->count() > 0 ? round((float) $scored->avg('understanding_score'), 1) : null;

            return [
                'id' => $c->id,
                'name' => $c->name,
                'program' => $c->program?->name ?? '-',
                'level' => $c->level ?? $c->program?->level,
                'package_name' => $c->package?->name,
                'filled' => $c->active_members_count ?? 0,
                'quota' => $c->quota,
                'total_sessions' => $targetSessions,
                'sessions_held' => $clsHeldDates,
                'attendance_rate' => $rate,
                'average_understanding' => $avgScore,
                'schedules' => $c->schedules->map(fn (Schedule $schedule) => [
                    'day' => $schedule->dayLabel(),
                    'start_time' => substr((string) $schedule->start_time, 0, 5),
                    'end_time' => substr((string) $schedule->end_time, 0, 5),
                    'room' => $schedule->room,
                ])->values()->all(),
            ];
        })->values()->all();

        return [
            'classes' => $classes->map(fn (ClassGroup $class) => [
                'id' => $class->id,
                'name' => $class->name,
                'program' => $class->program?->name ?? '-',
                'filled' => $class->active_members_count ?? 0,
                'quota' => $class->quota,
                'schedules' => $class->schedules->map(fn (Schedule $schedule) => [
                    'day' => $schedule->dayLabel(),
                    'start_time' => substr((string) $schedule->start_time, 0, 5),
                    'end_time' => substr((string) $schedule->end_time, 0, 5),
                ])->values()->all(),
            ])->values()->all(),
            'stats' => [
                'total_classes' => $classes->count(),
                'total_students' => $uniqueStudentCount,
                'total_sessions_recorded' => $totalRecorded,
                'total_sessions_pending' => $pendingSessions,
                'overall_attendance_rate' => $overallAttendanceRate,
                'today_sessions_count' => count($todayAgenda),
                'breakdown' => [
                    'hadir' => $hadirCount,
                    'izin' => $izinCount,
                    'sakit' => $sakitCount,
                    'alpa' => $alpaCount,
                ],
            ],
            'today_agenda' => $todayAgenda,
            'weekly_schedule' => $weeklySchedule,
            'recent_activities' => $recentActivities,
            'classes_detailed' => $classesDetailed,
        ];
    }
}
