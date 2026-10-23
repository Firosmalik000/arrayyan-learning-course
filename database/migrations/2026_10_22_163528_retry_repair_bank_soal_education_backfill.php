<?php

use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $backfill = require database_path('migrations/2026_10_22_041009_repair_bank_soal_education_backfill.php');
        $backfill->up();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // The corrective backfill intentionally preserves the generated class-specific records.
    }
};
