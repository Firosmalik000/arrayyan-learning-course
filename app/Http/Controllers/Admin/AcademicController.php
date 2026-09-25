<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Attendance;
use App\Models\ClassGroup;
use App\Models\ClassMember;
use App\Models\Grade;
use App\Models\Program;
use App\Models\Schedule;
use App\Models\Student;
use App\Models\Teacher;
use App\Support\AcademicService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
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
                'teacher:id,name',
                'members.student:id,name',
                'schedules',
            ])
            ->withCount(['activeMembers'])
            ->latest()
            ->get()
            ->map(fn (ClassGroup $class) => $this->formatClass($class));

        $students = Student::query()
            ->where('is_active', true)
            ->with(['programItem:id,name'])
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
                    'program_id' => $student->program_id,
                    'program' => $student->programItem?->name ?? $student->program,
                    'has_paid' => AcademicService::hasPaidInvoice($student->id),
                    'active_program_ids' => $activePrograms,
                ];
            });

        return Inertia::render('Admin/Academic', [
            'classes' => $classes,
            'programs' => Program::query()
                ->where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name', 'level']),
            'teachers' => Teacher::query()
                ->where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name']),
            'students' => $students,
            'days' => Schedule::DAYS,
        ]);
    }

    public function storeClass(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'program_id' => ['required', 'integer', 'exists:programs,id'],
            'teacher_id' => ['nullable', 'integer', 'exists:teachers,id'],
            'name' => ['required', 'string', 'max:100'],
            'quota' => ['nullable', 'integer', 'min:1', 'max:10000'],
            'room' => ['nullable', 'string', 'max:100'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        ClassGroup::create([
            ...$data,
            'is_active' => (bool) ($data['is_active'] ?? true),
        ]);

        ActivityLog::record('akademik.kelas.buat', "Kelas \"{$data['name']}\" dibuat.");

        return back()->with('success', 'Kelas berhasil ditambahkan.');
    }

    public function updateClass(Request $request, ClassGroup $classGroup): RedirectResponse
    {
        $data = $request->validate([
            'program_id' => ['required', 'integer', 'exists:programs,id'],
            'teacher_id' => ['nullable', 'integer', 'exists:teachers,id'],
            'name' => ['required', 'string', 'max:100'],
            'quota' => ['nullable', 'integer', 'min:1', 'max:10000'],
            'room' => ['nullable', 'string', 'max:100'],
            'is_active' => ['nullable', 'boolean'],
        ]);

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
            'room' => ['nullable', 'string', 'max:100'],
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
            'room' => ['nullable', 'string', 'max:100'],
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

    public function storeAttendance(Request $request, ClassGroup $classGroup): RedirectResponse
    {
        $data = $request->validate([
            'date' => ['required', 'date', 'before_or_equal:today'],
            'rows' => ['required', 'array', 'min:1'],
            'rows.*.student_id' => ['required', 'integer', 'exists:students,id'],
            'rows.*.status' => ['required', 'string', 'in:hadir,izin,sakit,alpa'],
            'rows.*.note' => ['nullable', 'string', 'max:255'],
        ]);

        try {
            $saved = AcademicService::saveAttendance($classGroup, $data['date'], $data['rows'], Auth::id());
        } catch (RuntimeException $e) {
            return back()->with('error', $e->getMessage());
        }

        return back()->with('success', "Absensi {$saved} murid tersimpan.");
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
        return [
            'id' => $class->id,
            'name' => $class->name,
            'program_id' => $class->program_id,
            'program' => $class->program?->name ?? '-',
            'teacher_id' => $class->teacher_id,
            'teacher' => $class->teacher?->name,
            'quota' => $class->quota,
            'filled' => $class->active_members_count ?? $class->activeMembers()->count(),
            'room' => $class->room,
            'is_active' => $class->is_active,
            'members' => $class->members->map(fn (ClassMember $member) => [
                'id' => $member->id,
                'student_id' => $member->student_id,
                'student_name' => $member->student?->name ?? '-',
                'status' => $member->status,
                'joined_at' => $member->joined_at,
                'is_scholarship' => $member->is_scholarship,
                'notes' => $member->notes,
            ])->values()->all(),
            'schedules' => $class->schedules->map(fn (Schedule $schedule) => [
                'id' => $schedule->id,
                'day_of_week' => $schedule->day_of_week,
                'day' => $schedule->dayLabel(),
                'start_time' => substr((string) $schedule->start_time, 0, 5),
                'end_time' => substr((string) $schedule->end_time, 0, 5),
                'room' => $schedule->room,
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
        $rows[] = ['Tanggal', 'Nama', 'Status', 'Catatan'];

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
