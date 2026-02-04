<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Audit columns on student_registrations
        Schema::table('student_registrations', function (Blueprint $table): void {
            $table->timestamp('approved_at')->nullable()->after('status');
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete()->after('approved_at');
            $table->timestamp('rejected_at')->nullable()->after('approved_by');
            $table->foreignId('rejected_by')->nullable()->constrained('users')->nullOnDelete()->after('rejected_at');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete()->after('updated_at');
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete()->after('created_by');
        });

        // Audit columns on teacher_registrations
        Schema::table('teacher_registrations', function (Blueprint $table): void {
            $table->timestamp('approved_at')->nullable()->after('status');
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete()->after('approved_at');
            $table->timestamp('rejected_at')->nullable()->after('approved_by');
            $table->foreignId('rejected_by')->nullable()->constrained('users')->nullOnDelete()->after('rejected_at');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete()->after('updated_at');
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete()->after('created_by');
        });

        // Audit columns on students
        Schema::table('students', function (Blueprint $table): void {
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete()->after('updated_at');
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete()->after('created_by');
        });

        // Teachers table (approved pengajar)
        Schema::create('teachers', function (Blueprint $table): void {
            $table->id();
            $table->string('name');
            $table->string('address', 500)->nullable();
            $table->string('education', 255)->nullable();
            $table->string('subjects')->nullable();
            $table->string('experience', 500)->nullable();
            $table->string('contact', 255)->nullable();
            $table->string('cv_path')->nullable();
            $table->text('notes')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('teachers');

        Schema::table('students', function (Blueprint $table): void {
            $table->dropForeign(['created_by']);
            $table->dropForeign(['updated_by']);
            $table->dropColumn(['created_by', 'updated_by']);
        });

        Schema::table('teacher_registrations', function (Blueprint $table): void {
            $table->dropForeign(['approved_by']);
            $table->dropForeign(['rejected_by']);
            $table->dropForeign(['created_by']);
            $table->dropForeign(['updated_by']);
            $table->dropColumn(['approved_at', 'approved_by', 'rejected_at', 'rejected_by', 'created_by', 'updated_by']);
        });

        Schema::table('student_registrations', function (Blueprint $table): void {
            $table->dropForeign(['approved_by']);
            $table->dropForeign(['rejected_by']);
            $table->dropForeign(['created_by']);
            $table->dropForeign(['updated_by']);
            $table->dropColumn(['approved_at', 'approved_by', 'rejected_at', 'rejected_by', 'created_by', 'updated_by']);
        });
    }
};
