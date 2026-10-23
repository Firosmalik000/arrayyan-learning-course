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
        $now = now();
        $definitions = [
            'TK' => ['name' => 'TK / RA', 'grades' => ['A', 'B'], 'order' => 10],
            'SD' => ['name' => 'SD / MI', 'grades' => ['1', '2', '3', '4', '5', '6'], 'order' => 20],
            'SMP' => ['name' => 'SMP / MTs', 'grades' => ['7', '8', '9'], 'order' => 30],
            'SMA' => ['name' => 'SMA / MA', 'grades' => ['10', '11', '12'], 'order' => 40],
        ];

        foreach ($definitions as $definition) {
            DB::table('education_levels')->updateOrInsert(['name' => $definition['name']], [
                'sort_order' => $definition['order'], 'is_active' => true, 'created_at' => $now, 'updated_at' => $now,
            ]);
            $levelId = DB::table('education_levels')->where('name', $definition['name'])->value('id');
            foreach ($definition['grades'] as $index => $grade) {
                DB::table('education_classes')->updateOrInsert([
                    'education_level_id' => $levelId, 'name' => "Kelas {$grade}",
                ], [
                    'sort_order' => ($index + 1) * 10, 'is_active' => true, 'created_at' => $now, 'updated_at' => $now,
                ]);
            }
        }

        DB::table('bank_soals')->orderBy('id')->chunkById(100, function ($items) use ($definitions, $now): void {
            foreach ($items as $item) {
                $name = $this->localizedText($item->name);
                $description = $this->localizedText($item->description);
                $category = trim($this->localizedText($item->category));
                $levelCode = $this->resolveLevelCode($item, "{$name} {$description}");
                $grades = $this->stringList($item->grades);
                $levelId = null;
                $classId = null;

                if ($levelCode !== null) {
                    $levelId = DB::table('education_levels')->where('name', $definitions[$levelCode]['name'])->value('id');
                    if (count($grades) === 1) {
                        $classId = DB::table('education_classes')
                            ->where('education_level_id', $levelId)
                            ->where('name', 'Kelas '.$this->normalizeGrade($grades[0]))
                            ->value('id');
                    }
                }

                $subjectId = null;
                if ($category !== '') {
                    DB::table('subjects')->updateOrInsert(['name' => $category], [
                        'is_active' => true, 'created_at' => $now, 'updated_at' => $now,
                    ]);
                    $subjectId = DB::table('subjects')->where('name', $category)->value('id');
                    if ($levelId !== null) {
                        DB::table('education_level_subject')->updateOrInsert([
                            'education_level_id' => $levelId, 'subject_id' => $subjectId,
                        ], ['created_at' => $now, 'updated_at' => $now]);
                    }
                }

                DB::table('bank_soals')->where('id', $item->id)->update([
                    'education_class_id' => $classId,
                    'subject_id' => $subjectId,
                    'classification_status' => $classId && $subjectId ? 'ready' : 'needs_review',
                ]);

                $resources = $this->arrayValue($item->links);
                foreach ($resources as $index => $resource) {
                    if (! is_array($resource) || (! filled($resource['file_path'] ?? null) && ! filled($resource['link'] ?? null))) {
                        continue;
                    }
                    DB::table('bank_soal_resources')->insert([
                        'bank_soal_id' => $item->id,
                        'label' => $resource['label'] ?? null,
                        'file_path' => $resource['file_path'] ?? null,
                        'file_name' => $resource['file_name'] ?? null,
                        'destination_url' => $resource['link'] ?? null,
                        'sort_order' => ($index + 1) * 10,
                        'created_at' => $now,
                        'updated_at' => $now,
                    ]);
                }

                if ($resources === [] && filled($item->image_path)) {
                    DB::table('bank_soal_resources')->insert([
                        'bank_soal_id' => $item->id,
                        'label' => 'Lampiran Bank Soal',
                        'file_path' => $item->image_path,
                        'file_name' => basename((string) $item->image_path),
                        'destination_url' => null,
                        'sort_order' => 10,
                        'created_at' => $now,
                        'updated_at' => $now,
                    ]);
                }
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('bank_soal_resources')->delete();
        DB::table('education_level_subject')->delete();
        DB::table('bank_soals')->update(['education_class_id' => null, 'subject_id' => null, 'classification_status' => 'needs_review']);
        DB::table('subjects')->delete();
        DB::table('education_classes')->delete();
        DB::table('education_levels')->delete();
    }

    private function resolveLevelCode(object $item, string $text): ?string
    {
        $haystack = strtoupper(implode(' ', array_merge($this->stringList($item->education_levels), [$this->localizedText($item->level), $text])));
        foreach (['SMA', 'SMP', 'SD', 'TK'] as $code) {
            if (preg_match('/\b'.$code.'\b/', $haystack) === 1) {
                return $code;
            }
        }

        return null;
    }

    private function normalizeGrade(string $grade): string
    {
        $value = strtoupper(trim(str_replace('KELAS', '', $grade)));
        $roman = ['I' => '1', 'II' => '2', 'III' => '3', 'IV' => '4', 'V' => '5', 'VI' => '6', 'VII' => '7', 'VIII' => '8', 'IX' => '9', 'X' => '10', 'XI' => '11', 'XII' => '12'];

        return $roman[$value] ?? $value;
    }

    private function localizedText(mixed $value): string
    {
        $decoded = $this->decode($value);

        return is_array($decoded) ? trim((string) ($decoded['id'] ?? $decoded['en'] ?? '')) : (is_scalar($decoded) ? trim((string) $decoded) : '');
    }

    /** @return array<int, string> */
    private function stringList(mixed $value): array
    {
        return array_values(array_filter(array_map('strval', $this->arrayValue($value))));
    }

    /** @return array<int, mixed> */
    private function arrayValue(mixed $value): array
    {
        $decoded = $this->decode($value);

        return is_array($decoded) ? array_values($decoded) : [];
    }

    private function decode(mixed $value): mixed
    {
        if (! is_string($value)) {
            return $value;
        }
        $decoded = json_decode($value, true);

        return json_last_error() === JSON_ERROR_NONE ? $decoded : $value;
    }
};
