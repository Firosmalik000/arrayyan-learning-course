<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePortalProgramEnrollmentRequest;
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

        $classesData = $classes->map(function (ClassGroup $cls) use ($attendances): array {
            $clsAttendances = $attendances
                ->where('class_group_id', $cls->id)
                ->map(fn (Attendance $a) => [
                    'id' => $a->id,
                    'student_id' => $a->student_id,
                    'date' => $a->date?->format('Y-m-d') ?? substr((string) $a->date, 0, 10),
                    'status' => $a->status,
                    'note' => $a->note,
                ])
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
                'filled' => $cls->activeMembers()->count(),
                'members_count' => $cls->activeMembers()->count(),
                'members' => $classMembers,
                'schedules' => $clsSchedules,
                'attendances' => $clsAttendances,
            ];
        })->values()->all();

        $items = Schedule::query()
            ->with('classGroup:id,name,program_id,teacher_id')
            ->whereIn('class_group_id', $classes->pluck('id'))
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

        $records = Attendance::query()
            ->with('classGroup:id,name')
            ->where('student_id', $student->id)
            ->latest('date')
            ->limit(100)
            ->get()
            ->map(fn (Attendance $attendance) => [
                'class' => $attendance->classGroup?->name ?? '-',
                'date' => $attendance->date,
                'status' => $attendance->status,
                'note' => $attendance->note,
            ])
            ->values()
            ->all();

        $total = count($records);
        $present = count(array_filter($records, fn (array $row) => $row['status'] === 'hadir'));

        return Inertia::render('Portal/Attendance', [
            'account_type' => 'parent',
            'selected_student' => [
                'id' => $student->id,
                'name' => $student->name,
            ],
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
                    'amount' => $invoice->amount,
                    'status' => $invoice->status,
                    'due_date' => $invoice->due_date,
                    'paid_at' => $invoice->paid_at,
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

    public function storeClassAttendance(Request $request, ClassGroup $classGroup): RedirectResponse
    {
        $this->authorizeTeacherClass($classGroup);

        $data = $request->validate([
            'date' => ['required', 'date'],
            'rows' => ['required', 'array', 'min:1'],
            'rows.*.student_id' => ['required', 'integer', 'exists:students,id'],
            'rows.*.status' => ['required', 'string', 'in:hadir,izin,sakit,alpa'],
            'rows.*.note' => ['nullable', 'string', 'max:255'],
        ]);

        try {
            $saved = AcademicService::saveAttendance($classGroup, $data['date'], $data['rows'], null);
        } catch (RuntimeException $e) {
            return back()->with('error', $e->getMessage());
        }

        return back()->with('success', "Absensi {$saved} murid tersimpan.");
    }

    public function storeClassSchedule(Request $request, ClassGroup $classGroup): RedirectResponse
    {
        $this->authorizeTeacherClass($classGroup);

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

        $schedule->delete();

        return back()->with('success', 'Jadwal dihapus.');
    }

    public function generateClassSessions(Request $request, ClassGroup $classGroup): RedirectResponse
    {
        $this->authorizeTeacherClass($classGroup);

        $data = $request->validate([
            'dates' => ['nullable', 'array'],
            'dates.*' => ['required', 'date'],
            'start_date' => ['nullable', 'date'],
            'count' => ['nullable', 'integer', 'min:1', 'max:50'],
        ]);

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
        $account->load(['teacher:id,name,education,subjects']);

        $students = $this->parentStudents($account)->map(fn ($s) => [
            'id' => $s->id,
            'name' => $s->name,
            'program' => $s->program,
            'level' => $s->level,
            'school_name' => $s->school_name,
        ])->values()->all();

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
            'linked' => $account->isTeacher() ? $account->teacher : ($students[0] ?? null),
        ]);
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
                    ->where('is_active', true)
                    ->whereHas('activeMembers', fn ($query) => $query->where('student_id', $studentId))
                    ->with('program:id,name')
                    ->get();
            }
        }

        if ($account->isTeacher() && $account->teacher_id) {
            return ClassGroup::query()
                ->where('is_active', true)
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
            ];
        }

        $classes = $this->accountClasses($account, $student);

        $unpaid = Invoice::query()
            ->where('student_id', $studentId)
            ->whereIn('status', [Invoice::STATUS_UNPAID, Invoice::STATUS_PENDING, Invoice::STATUS_EXPIRED])
            ->orderBy('due_date')
            ->get();

        $attendances = Attendance::query()
            ->where('student_id', $studentId)
            ->latest('date')
            ->limit(5)
            ->with('classGroup:id,name')
            ->get();

        $grades = Grade::query()
            ->where('student_id', $studentId)
            ->latest()
            ->limit(5)
            ->with('classGroup:id,name')
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

        return [
            'student_name' => $student?->name ?? 'Anak',
            'classes' => $classes->map(fn (ClassGroup $class) => [
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
            'recent_attendance' => $attendances->map(fn (Attendance $attendance) => [
                'class' => $attendance->classGroup?->name ?? '-',
                'date' => $attendance->date,
                'status' => $attendance->status,
            ])->values()->all(),
            'recent_grades' => $grades->map(fn (Grade $grade) => [
                'class' => $grade->classGroup?->name ?? '-',
                'subject' => $grade->subject,
                'term' => $grade->term,
                'score' => $grade->score,
            ])->values()->all(),
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
            ->with('program:id,name')
            ->withCount('activeMembers')
            ->with('schedules')
            ->get();

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
        ];
    }
}
