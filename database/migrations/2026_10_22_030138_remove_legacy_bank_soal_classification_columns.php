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
        Schema::table('bank_soals', function (Blueprint $table): void {
            $table->dropUnique('bank_soals_slug_unique');
        });

        Schema::table('bank_soals', function (Blueprint $table): void {
            $table->dropColumn(['slug', 'category', 'level', 'education_levels', 'grades', 'links']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bank_soals', function (Blueprint $table): void {
            $table->string('slug')->nullable()->unique()->after('classification_status');
            $table->json('category')->nullable()->after('name');
            $table->json('level')->nullable()->after('category');
            $table->json('education_levels')->nullable()->after('level');
            $table->json('grades')->nullable()->after('education_levels');
            $table->json('links')->nullable()->after('description');
        });
    }
};
