<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('teacher_registrations', function (Blueprint $table): void {
            $table->id();
            $table->string('name');
            $table->string('education');
            $table->string('subjects');
            $table->string('experience')->nullable();
            $table->string('contact');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('teacher_registrations');
    }
};
