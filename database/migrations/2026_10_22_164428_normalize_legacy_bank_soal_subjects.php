<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::transaction(function (): void {
            $now = now();

            foreach (['Matematika', 'IPA', 'Bahasa Inggris', 'Umum'] as $subjectName) {
                DB::table('subjects')->insertOrIgnore([
                    'name' => $subjectName,
                    'is_active' => true,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            }

            DB::table('subjects')
                ->whereIn('name', ['Matematika', 'IPA', 'Bahasa Inggris', 'Umum'])
                ->update(['is_active' => true, 'updated_at' => $now]);

            $subjectIds = DB::table('subjects')
                ->whereIn('name', ['Matematika', 'IPA', 'Bahasa Inggris', 'Umum'])
                ->pluck('id', 'name');
            $existingSubjects = DB::table('subjects')->pluck('name', 'id');

            DB::table('bank_soals')
                ->whereNotNull('education_class_id')
                ->orderBy('id')
                ->chunkById(100, function ($bankSoals) use ($existingSubjects, $subjectIds, $now): void {
                    foreach ($bankSoals as $bankSoal) {
                        $name = $this->localizedText($bankSoal->name);
                        $legacySubject = (string) ($existingSubjects[$bankSoal->subject_id] ?? '');
                        $subjectName = $this->resolveSubject("{$name} {$legacySubject}");

                        if ($subjectName === null) {
                            continue;
                        }

                        $subjectId = (int) $subjectIds[$subjectName];
                        $levelId = DB::table('education_classes')
                            ->where('id', $bankSoal->education_class_id)
                            ->value('education_level_id');

                        DB::table('bank_soals')->where('id', $bankSoal->id)->update([
                            'subject_id' => $subjectId,
                            'updated_at' => $now,
                        ]);

                        if ($levelId !== null) {
                            DB::table('education_level_subject')->updateOrInsert([
                                'education_level_id' => $levelId,
                                'subject_id' => $subjectId,
                            ], [
                                'created_at' => $now,
                                'updated_at' => $now,
                            ]);
                        }
                    }
                });

            DB::table('subjects')
                ->whereIn('name', ['Olimpiade', 'Try Out', 'mtk'])
                ->whereNotExists(function ($query): void {
                    $query->selectRaw('1')
                        ->from('bank_soals')
                        ->whereColumn('bank_soals.subject_id', 'subjects.id');
                })
                ->update(['is_active' => false, 'updated_at' => $now]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Subject normalization is intentionally irreversible because legacy category labels are ambiguous.
    }

    private function resolveSubject(string $text): ?string
    {
        $normalized = strtoupper($text);

        return match (true) {
            preg_match('/\b(MATEMATIKA|MTK|MATH)\b/u', $normalized) === 1 => 'Matematika',
            preg_match('/\b(IPA|SCIENCE)\b/u', $normalized) === 1 => 'IPA',
            preg_match('/\b(BAHASA\s+INGGRIS|ENGLISH)\b/u', $normalized) === 1 => 'Bahasa Inggris',
            preg_match('/\b(TRY\s+OUT|UJIAN\s+NASIONAL|UN)\b/u', $normalized) === 1 => 'Umum',
            default => null,
        };
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
