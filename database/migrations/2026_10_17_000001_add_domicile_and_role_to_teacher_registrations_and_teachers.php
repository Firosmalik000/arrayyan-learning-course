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
                if (! Schema::hasColumn('teacher_registrations', 'city')) {
                    $table->string('city', 100)->nullable()->after('address');
                }
                if (! Schema::hasColumn('teacher_registrations', 'district')) {
                    $table->string('district', 100)->nullable()->after('city');
                }
                if (! Schema::hasColumn('teacher_registrations', 'teacher_role')) {
                    $table->string('teacher_role', 100)->nullable()->after('subjects');
                }
            });
        }

        if (Schema::hasTable('teachers')) {
            Schema::table('teachers', function (Blueprint $table): void {
                if (! Schema::hasColumn('teachers', 'city')) {
                    $table->string('city', 100)->nullable()->after('address');
                }
                if (! Schema::hasColumn('teachers', 'district')) {
                    $table->string('district', 100)->nullable()->after('city');
                }
                if (! Schema::hasColumn('teachers', 'teacher_role')) {
                    $table->string('teacher_role', 100)->nullable()->after('subjects');
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
                $columns = [];
                if (Schema::hasColumn('teachers', 'city')) {
                    $columns[] = 'city';
                }
                if (Schema::hasColumn('teachers', 'district')) {
                    $columns[] = 'district';
                }
                if (Schema::hasColumn('teachers', 'teacher_role')) {
                    $columns[] = 'teacher_role';
                }
                if (! empty($columns)) {
                    $table->dropColumn($columns);
                }
            });
        }

        if (Schema::hasTable('teacher_registrations')) {
            Schema::table('teacher_registrations', function (Blueprint $table): void {
                $columns = [];
                if (Schema::hasColumn('teacher_registrations', 'city')) {
                    $columns[] = 'city';
                }
                if (Schema::hasColumn('teacher_registrations', 'district')) {
                    $columns[] = 'district';
                }
                if (Schema::hasColumn('teacher_registrations', 'teacher_role')) {
                    $columns[] = 'teacher_role';
                }
                if (! empty($columns)) {
                    $table->dropColumn($columns);
                }
            });
        }
    }
};
