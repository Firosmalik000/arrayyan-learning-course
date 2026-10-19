<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('attendances', function (Blueprint $table) {
            $table->string('subject', 100)->nullable()->after('status');
            $table->text('material')->nullable()->after('subject');
            $table->unsignedTinyInteger('understanding_score')->nullable()->after('material');
            $table->text('evaluation')->nullable()->after('understanding_score');
        });
    }

    public function down(): void
    {
        Schema::table('attendances', function (Blueprint $table) {
            $table->dropColumn([
                'subject',
                'material',
                'understanding_score',
                'evaluation',
            ]);
        });
    }
};
