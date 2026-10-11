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
        if (Schema::hasTable('teacher_registrations')) {
            Schema::table('teacher_registrations', function (Blueprint $table): void {
                if (! Schema::hasColumn('teacher_registrations', 'email')) {
                    $table->string('email')->nullable()->after('contact');
                }
            });
        }

        if (Schema::hasTable('teachers')) {
            Schema::table('teachers', function (Blueprint $table): void {
                if (! Schema::hasColumn('teachers', 'email')) {
                    $table->string('email')->nullable()->after('contact');
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('teachers')) {
            Schema::table('teachers', function (Blueprint $table): void {
                if (Schema::hasColumn('teachers', 'email')) {
                    $table->dropColumn('email');
                }
            });
        }

        if (Schema::hasTable('teacher_registrations')) {
            Schema::table('teacher_registrations', function (Blueprint $table): void {
                if (Schema::hasColumn('teacher_registrations', 'email')) {
                    $table->dropColumn('email');
                }
            });
        }
    }
};
