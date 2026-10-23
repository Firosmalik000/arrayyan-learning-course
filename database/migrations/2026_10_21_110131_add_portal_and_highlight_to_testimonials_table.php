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
        Schema::table('testimonials', function (Blueprint $table) {
            $table->foreignId('portal_account_id')->nullable()->after('id')->constrained('portal_accounts')->nullOnDelete();
            $table->foreignId('student_id')->nullable()->after('portal_account_id')->constrained('students')->nullOnDelete();
            $table->string('student_name')->nullable()->after('role');
            $table->string('highlight', 80)->nullable()->after('rating');
            $table->string('avatar_path')->nullable()->after('highlight');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('testimonials', function (Blueprint $table) {
            $table->dropConstrainedForeignId('portal_account_id');
            $table->dropConstrainedForeignId('student_id');
            $table->dropColumn(['student_name', 'highlight', 'avatar_path']);
        });
    }
};
