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
        Schema::create('education_levels', function (Blueprint $table): void {
            $table->id();
            $table->string('name')->unique();
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('education_classes', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('education_level_id')->constrained()->restrictOnDelete();
            $table->string('name');
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->unique(['education_level_id', 'name']);
        });

        Schema::create('subjects', function (Blueprint $table): void {
            $table->id();
            $table->string('name')->unique();
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('education_level_subject', function (Blueprint $table): void {
            $table->foreignId('education_level_id')->constrained()->cascadeOnDelete();
            $table->foreignId('subject_id')->constrained()->cascadeOnDelete();
            $table->timestamps();
            $table->primary(['education_level_id', 'subject_id']);
        });

        Schema::table('bank_soals', function (Blueprint $table): void {
            $table->foreignId('education_class_id')->nullable()->after('id')->constrained()->restrictOnDelete();
            $table->foreignId('subject_id')->nullable()->after('education_class_id')->constrained()->restrictOnDelete();
            $table->string('classification_status', 24)->default('needs_review')->after('subject_id')->index();
        });

        Schema::create('bank_soal_resources', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('bank_soal_id')->constrained()->cascadeOnDelete();
            $table->string('label')->nullable();
            $table->string('file_path')->nullable();
            $table->string('file_name')->nullable();
            $table->string('destination_url', 500)->nullable();
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();
            $table->index(['bank_soal_id', 'sort_order']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bank_soal_resources');
        Schema::table('bank_soals', function (Blueprint $table): void {
            $table->dropConstrainedForeignId('subject_id');
            $table->dropConstrainedForeignId('education_class_id');
            $table->dropColumn('classification_status');
        });
        Schema::dropIfExists('education_level_subject');
        Schema::dropIfExists('subjects');
        Schema::dropIfExists('education_classes');
        Schema::dropIfExists('education_levels');
    }
};
