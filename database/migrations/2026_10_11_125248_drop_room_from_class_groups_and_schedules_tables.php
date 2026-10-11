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
        Schema::table('class_groups', function (Blueprint $table) {
            if (Schema::hasColumn('class_groups', 'room')) {
                $table->dropColumn('room');
            }
        });

        Schema::table('schedules', function (Blueprint $table) {
            if (Schema::hasColumn('schedules', 'room')) {
                $table->dropColumn('room');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('class_groups', function (Blueprint $table) {
            $table->string('room', 100)->nullable();
        });

        Schema::table('schedules', function (Blueprint $table) {
            $table->string('room', 100)->nullable();
        });
    }
};
