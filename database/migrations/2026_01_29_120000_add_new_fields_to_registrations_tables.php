<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('student_registrations', function (Blueprint $table) {
            $table->string('address', 500)->nullable()->after('student_name');
            $table->string('school_name', 255)->nullable()->after('address');
            $table->string('program', 100)->nullable()->after('subjects');
            $table->string('package', 100)->nullable()->after('program');
        });

        Schema::table('teacher_registrations', function (Blueprint $table) {
            $table->string('address', 500)->nullable()->after('name');
            $table->string('cv_path', 500)->nullable()->after('contact');
        });
    }

    public function down(): void
    {
        Schema::table('student_registrations', function (Blueprint $table) {
            $table->dropColumn(['address', 'school_name', 'program', 'package']);
        });

        Schema::table('teacher_registrations', function (Blueprint $table) {
            $table->dropColumn(['address', 'cv_path']);
        });
    }
};
