<?php

namespace App\Support;

use App\Models\Attendance;
use App\Models\ClassGroup;
use App\Models\ClassMember;
use App\Models\Grade;
use App\Models\Invoice;
use App\Models\Schedule;
use App\Models\Student;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class AcademicService
{
    public static function addMember(
        ClassGroup $classGroup,
        int $studentId,
        bool $isScholarship = false,
        ?string $notes = null,
    ): ClassMember {
        if (! $classGroup->is_active) {
            throw new RuntimeException('Kelas tidak aktif.');
        }

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

            $otherActive = ClassMember::query()
                ->where('student_id', $student->id)
                ->where('status', ClassMember::STATUS_ACTIVE)
                ->whereHas('classGroup', function ($query) use ($classGroup): void {
                    $query->where('program_id', $classGroup->program_id)
                        ->where('is_active', true)
                        ->where('id', '<>', $classGroup->id);
                })
                ->exists();

            if ($otherActive) {
                throw new RuntimeException('Murid sudah aktif di kelas lain pada program yang sama.');
            }

            if (! $isScholarship && ! self::hasPaidInvoice($student->id)) {
                throw new RuntimeException('Murid belum memiliki tagihan lunas. Aktifkan beasiswa bila dibebaskan.');
            }

            if (! $classGroup->hasAvailableSeat() && ! ($existing && $existing->status !== ClassMember::STATUS_ACTIVE)) {
                throw new RuntimeException('Kuota kelas sudah penuh.');
            }

            if ($existing) {
                $existing->update([
                    'status' => ClassMember::STATUS_ACTIVE,
                    'joined_at' => $existing->joined_at ?? now()->toDateString(),
                    'is_scholarship' => $isScholarship,
                    'notes' => $notes ?? $existing->notes,
                ]);

                return $existing->fresh();
            }

            return ClassMember::create([
                'class_group_id' => $classGroup->id,
                'student_id' => $student->id,
                'status' => ClassMember::STATUS_ACTIVE,
                'joined_at' => now()->toDateString(),
                'is_scholarship' => $isScholarship,
                'notes' => $notes,
            ]);
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
     * @param  array<int, array{student_id: int, status: string, note?: ?string}>  $rows
     */
    public static function saveAttendance(ClassGroup $classGroup, string $date, array $rows, ?int $markerId): int
    {
        $memberIds = array_map('intval', $classGroup->activeMembers()->pluck('student_id')->all());
        $saved = 0;

        foreach ($rows as $row) {
            $studentId = (int) ($row['student_id'] ?? 0);

            if (! in_array($studentId, $memberIds, true)) {
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

            $payload = [
                'status' => $row['status'],
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

    /**
     * @param  array<int, array{student_id: int, score: float|int|string}>  $rows
     */
    public static function saveGrades(ClassGroup $classGroup, string $subject, string $term, array $rows): int
    {
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
