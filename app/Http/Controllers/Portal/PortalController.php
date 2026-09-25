<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\ClassGroup;
use App\Models\ClassMember;
use App\Models\Grade;
use App\Models\Invoice;
use App\Models\PortalAccount;
use App\Models\Schedule;
use App\Support\AcademicService;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;
use RuntimeException;

class PortalController extends Controller
{
    private function account(): PortalAccount
    {
        return Auth::guard('portal')->user();
    }

    public function dashboard(): Response
    {
        $account = $this->account();

        if ($account->isStudent()) {
            return Inertia::render('Portal/Dashboard', [
                'account_type' => 'student',
                'summary' => $this->studentSummary($account),
            ]);
        }

        return Inertia::render('Portal/Dashboard', [
            'account_type' => 'teacher',
            'summary' => $this->teacherSummary($account),
        ]);
    }

    public function schedule(): Response
    {
        $account = $this->account();

        $classes = $this->accountClasses($account);

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
            'account_type' => $account->type,
            'schedules' => $items,
        ]);
    }

    public function attendance(): Response
    {
        $account = $this->account();

        if (! $account->isStudent() || ! $account->student_id) {
            return Inertia::render('Portal/Attendance', [
                'account_type' => $account->type,
                'records' => [],
                'rate' => null,
            ]);
        }

        $records = Attendance::query()
            ->with('classGroup:id,name')
            ->where('student_id', $account->student_id)
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
            'account_type' => $account->type,
            'records' => $records,
            'rate' => $total > 0 ? round($present / $total * 100) : null,
        ]);
    }

    public function grades(): Response
    {
        $account = $this->account();

        if (! $account->isStudent() || ! $account->student_id) {
            return Inertia::render('Portal/Grades', [
                'account_type' => $account->type,
                'grades' => [],
            ]);
        }

        $grades = Grade::query()
            ->with('classGroup:id,name')
            ->where('student_id', $account->student_id)
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
            'account_type' => $account->type,
            'grades' => $grades,
        ]);
    }

    public function invoices(): Response
    {
        $account = $this->account();

        if (! $account->isStudent()) {
            abort(403, 'Halaman tagihan hanya untuk murid.');
        }

        $invoices = Invoice::query()
            ->with('program:id,name')
            ->where('student_id', $account->student_id)
            ->latest()
            ->get()
            ->map(fn (Invoice $invoice) => [
                'invoice_no' => $invoice->invoice_no,
                'program' => $invoice->program?->name ?? '-',
                'amount' => $invoice->amount,
                'status' => $invoice->status,
                'due_date' => $invoice->due_date,
                'paid_at' => $invoice->paid_at,
            ])
            ->values()
            ->all();

        return Inertia::render('Portal/Invoices', [
            'account_type' => $account->type,
            'contact' => $account->contact,
            'invoices' => $invoices,
        ]);
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
            'date' => ['required', 'date', 'before_or_equal:today'],
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
        $account->load(['student:id,name,program,school_name,level', 'teacher:id,name,education,subjects']);

        return Inertia::render('Portal/Profile', [
            'account_type' => $account->type,
            'account' => [
                'name' => $account->name,
                'contact' => $account->contact,
                'must_change_password' => $account->must_change_password,
                'last_login_at' => $account->last_login_at,
            ],
            'linked' => $account->isStudent() ? $account->student : $account->teacher,
        ]);
    }

    public function password(): Response
    {
        return Inertia::render('Portal/Password', [
            'account_type' => $this->account()->type,
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
    private function accountClasses(PortalAccount $account)
    {
        if ($account->isStudent() && $account->student_id) {
            return ClassGroup::query()
                ->where('is_active', true)
                ->whereHas('activeMembers', fn ($query) => $query->where('student_id', $account->student_id))
                ->with('program:id,name')
                ->get();
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
    private function studentSummary(PortalAccount $account): array
    {
        $classes = $this->accountClasses($account);

        $unpaid = Invoice::query()
            ->where('student_id', $account->student_id)
            ->whereIn('status', [Invoice::STATUS_UNPAID, Invoice::STATUS_PENDING, Invoice::STATUS_EXPIRED])
            ->orderBy('due_date')
            ->get();

        $attendances = Attendance::query()
            ->where('student_id', $account->student_id)
            ->latest('date')
            ->limit(5)
            ->with('classGroup:id,name')
            ->get();

        $grades = Grade::query()
            ->where('student_id', $account->student_id)
            ->latest()
            ->limit(5)
            ->with('classGroup:id,name')
            ->get();

        return [
            'classes' => $classes->map(fn (ClassGroup $class) => [
                'id' => $class->id,
                'name' => $class->name,
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
