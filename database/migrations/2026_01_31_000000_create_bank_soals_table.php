<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bank_soals', function (Blueprint $table): void {
            $table->id();
            $table->string('slug')->unique();
            $table->json('name');
            $table->json('category')->nullable();
            $table->json('level')->nullable();
            $table->string('format')->nullable();
            $table->unsignedInteger('questions')->default(0);
            $table->json('description')->nullable();
            $table->string('tone')->default('violet');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bank_soals');
    }
};
