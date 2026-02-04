<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('student_registrations', function (Blueprint $table): void {
            $table->string('status', 20)->default('pending')->after('notes');
        });

        Schema::table('teacher_registrations', function (Blueprint $table): void {
            $table->string('status', 20)->default('pending')->after('notes');
        });
    }

    public function down(): void
    {
        Schema::table('student_registrations', function (Blueprint $table): void {
            $table->dropColumn('status');
        });

        Schema::table('teacher_registrations', function (Blueprint $table): void {
            $table->dropColumn('status');
        });
    }
};
