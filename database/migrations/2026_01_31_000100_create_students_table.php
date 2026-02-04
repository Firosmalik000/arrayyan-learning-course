<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('students', function (Blueprint $table): void {
            $table->id();
            $table->string('name');
            $table->string('address', 500)->nullable();
            $table->string('school_name', 255)->nullable();
            $table->string('level', 100)->nullable();
            $table->string('subjects')->nullable();
            $table->string('program', 100)->nullable();
            $table->string('package', 100)->nullable();
            $table->string('parent_contact', 255)->nullable();
            $table->string('preferred_mode', 100)->nullable();
            $table->text('notes')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('students');
    }
};
