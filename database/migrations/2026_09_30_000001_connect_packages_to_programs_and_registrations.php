<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('packages', function (Blueprint $table): void {
            $table->foreignId('program_id')
                ->nullable()
                ->after('id')
                ->constrained()
                ->nullOnDelete();
            $table->string('intensity', 100)->nullable()->after('sessions');
            $table->unsignedSmallInteger('max_participants')->nullable()->after('intensity');
            $table->unsignedSmallInteger('sort_order')->default(0)->after('max_participants');
            $table->index(['program_id', 'is_active', 'sort_order'], 'packages_program_active_sort_index');
        });

        Schema::table('student_registrations', function (Blueprint $table): void {
            $table->foreignId('package_id')
                ->nullable()
                ->after('program_id')
                ->constrained('packages')
                ->nullOnDelete();
        });

        Schema::table('students', function (Blueprint $table): void {
            $table->foreignId('package_id')
                ->nullable()
                ->after('program_id')
                ->constrained('packages')
                ->nullOnDelete();
        });

        Schema::table('invoices', function (Blueprint $table): void {
            $table->foreignId('package_id')
                ->nullable()
                ->after('program_id')
                ->constrained('packages')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('invoices', function (Blueprint $table): void {
            $table->dropConstrainedForeignId('package_id');
        });

        Schema::table('students', function (Blueprint $table): void {
            $table->dropConstrainedForeignId('package_id');
        });

        Schema::table('student_registrations', function (Blueprint $table): void {
            $table->dropConstrainedForeignId('package_id');
        });

        Schema::table('packages', function (Blueprint $table): void {
            $table->dropIndex('packages_program_active_sort_index');
            $table->dropConstrainedForeignId('program_id');
            $table->dropColumn(['intensity', 'max_participants', 'sort_order']);
        });
    }
};
