<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('student_registrations', function (Blueprint $table): void {
            $table->string('parent_email')->nullable()->after('parent_contact');
        });
    }

    public function down(): void
    {
        Schema::table('student_registrations', function (Blueprint $table): void {
            $table->dropColumn('parent_email');
        });
    }
};
