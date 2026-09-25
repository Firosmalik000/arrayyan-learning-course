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
            $table->index('status', 'student_registrations_status_index');
            $table->index('created_at', 'student_registrations_created_at_index');
            $table->index(['program_id', 'status'], 'student_registrations_program_status_index');
        });

        Schema::table('teacher_registrations', function (Blueprint $table): void {
            $table->index('status', 'teacher_registrations_status_index');
            $table->index('created_at', 'teacher_registrations_created_at_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('student_registrations', function (Blueprint $table): void {
            $table->dropIndex('student_registrations_status_index');
            $table->dropIndex('student_registrations_created_at_index');
            $table->dropIndex('student_registrations_program_status_index');
        });

        Schema::table('teacher_registrations', function (Blueprint $table): void {
            $table->dropIndex('teacher_registrations_status_index');
            $table->dropIndex('teacher_registrations_created_at_index');
        });
    }
};
