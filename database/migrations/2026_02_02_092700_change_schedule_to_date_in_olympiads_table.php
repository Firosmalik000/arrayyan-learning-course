<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Clear non-date string values first
        DB::table('olympiads')
            ->whereNotNull('schedule')
            ->update(['schedule' => null]);

        Schema::table('olympiads', function (Blueprint $table): void {
            $table->date('schedule')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('olympiads', function (Blueprint $table): void {
            $table->string('schedule')->nullable()->change();
        });
    }
};
