<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('olympiads', function (Blueprint $table): void {
            $table->id();
            $table->string('name');
            $table->string('level');
            $table->string('schedule')->nullable();
            $table->string('selection_system')->nullable();
            $table->string('category')->default('free');
            $table->decimal('fee', 12, 2)->nullable();
            $table->text('notes')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('olympiads');
    }
};
