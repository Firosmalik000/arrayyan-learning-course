<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('student_registrations', function (Blueprint $table): void {
            $table->string('class_level', 100)->nullable()->after('level');
        });

        Schema::table('students', function (Blueprint $table): void {
            $table->string('class_level', 100)->nullable()->after('level');
        });
    }

    public function down(): void
    {
        Schema::table('student_registrations', function (Blueprint $table): void {
            $table->dropColumn('class_level');
        });

        Schema::table('students', function (Blueprint $table): void {
            $table->dropColumn('class_level');
        });
    }
};
