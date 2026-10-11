<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('student_registrations', function (Blueprint $table): void {
            $table->foreignId('student_id')
                ->nullable()
                ->after('id')
                ->constrained('students')
                ->nullOnDelete();

            $table->index(['student_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('student_registrations', function (Blueprint $table): void {
            $table->dropForeign(['student_id']);
            $table->dropIndex(['student_id', 'status']);
            $table->dropColumn('student_id');
        });
    }
};
