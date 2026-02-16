<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bank_soals', function (Blueprint $table): void {
            $table->string('image_path')->nullable()->after('links');
        });
    }

    public function down(): void
    {
        Schema::table('bank_soals', function (Blueprint $table): void {
            $table->dropColumn('image_path');
        });
    }
};
