<?php

use App\Support\EducationCatalog;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $levelNames = [
            'TK' => 'TK / RA',
            'SD' => 'SD / MI',
            'SMP' => 'SMP / MTs',
            'SMA' => 'SMA / MA',
        ];

        DB::transaction(function () use ($levelNames): void {
            DB::table('bank_soals')
                ->where('classification_status', 'needs_review')
                ->whereNull('education_class_id')
                ->orderBy('id')
                ->chunkById(100, function ($bankSoals) use ($levelNames): void {
                    foreach ($bankSoals as $bankSoal) {
                        $name = $this->localizedText($bankSoal->name);
                        $description = $this->localizedText($bankSoal->description);
                        $levelCode = $this->resolveLevelCode($bankSoal, "{$name} {$description}");

                        if ($levelCode === null || $bankSoal->subject_id === null) {
                            continue;
                        }

                        $levelId = DB::table('education_levels')->where('name', $levelNames[$levelCode])->value('id');

                        if ($levelId === null) {
                            continue;
                        }

                        DB::table('education_level_subject')->updateOrInsert([
                            'education_level_id' => $levelId,
                            'subject_id' => $bankSoal->subject_id,
                        ], [
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]);

                        $grades = array_values(array_intersect(
                            EducationCatalog::gradesFor([$levelCode]),
                            EducationCatalog::extractGrades([$name, $description]),
                        ));

                        if ($grades === []) {
                            $this->assignToClass($bankSoal->id, $this->classId($levelId, 'Kelas Umum'));

                            continue;
                        }

                        $classIds = collect($grades)
                            ->map(fn (string $grade): int => $this->classId($levelId, $this->className($grade)))
                            ->unique()
                            ->values();

                        $this->assignToClass($bankSoal->id, $classIds->shift());

                        foreach ($classIds as $classId) {
                            $this->duplicateForClass($bankSoal, $classId);
                        }
                    }
                });
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // This corrective backfill intentionally preserves the generated class-specific records.
    }

    private function assignToClass(int $bankSoalId, int $classId): void
    {
        DB::table('bank_soals')->where('id', $bankSoalId)->update([
            'education_class_id' => $classId,
            'classification_status' => 'ready',
            'updated_at' => now(),
        ]);
    }

    private function duplicateForClass(object $bankSoal, int $classId): void
    {
        $payload = Arr::except((array) $bankSoal, ['id']);
        $payload['education_class_id'] = $classId;
        $payload['classification_status'] = 'ready';
        $payload['view_count'] = 0;
        $payload['download_count'] = 0;
        $payload['created_at'] = now();
        $payload['updated_at'] = now();
        $duplicateId = DB::table('bank_soals')->insertGetId($payload);

        DB::table('bank_soal_resources')
            ->where('bank_soal_id', $bankSoal->id)
            ->orderBy('id')
            ->each(function (object $resource) use ($duplicateId): void {
                $payload = Arr::except((array) $resource, ['id']);
                $payload['bank_soal_id'] = $duplicateId;
                $payload['created_at'] = now();
                $payload['updated_at'] = now();
                DB::table('bank_soal_resources')->insert($payload);
            });
    }

    private function classId(int $levelId, string $name): int
    {
        DB::table('education_classes')->insertOrIgnore([
            'education_level_id' => $levelId,
            'name' => $name,
            'sort_order' => $name === 'Kelas Umum' ? 999 : 0,
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return (int) DB::table('education_classes')
            ->where('education_level_id', $levelId)
            ->where('name', $name)
            ->value('id');
    }

    private function className(string $grade): string
    {
        return match ($grade) {
            'pra-tk' => 'Pra-TK',
            'tk-a' => 'Kelas A',
            'tk-b' => 'Kelas B',
            default => "Kelas {$grade}",
        };
    }

    private function resolveLevelCode(object $bankSoal, string $text): ?string
    {
        $codes = EducationCatalog::extractLevels($text);

        if (count($codes) === 1) {
            return $codes[0];
        }

        $knownLegacyLevels = [
            'TRY OUT OLIMPIADE IPA' => 'SMA',
        ];

        foreach ($knownLegacyLevels as $legacyName => $levelCode) {
            if (str_contains(strtoupper($text), $legacyName)) {
                return $levelCode;
            }
        }

        $subjectLevelCodes = DB::table('education_level_subject')
            ->join('education_levels', 'education_levels.id', '=', 'education_level_subject.education_level_id')
            ->where('education_level_subject.subject_id', $bankSoal->subject_id)
            ->pluck('education_levels.name')
            ->map(fn (string $name): ?string => match ($name) {
                'TK / RA' => 'TK',
                'SD / MI' => 'SD',
                'SMP / MTs' => 'SMP',
                'SMA / MA' => 'SMA',
                default => null,
            })
            ->filter()
            ->unique()
            ->values();

        return $subjectLevelCodes->count() === 1 ? $subjectLevelCodes->first() : null;
    }

    private function localizedText(mixed $value): string
    {
        if (! is_string($value)) {
            return is_array($value) ? trim((string) ($value['id'] ?? $value['en'] ?? '')) : '';
        }

        $decoded = json_decode($value, true);

        return is_array($decoded) ? trim((string) ($decoded['id'] ?? $decoded['en'] ?? '')) : trim($value);
    }
};
