<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('bank_soals', function (Blueprint $table): void {
            $table->json('education_levels')->nullable()->after('level');
            $table->json('grades')->nullable()->after('education_levels');
        });

        Schema::table('olympiads', function (Blueprint $table): void {
            $table->json('education_levels')->nullable()->after('level');
            $table->json('grades')->nullable()->after('education_levels');
        });

        $this->backfillBankSoals();
        $this->backfillOlympiads();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bank_soals', function (Blueprint $table): void {
            $table->dropColumn(['education_levels', 'grades']);
        });

        Schema::table('olympiads', function (Blueprint $table): void {
            $table->dropColumn(['education_levels', 'grades']);
        });
    }

    private function backfillBankSoals(): void
    {
        DB::table('bank_soals')
            ->select(['id', 'level'])
            ->orderBy('id')
            ->chunkById(100, function ($items): void {
                foreach ($items as $item) {
                    $level = json_decode((string) $item->level, true);
                    $level = is_array($level) ? ($level['id'] ?? $level['en'] ?? '') : $item->level;

                    DB::table('bank_soals')->where('id', $item->id)->update([
                        'education_levels' => json_encode($this->extractLevels((string) $level)),
                        'grades' => json_encode([]),
                    ]);
                }
            });
    }

    private function backfillOlympiads(): void
    {
        DB::table('olympiads')
            ->select(['id', 'level'])
            ->orderBy('id')
            ->chunkById(100, function ($items): void {
                foreach ($items as $item) {
                    DB::table('olympiads')->where('id', $item->id)->update([
                        'education_levels' => json_encode($this->extractLevels((string) $item->level)),
                        'grades' => json_encode([]),
                    ]);
                }
            });
    }

    /**
     * @return array<int, string>
     */
    private function extractLevels(string $label): array
    {
        $label = strtoupper($label);
        $levels = [];

        if (str_contains($label, 'PRA TK') || preg_match('/\bTK\b/', $label)) {
            $levels[] = 'TK';
        }
        if (preg_match('/\b(SD|MI|ELEMENTARY)\b/', $label)) {
            $levels[] = 'SD';
        }
        if (preg_match('/\b(SMP|MTS|JUNIOR HIGH)\b/', $label)) {
            $levels[] = 'SMP';
        }
        if (preg_match('/\b(SMA|MA|SENIOR HIGH)\b/', $label)) {
            $levels[] = 'SMA';
        }

        return array_values(array_unique($levels));
    }
};
