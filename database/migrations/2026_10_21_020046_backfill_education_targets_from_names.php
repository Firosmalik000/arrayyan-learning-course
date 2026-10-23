<?php

use App\Support\EducationCatalog;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $this->backfillTable('bank_soals');
        $this->backfillTable('olympiads');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // This data backfill is intentionally irreversible because existing targets must be preserved.
    }

    private function backfillTable(string $table): void
    {
        DB::table($table)
            ->select(['id', 'name', 'level', 'education_levels', 'grades'])
            ->orderBy('id')
            ->chunkById(100, function ($items) use ($table): void {
                foreach ($items as $item) {
                    $name = $this->decodeJson($item->name) ?? $item->name;
                    $legacyLevel = $this->decodeJson($item->level) ?? $item->level;
                    $existingLevels = $this->decodeJson($item->education_levels);
                    $existingGrades = $this->decodeJson($item->grades);
                    $resolved = EducationCatalog::resolveTargets($name, $legacyLevel);

                    $educationLevels = is_array($existingLevels) && $existingLevels !== []
                        ? $existingLevels
                        : $resolved['education_levels'];
                    $grades = is_array($existingGrades) && $existingGrades !== []
                        ? $existingGrades
                        : $resolved['grades'];

                    if ($educationLevels === $existingLevels && $grades === $existingGrades) {
                        continue;
                    }

                    DB::table($table)->where('id', $item->id)->update([
                        'education_levels' => json_encode(array_values($educationLevels), JSON_THROW_ON_ERROR),
                        'grades' => json_encode(array_values($grades), JSON_THROW_ON_ERROR),
                    ]);
                }
            });
    }

    private function decodeJson(mixed $value): mixed
    {
        if (! is_string($value)) {
            return $value;
        }

        $decoded = json_decode($value, true);

        return json_last_error() === JSON_ERROR_NONE ? $decoded : null;
    }
};
