<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\SaveClassGroupRequest;
use App\Http\Requests\StoreAttendanceRequest;
use App\Models\ActivityLog;
use App\Models\Attendance;
use App\Models\ClassGroup;
use App\Models\ClassMember;
use App\Models\Grade;
use App\Models\Package;
use App\Models\Program;
use App\Models\Schedule;
use App\Models\Student;
use App\Models\Teacher;
use App\Support\AcademicService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;
use RuntimeException;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AcademicController extends Controller
{
    public function index(): Response
    {
        $classes = ClassGroup::query()
            ->with([
                'program:id,name,level',
                'package:id,name,level,sessions',
                'teacher:id,name',
                'members.student:id,name,school_name,level,class_level,parent_contact,parent_email,address,preferred_mode,program,package,package_id,notes',
                'members.student.packageItem:id,name,level,sessions',
                'schedules',
                'attendances:id,class_group_id,student_id,date,status,subject,material,understanding_score,evaluation,note',
            ])
            ->withCount(['activeMembers'])
            ->latest()
            ->get()
            ->map(fn (ClassGroup $class) => $this->formatClass($class));

        $students = Student::query()
            ->where('is_active', true)
            ->with(['programItem:id,name', 'packageItem:id,name,level,sessions'])
            ->orderBy('name')
            ->get()
            ->map(function (Student $student) {
                $activePrograms = ClassMember::query()
                    ->where('student_id', $student->id)
                    ->where('status', ClassMember::STATUS_ACTIVE)
                    ->with('classGroup:id,program_id')
                    ->get()
                    ->map(fn (ClassMember $member) => $member->classGroup?->program_id)
                    ->filter()
                    ->values()
                    ->all();

                return [
                    'id' => $student->id,
                    'name' => $student->name,
                    'school_name' => $student->school_name,
                    'level' => $student->level,
                    'class_level' => $student->class_level,
                    'parent_contact' => $student->parent_contact,
                    'program_id' => $student->program_id,
                    'program' => $student->programItem?->name ?? $student->program,
                    'package_id' => $student->package_id,
                    'package' => $student->packageItem?->name ?? $student->package,
                    'package_sessions' => $student->packageItem?->sessions,
                    'has_paid' => AcademicService::hasPaidInvoice($student->id),
                    'active_program_ids' => $activePrograms,
                ];
            });

        $programs = Program::query()
            ->where('is_active', true)
            ->with(['packages' => fn ($q) => $q->where('is_active', true)->orderBy('sort_order')->orderBy('sessions')])
            ->orderBy('name')
            ->get(['id', 'name', 'level', 'quota'])
            ->map(fn (Program $p) => [
                'id' => $p->id,
                'name' => $p->name,
                'level' => $p->level,
                'quota' => $p->quota,
                'packages' => $p->packages->map(fn (Package $pkg) => [
                    'id' => $pkg->id,
                    'name' => $pkg->name,
                    'level' => $pkg->level,
                    'sessions' => $pkg->sessions,
                    'max_participants' => $pkg->max_participants,
                ])->values()->all(),
            ]);

        return Inertia::render('Admin/Academic', [
            'classes' => $classes,
            'programs' => $programs,
            'teachers' => Teacher::query()
                ->where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name']),
            'students' => $students,
            'days' => Schedule::DAYS,
        ]);
    }

    public function storeClass(SaveClassGroupRequest $request): RedirectResponse
    {
        $data = $request->validated();

        if (! empty($data['package_id'])) {
            $pkg = Package::find($data['package_id']);
            if ($pkg) {
                $data['total_sessions'] = $data['total_sessions'] ?? $pkg->sessions;
                $data['level'] = $data['level'] ?? $pkg->level;
            }
        }

        ClassGroup::create([
            ...$data,
            'is_active' => (bool) ($data['is_active'] ?? true),
        ]);

        ActivityLog::record('akademik.kelas.buat', "Kelas \"{$data['name']}\" dibuat.");

        return back()->with('success', 'Kelas berhasil ditambahkan.');
    }

    public function updateClass(SaveClassGroupRequest $request, ClassGroup $classGroup): RedirectResponse
    {
        $data = $request->validated();

        if (! empty($data['package_id'])) {
            $pkg = Package::find($data['package_id']);
            if ($pkg) {
                $data['total_sessions'] = $data['total_sessions'] ?? $pkg->sessions;
                $data['level'] = $data['level'] ?? $pkg->level;
            }
        }

        if (array_key_exists('teacher_id', $data) || array_key_exists('is_active', $data)) {
            $teacherId = $data['teacher_id'] ?? $classGroup->teacher_id;

            foreach ($classGroup->schedules as $schedule) {
                try {
                    AcademicService::assertNoTeacherClash(
                        $teacherId,
                        $schedule->day_of_week,
                        $schedule->start_time,
                        $schedule->end_time,
                        $classGroup->id,
                        $schedule->id
                    );
                } catch (RuntimeException $e) {
                    return back()->with('error', $e->getMessage());
                }
            }
        }

        $classGroup->update([
            ...$data,
            'is_active' => (bool) ($data['is_active'] ?? $classGroup->is_active),
        ]);

        return back()->with('success', 'Kelas berhasil diperbarui.');
    }

    public function destroyClass(ClassGroup $classGroup): RedirectResponse
    {
        $classGroup->delete();

        return back()->with('success', 'Kelas beserta jadwal, absensi, dan nilainya dihapus.');
    }

    public function addMember(Request $request, ClassGroup $classGroup): RedirectResponse
    {
        $data = $request->validate([
            'student_ids' => ['required', 'array', 'min:1', 'max:100'],
            'student_ids.*' => ['integer', 'exists:students,id'],
            'is_scholarship' => ['nullable', 'boolean'],
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        $added = 0;
        $skipped = [];

        foreach ($data['student_ids'] as $studentId) {
            try {
                AcademicService::addMember(
                    $classGroup->fresh(),
                    (int) $studentId,
                    (bool) ($data['is_scholarship'] ?? false),
                    $data['notes'] ?? null
                );
                $added++;
            } catch (RuntimeException $e) {
                $skipped[] = "#{$studentId}: {$e->getMessage()}";
            }
        }

        $message = "Berhasil menambahkan {$added} murid ke kelas.";
        if ($skipped !== []) {
            $message .= ' Dilewati: '.implode(' | ', array_slice($skipped, 0, 3));
            if (count($skipped) > 3) {
                $message .= ' (+'.(count($skipped) - 3).' lainnya)';
            }
        }

        return back()->with('success', $message);
    }

    public function removeMember(ClassMember $member): RedirectResponse
    {
        $member->delete();

        return back()->with('success', 'Anggota dikeluarkan dari kelas.');
    }

    public function storeSchedule(Request $request, ClassGroup $classGroup): RedirectResponse
    {
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

    public function updateSchedule(Request $request, Schedule $schedule): RedirectResponse
    {
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

    public function destroySchedule(Schedule $schedule): RedirectResponse
    {
        $schedule->delete();

        return back()->with('success', 'Jadwal dihapus.');
    }

    public function storeAttendance(StoreAttendanceRequest $request, ClassGroup $classGroup): RedirectResponse
    {
        $data = $request->validated();

        try {
            $saved = AcademicService::saveAttendance(
                $classGroup,
                $data['date'],
                $data['subject'],
                $data['material'],
                $data['rows'],
                Auth::id()
            );
        } catch (RuntimeException $e) {
            return back()->with('error', $e->getMessage());
        }

        return back()->with('success', "Absensi {$saved} murid tersimpan.");
    }

    public function generateSessions(Request $request, ClassGroup $classGroup): RedirectResponse
    {
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

        return back()->with('success', "Berhasil men-generate {$generatedDates} tanggal pertemuan baru sesuai jadwal.");
    }

    public function storeGrades(Request $request, ClassGroup $classGroup): RedirectResponse
    {
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

        return back()->with('success', "Nilai {$saved} murid ({$data['subject']} - {$data['term']}) tersimpan.");
    }

    public function export(Request $request, ClassGroup $classGroup, string $type): StreamedResponse
    {
        $data = $request->validate([
            'term' => ['nullable', 'string', 'max:100'],
        ]);

        $classGroup->load(['program:id,name', 'teacher:id,name', 'members.student:id,name']);

        $filename = match ($type) {
            'members' => "anggota-{$classGroup->id}.csv",
            'attendance' => "absensi-{$classGroup->id}.csv",
            'grades' => "nilai-{$classGroup->id}.csv",
            default => abort(404),
        };

        $rows = match ($type) {
            'members' => $this->exportMemberRows($classGroup),
            'attendance' => $this->exportAttendanceRows($classGroup),
            'grades' => $this->exportGradeRows($classGroup, $data['term'] ?? null),
        };

        return response()->streamDownload(function () use ($rows): void {
            $handle = fopen('php://output', 'w');
            foreach ($rows as $row) {
                fputcsv($handle, $row);
            }
            fclose($handle);
        }, $filename, ['Content-Type' => 'text/csv']);
    }

    /**
     * @return array<string, mixed>
     */
    private function formatClass(ClassGroup $class): array
    {
        $totalSessions = $class->total_sessions ?? $class->package?->sessions;

        return [
            'id' => $class->id,
            'name' => $class->name,
            'program_id' => $class->program_id,
            'program' => $class->program?->name ?? '-',
            'level' => $class->level ?? $class->package?->level,
            'package_id' => $class->package_id,
            'package' => $class->package?->name,
            'total_sessions' => $totalSessions,
            'teacher_id' => $class->teacher_id,
            'teacher' => $class->teacher?->name,
            'quota' => $class->quota,
            'filled' => $class->active_members_count ?? $class->activeMembers()->count(),
            'is_active' => $class->is_active,
            'members' => $class->members->map(function (ClassMember $member) use ($class, $totalSessions) {
                $attended = $class->attendances
                    ->where('student_id', $member->student_id)
                    ->where('status', '!=', 'belum_absen')
                    ->count();

                $targetSessions = $member->student?->packageItem?->sessions
                    ?? $totalSessions;

                return [
                    'id' => $member->id,
                    'student_id' => $member->student_id,
                    'student_name' => $member->student?->name ?? '-',
                    'status' => $member->status,
                    'joined_at' => $member->joined_at,
                    'is_scholarship' => $member->is_scholarship,
                    'notes' => $member->notes,
                    'target_sessions' => $targetSessions,
                    'attended_sessions' => $attended,
                    'is_quota_reached' => $targetSessions !== null && $attended >= $targetSessions,
                    'student' => $member->student ? [
                        'id' => $member->student->id,
                        'name' => $member->student->name,
                        'school_name' => $member->student->school_name,
                        'level' => $member->student->level,
                        'class_level' => $member->student->class_level,
                        'parent_contact' => $member->student->parent_contact,
                        'parent_email' => $member->student->parent_email,
                        'address' => $member->student->address,
                        'preferred_mode' => $member->student->preferred_mode,
                        'program' => $member->student->program,
                        'package_id' => $member->student->package_id,
                        'package' => $member->student->packageItem?->name ?? $member->student->package,
                        'package_sessions' => $member->student->packageItem?->sessions,
                        'notes' => $member->student->notes,
                    ] : null,
                ];
            })->values()->all(),
            'schedules' => $class->schedules->map(fn (Schedule $schedule) => [
                'id' => $schedule->id,
                'day_of_week' => $schedule->day_of_week,
                'day' => $schedule->dayLabel(),
                'start_time' => substr((string) $schedule->start_time, 0, 5),
                'end_time' => substr((string) $schedule->end_time, 0, 5),
            ])->values()->all(),
            'attendances' => $class->attendances->map(fn (Attendance $a) => [
                'id' => $a->id,
                'student_id' => $a->student_id,
                'date' => $a->date?->format('Y-m-d') ?? substr((string) $a->date, 0, 10),
                'status' => $a->status,
                'subject' => $a->subject,
                'material' => $a->material,
                'understanding_score' => $a->understanding_score,
                'evaluation' => $a->evaluation,
                'note' => $a->note,
            ])->values()->all(),
        ];
    }

    /**
     * @return array<int, array<int, string>>
     */
    private function exportMemberRows(ClassGroup $class): array
    {
        $rows = [['Kelas', $class->name], ['Program', $class->program?->name ?? '-'], []];
        $rows[] = ['Nama', 'Status', 'Beasiswa', 'Tanggal Masuk'];

        foreach ($class->members as $member) {
            $rows[] = [
                $member->student?->name ?? '-',
                $member->status,
                $member->is_scholarship ? 'Ya' : 'Tidak',
                (string) ($member->joined_at ?? ''),
            ];
        }

        return $rows;
    }

    /**
     * @return array<int, array<int, string>>
     */
    private function exportAttendanceRows(ClassGroup $class): array
    {
        $rows = [['Kelas', $class->name], []];
        $rows[] = ['Tanggal', 'Nama', 'Status', 'Mata Pelajaran', 'Materi', 'Skala Pemahaman', 'Evaluasi', 'Catatan'];

        $records = Attendance::query()
            ->with('student:id,name')
            ->where('class_group_id', $class->id)
            ->orderBy('date')
            ->orderBy('student_id')
            ->get();

        foreach ($records as $record) {
            $rows[] = [
                $record->date?->format('Y-m-d') ?? '',
                $record->student?->name ?? '-',
                $record->status,
                (string) ($record->subject ?? ''),
                (string) ($record->material ?? ''),
                (string) ($record->understanding_score ?? ''),
                (string) ($record->evaluation ?? ''),
                (string) ($record->note ?? ''),
            ];
        }

        return $rows;
    }

    /**
     * @return array<int, array<int, string>>
     */
    private function exportGradeRows(ClassGroup $class, ?string $term): array
    {
        $rows = [['Kelas', $class->name], []];
        $rows[] = ['Mapel', 'Term', 'Nama', 'Nilai'];

        $records = Grade::query()
            ->with('student:id,name')
            ->where('class_group_id', $class->id)
            ->when($term, fn ($query) => $query->where('term', $term))
            ->orderBy('subject')
            ->orderBy('term')
            ->orderBy('student_id')
            ->get();

        foreach ($records as $record) {
            $rows[] = [
                $record->subject,
                $record->term,
                $record->student?->name ?? '-',
                (string) $record->score,
            ];
        }

        return $rows;
    }
}
