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
        DB::table('bank_soals')
            ->select(['id', 'name', 'description', 'level', 'grades'])
            ->orderBy('id')
            ->chunkById(100, function ($items): void {
                foreach ($items as $item) {
                    $existingGrades = $this->decodeJson($item->grades);

                    if (is_array($existingGrades) && $existingGrades !== []) {
                        continue;
                    }

                    $name = $this->decodeJson($item->name) ?? $item->name;
                    $description = $this->decodeJson($item->description) ?? $item->description;
                    $legacyLevel = $this->decodeJson($item->level) ?? $item->level;
                    $resolved = EducationCatalog::resolveTargets([$name, $description], $legacyLevel);

                    if ($resolved['grades'] === []) {
                        continue;
                    }

                    DB::table('bank_soals')->where('id', $item->id)->update([
                        'grades' => json_encode($resolved['grades'], JSON_THROW_ON_ERROR),
                    ]);
                }
            });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // This data backfill is intentionally irreversible because existing targets must be preserved.
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
