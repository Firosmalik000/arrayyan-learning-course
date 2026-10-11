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
            $table->string('level', 50)->nullable()->after('program_id');
            $table->foreignId('package_id')->nullable()->after('level')->constrained('packages')->nullOnDelete();
            $table->unsignedInteger('total_sessions')->nullable()->after('package_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('class_groups', function (Blueprint $table) {
            $table->dropConstrainedForeignId('package_id');
            $table->dropColumn(['level', 'total_sessions']);
        });
    }
};
