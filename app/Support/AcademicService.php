<?php

namespace App\Support;

use App\Models\Attendance;
use App\Models\ClassGroup;
use App\Models\ClassGroupLifecycle;
use App\Models\ClassMember;
use App\Models\ClassMemberPeriod;
use App\Models\Grade;
use App\Models\Invoice;
use App\Models\Schedule;
use App\Models\Student;
use App\Models\StudentRegistration;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class AcademicService
{
    /**
     * @param  array<int, string>  $dates
     * @return array{created_dates: int, removed_dates: int, protected_dates: int, scheduled_dates: int}
     */
    public static function syncAttendanceSessions(ClassGroup $classGroup, string $month, array $dates): array
    {
        self::assertClassActive($classGroup);

        $monthStart = Carbon::createFromFormat('!Y-m', $month)->startOfMonth();
        $monthEnd = $monthStart->copy()->endOfMonth();
        $normalizedDates = collect($dates)
            ->map(fn (string $date): string => Carbon::parse($date)->toDateString())
            ->unique()
            ->sort()
            ->values()
            ->all();

        return DB::transaction(function () use ($classGroup, $monthStart, $monthEnd, $normalizedDates): array {
            $existingDates = Attendance::query()
                ->where('class_group_id', $classGroup->id)
                ->whereBetween('date', [$monthStart->toDateString(), $monthEnd->toDateString()])
                ->pluck('date')
                ->map(fn ($date): string => is_string($date) ? substr($date, 0, 10) : $date->toDateString())
                ->unique()
                ->values();

            $protectedDates = Attendance::query()
                ->where('class_group_id', $classGroup->id)
                ->whereBetween('date', [$monthStart->toDateString(), $monthEnd->toDateString()])
                ->where('status', '!=', 'belum_absen')
                ->pluck('date')
                ->map(fn ($date): string => is_string($date) ? substr($date, 0, 10) : $date->toDateString())
                ->unique()
                ->values();

            $removedDates = $existingDates
                ->diff($normalizedDates)
                ->diff($protectedDates)
                ->values();

            if ($removedDates->isNotEmpty()) {
                foreach ($removedDates as $removedDate) {
                    Attendance::query()
                        ->where('class_group_id', $classGroup->id)
                        ->where('status', 'belum_absen')
                        ->whereDate('date', $removedDate)
                        ->delete();
                }
            }

            $members = $classGroup->activeMembers()->with(['student.packageItem', 'periods'])->get();
            $createdDates = 0;

            foreach ($normalizedDates as $date) {
                $dateAlreadyExists = Attendance::query()
                    ->where('class_group_id', $classGroup->id)
                    ->whereDate('date', $date)
                    ->exists();
                $createdForDate = false;

                foreach ($members as $member) {
                    $period = self::memberPeriodForDate($member, $date);
                    if ($member->periods->isNotEmpty() && $period === null) {
                        continue;
                    }

                    $recordExists = Attendance::query()
                        ->where('class_group_id', $classGroup->id)
                        ->where('student_id', $member->student_id)
                        ->whereDate('date', $date)
                        ->exists();

                    if ($recordExists) {
                        continue;
                    }

                    $targetSessions = $period?->session_limit
                        ?? $member->student?->packageItem?->sessions
                        ?? $classGroup->total_sessions;
                    if ($targetSessions !== null) {
                        $attendedQuery = Attendance::query()
                            ->where('class_group_id', $classGroup->id)
                            ->where('student_id', $member->student_id)
                            ->where('status', '!=', 'belum_absen');

                        if ($period) {
                            $attendedQuery->whereBetween('date', [
                                $period->start_date->toDateString(),
                                $period->end_date->toDateString(),
                            ]);
                        }

                        $attendedCount = $attendedQuery->count();

                        if ($attendedCount >= $targetSessions) {
                            continue;
                        }
                    }

                    Attendance::create([
                        'class_group_id' => $classGroup->id,
                        'student_id' => $member->student_id,
                        'date' => $date,
                        'status' => 'belum_absen',
                    ]);
                    $createdForDate = true;
                }

                if (! $dateAlreadyExists && $createdForDate) {
                    $createdDates++;
                }
            }

            return [
                'created_dates' => $createdDates,
                'removed_dates' => $removedDates->count(),
                'protected_dates' => $protectedDates->diff($normalizedDates)->count(),
                'scheduled_dates' => count($normalizedDates),
            ];
        });
    }

    /**
     * @param  array{start_date: string, end_date: string, session_limit: int, notes?: ?string}  $data
     * @return array{period: ClassMemberPeriod, generated_sessions: int, scheduled_sessions: int}
     */
    public static function createMemberPeriod(ClassMember $member, array $data, ?int $creatorId): array
    {
        return DB::transaction(function () use ($member, $data, $creatorId): array {
            $lockedMember = ClassMember::query()
                ->with(['classGroup.schedules', 'student'])
                ->lockForUpdate()
                ->findOrFail($member->id);

            if ($lockedMember->status !== ClassMember::STATUS_ACTIVE) {
                throw new RuntimeException('Periode hanya dapat ditambahkan untuk anggota kelas yang aktif.');
            }

            $classGroup = $lockedMember->classGroup;
            if ($classGroup === null) {
                throw new RuntimeException('Kelas tidak ditemukan.');
            }

            self::assertClassActive($classGroup);

            if ($classGroup->schedules->isEmpty()) {
                throw new RuntimeException('Tambahkan jadwal mingguan kelas sebelum membuat periode.');
            }

            $overlaps = ClassMemberPeriod::query()
                ->where('class_member_id', $lockedMember->id)
                ->whereDate('start_date', '<=', $data['end_date'])
                ->whereDate('end_date', '>=', $data['start_date'])
                ->exists();

            if ($overlaps) {
                throw new RuntimeException('Periode ini bertumpang tindih dengan periode yang sudah ada.');
            }

            $period = ClassMemberPeriod::create([
                'class_member_id' => $lockedMember->id,
                'start_date' => $data['start_date'],
                'end_date' => $data['end_date'],
                'session_limit' => $data['session_limit'],
                'notes' => $data['notes'] ?? null,
                'created_by' => $creatorId,
            ]);

            $scheduledDays = $classGroup->schedules
                ->pluck('day_of_week')
                ->map(fn ($day): int => (int) $day)
                ->unique();
            $cursor = Carbon::parse($data['start_date'])->startOfDay();
            $endDate = Carbon::parse($data['end_date'])->startOfDay();
            $generatedSessions = 0;
            $scheduledSessions = 0;

            while ($cursor->lte($endDate) && $scheduledSessions < $period->session_limit) {
                if ($scheduledDays->contains($cursor->dayOfWeekIso)) {
                    $attendance = Attendance::firstOrCreate(
                        [
                            'class_group_id' => $classGroup->id,
                            'student_id' => $lockedMember->student_id,
                            'date' => $cursor->toDateString(),
                        ],
                        ['status' => 'belum_absen']
                    );

                    $scheduledSessions++;
                    if ($attendance->wasRecentlyCreated) {
                        $generatedSessions++;
                    }
                }

                $cursor->addDay();
            }

            return [
                'period' => $period,
                'generated_sessions' => $generatedSessions,
                'scheduled_sessions' => $scheduledSessions,
            ];
        });
    }

    public static function addMember(
        ClassGroup $classGroup,
        int $studentId,
        bool $isScholarship = false,
        ?string $notes = null,
    ): ClassMember {
        self::assertClassActive($classGroup);

        $student = Student::query()->findOrFail($studentId);

        if (! $student->is_active) {
            throw new RuntimeException('Murid tidak aktif.');
        }

        return DB::transaction(function () use ($classGroup, $student, $isScholarship, $notes): ClassMember {
            $existing = ClassMember::query()
                ->where('class_group_id', $classGroup->id)
                ->where('student_id', $student->id)
                ->first();

            if ($existing && $existing->status === ClassMember::STATUS_ACTIVE) {
                throw new RuntimeException('Murid sudah menjadi anggota aktif kelas ini.');
            }

            $activeInProgram = ClassMember::query()
                ->where('student_id', $student->id)
                ->where('status', ClassMember::STATUS_ACTIVE)
                ->whereHas('classGroup', function ($query) use ($classGroup): void {
                    $query->where('program_id', $classGroup->program_id)
                        ->where('is_active', true)
                        ->where('id', '<>', $classGroup->id);
                })
                ->count();

            $allowedInProgram = max(1, StudentRegistration::query()
                ->where('student_id', $student->id)
                ->where('program_id', $classGroup->program_id)
                ->where('status', 'approved')
                ->count());

            if ($activeInProgram >= $allowedInProgram) {
                throw new RuntimeException('Murid sudah aktif di kelas lain pada program yang sama.');
            }

            if (! $classGroup->hasAvailableSeat() && ! ($existing && $existing->status !== ClassMember::STATUS_ACTIVE)) {
                throw new RuntimeException('Kuota kelas sudah penuh.');
            }

            if ($existing) {
                $existing->update([
                    'status' => ClassMember::STATUS_ACTIVE,
                    'joined_at' => now()->toDateString(),
                    'ended_at' => null,
                    'is_scholarship' => $isScholarship,
                    'notes' => $notes ?? $existing->notes,
                ]);

                InvoiceService::linkInitialInvoiceToMember($existing);

                return $existing->fresh();
            }

            $member = ClassMember::create([
                'class_group_id' => $classGroup->id,
                'student_id' => $student->id,
                'status' => ClassMember::STATUS_ACTIVE,
                'joined_at' => now()->toDateString(),
                'is_scholarship' => $isScholarship,
                'notes' => $notes,
            ]);

            InvoiceService::linkInitialInvoiceToMember($member);

            return $member;
        });
    }

    public static function setClassActiveStatus(ClassGroup $classGroup, bool $isActive): ClassGroup
    {
        return DB::transaction(function () use ($classGroup, $isActive): ClassGroup {
            $lockedClass = ClassGroup::query()
                ->lockForUpdate()
                ->findOrFail($classGroup->id);

            if ($lockedClass->is_active !== $isActive) {
                $lockedClass->update(['is_active' => $isActive]);

                if ($isActive) {
                    ClassGroupLifecycle::create([
                        'class_group_id' => $lockedClass->id,
                        'activated_at' => now()->toDateString(),
                    ]);
                } else {
                    $openLifecycle = ClassGroupLifecycle::query()
                        ->where('class_group_id', $lockedClass->id)
                        ->whereNull('deactivated_at')
                        ->latest('activated_at')
                        ->lockForUpdate()
                        ->first();

                    if ($openLifecycle) {
                        $openLifecycle->update(['deactivated_at' => now()->toDateString()]);
                    } else {
                        ClassGroupLifecycle::create([
                            'class_group_id' => $lockedClass->id,
                            'activated_at' => $lockedClass->created_at?->toDateString() ?? now()->toDateString(),
                            'deactivated_at' => now()->toDateString(),
                        ]);
                    }
                }
            }

            return $lockedClass->fresh();
        });
    }

    public static function completeMember(
        ClassMember $member,
        bool $deactivateStudent,
        ?int $updaterId,
    ): ClassMember {
        return DB::transaction(function () use ($member, $deactivateStudent, $updaterId): ClassMember {
            $lockedMember = ClassMember::query()
                ->with('student')
                ->lockForUpdate()
                ->findOrFail($member->id);

            if ($lockedMember->status !== ClassMember::STATUS_ACTIVE) {
                throw new RuntimeException('Keanggotaan kelas murid ini sudah selesai.');
            }

            if ($deactivateStudent) {
                $hasOtherActiveClass = ClassMember::query()
                    ->where('student_id', $lockedMember->student_id)
                    ->where('status', ClassMember::STATUS_ACTIVE)
                    ->whereKeyNot($lockedMember->id)
                    ->whereHas('classGroup', function ($query): void {
                        $query->where('is_active', true);
                    })
                    ->exists();

                if ($hasOtherActiveClass) {
                    throw new RuntimeException('Murid masih aktif di kelas lain. Selesaikan kelas tanpa menonaktifkan data murid.');
                }
            }

            $lockedMember->update([
                'status' => ClassMember::STATUS_GRADUATED,
                'ended_at' => now()->toDateString(),
            ]);

            if ($deactivateStudent) {
                $lockedMember->student?->update([
                    'is_active' => false,
                    'updated_by' => $updaterId,
                ]);
            }

            return $lockedMember->fresh(['student']);
        });
    }

    public static function hasPaidInvoice(int $studentId): bool
    {
        return Invoice::query()
            ->where('student_id', $studentId)
            ->where('status', Invoice::STATUS_PAID)
            ->exists();
    }

    /**
     * @param  array<int, array{student_id: int, status: string, understanding_score?: ?int, evaluation?: ?string, note?: ?string}>  $rows
     */
    public static function saveAttendance(
        ClassGroup $classGroup,
        string $date,
        string $subject,
        string $material,
        array $rows,
        ?int $markerId
    ): int {
        self::assertClassActive($classGroup);

        $members = $classGroup->activeMembers()
            ->with(['student.packageItem', 'periods'])
            ->get()
            ->keyBy('student_id');
        $saved = 0;

        foreach ($rows as $row) {
            $studentId = (int) ($row['student_id'] ?? 0);

            /** @var ClassMember|null $member */
            $member = $members->get($studentId);
            if ($member === null) {
                throw new RuntimeException('Absensi hanya untuk anggota aktif kelas ini.');
            }

            if (! in_array($row['status'] ?? '', Attendance::STATUSES, true)) {
                throw new RuntimeException('Status absensi tidak valid.');
            }

            $record = Attendance::query()
                ->where('class_group_id', $classGroup->id)
                ->where('student_id', $studentId)
                ->whereDate('date', $date)
                ->first();

            $period = self::memberPeriodForDate($member, $date);
            if ($member->periods->isNotEmpty() && $period === null) {
                throw new RuntimeException("Tanggal absensi murid {$member->student?->name} berada di luar periode les aktif.");
            }

            $targetSessions = $period?->session_limit
                ?? $member->student?->packageItem?->sessions
                ?? $classGroup->total_sessions;

            if (($row['status'] ?? '') !== 'belum_absen' && $targetSessions !== null) {
                $attendedQuery = Attendance::query()
                    ->where('class_group_id', $classGroup->id)
                    ->where('student_id', $studentId)
                    ->where('status', '!=', 'belum_absen');

                if ($record) {
                    $attendedQuery->whereKeyNot($record->id);
                }

                if ($period) {
                    $attendedQuery->whereBetween('date', [
                        $period->start_date->toDateString(),
                        $period->end_date->toDateString(),
                    ]);
                }

                if ($attendedQuery->count() >= $targetSessions) {
                    throw new RuntimeException("Murid {$member->student?->name} sudah mencapai batas {$targetSessions} pertemuan periodenya.");
                }
            }

            $payload = [
                'status' => $row['status'],
                'subject' => $subject,
                'material' => $material,
                'understanding_score' => $row['status'] === 'hadir'
                    ? ($row['understanding_score'] ?? null)
                    : null,
                'evaluation' => $row['status'] === 'hadir'
                    ? ($row['evaluation'] ?? null)
                    : null,
                'note' => $row['note'] ?? null,
                'marked_by' => $markerId,
            ];

            if ($record) {
                $record->update($payload);
            } else {
                Attendance::create([
                    'class_group_id' => $classGroup->id,
                    'student_id' => $studentId,
                    'date' => $date,
                    ...$payload,
                ]);
            }

            $saved++;
        }

        return $saved;
    }

    private static function memberPeriodForDate(ClassMember $member, string $date): ?ClassMemberPeriod
    {
        $attendanceDate = Carbon::parse($date)->toDateString();

        return $member->periods->first(function (ClassMemberPeriod $period) use ($attendanceDate): bool {
            return $period->start_date->toDateString() <= $attendanceDate
                && $period->end_date->toDateString() >= $attendanceDate;
        });
    }

    /**
     * @param  array<int, array{student_id: int, score: float|int|string}>  $rows
     */
    public static function saveGrades(ClassGroup $classGroup, string $subject, string $term, array $rows): int
    {
        self::assertClassActive($classGroup);

        $memberIds = array_map('intval', $classGroup->activeMembers()->pluck('student_id')->all());
        $saved = 0;

        foreach ($rows as $row) {
            $studentId = (int) ($row['student_id'] ?? 0);
            $score = (float) ($row['score'] ?? -1);

            if (! in_array($studentId, $memberIds, true)) {
                throw new RuntimeException('Nilai hanya untuk anggota aktif kelas ini.');
            }

            if ($score < 0 || $score > 100) {
                throw new RuntimeException('Nilai harus antara 0 dan 100.');
            }

            Grade::updateOrCreate(
                [
                    'class_group_id' => $classGroup->id,
                    'student_id' => $studentId,
                    'subject' => $subject,
                    'term' => $term,
                ],
                ['score' => $score]
            );

            $saved++;
        }

        return $saved;
    }

    public static function assertClassActive(ClassGroup $classGroup): void
    {
        if (! $classGroup->is_active) {
            throw new RuntimeException('Kelas sudah selesai atau nonaktif. Aktifkan kembali kelas untuk melanjutkan pengelolaan.');
        }
    }

    public static function assertNoTeacherClash(
        ?int $teacherId,
        int $day,
        string $start,
        string $end,
        int $classGroupId,
        ?int $ignoreScheduleId = null,
    ): void {
        if ($teacherId === null) {
            return;
        }

        if ($start >= $end) {
            throw new RuntimeException('Jam mulai harus sebelum jam selesai.');
        }

        $clash = Schedule::query()
            ->where('day_of_week', $day)
            ->where('class_group_id', '<>', $classGroupId)
            ->whereHas('classGroup', function ($query) use ($teacherId): void {
                $query->where('teacher_id', $teacherId)->where('is_active', true);
            })
            ->get()
            ->first(fn (Schedule $schedule) => $schedule->overlapsWith($day, $start, $end, $ignoreScheduleId));

        if ($clash) {
            $className = $clash->classGroup?->name ?? 'kelas lain';
            throw new RuntimeException(
                "Bentrok dengan jadwal {$className} (".$clash->dayLabel()." {$clash->start_time}–{$clash->end_time})."
            );
        }
    }
}
