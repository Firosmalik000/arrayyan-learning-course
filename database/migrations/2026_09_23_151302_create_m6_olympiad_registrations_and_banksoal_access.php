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
        Schema::table('olympiads', function (Blueprint $table): void {
            $table->unsignedInteger('quota')->nullable()->after('fee');
            $table->date('registration_deadline')->nullable()->after('quota');
            $table->json('winners')->nullable()->after('registration_deadline');
            $table->boolean('is_registration_open')->default(true)->after('winners');
        });

        Schema::create('olympiad_registrations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('olympiad_id')->constrained('olympiads')->cascadeOnDelete();
            $table->string('ticket_no', 20)->unique();
            $table->string('name');
            $table->string('school', 255)->nullable();
            $table->string('level', 100)->nullable();
            $table->string('contact', 30);
            $table->string('fee_status', 20)->default('free');
            $table->string('status', 20)->default('pending');
            $table->string('admin_note', 500)->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('rejected_at')->nullable();
            $table->foreignId('rejected_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['olympiad_id', 'status']);
        });

        Schema::table('bank_soals', function (Blueprint $table): void {
            $table->string('passkey', 255)->nullable()->after('links');
            $table->unsignedBigInteger('view_count')->default(0)->after('passkey');
            $table->unsignedBigInteger('download_count')->default(0)->after('view_count');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bank_soals', function (Blueprint $table): void {
            $table->dropColumn(['passkey', 'view_count', 'download_count']);
        });

        Schema::dropIfExists('olympiad_registrations');

        Schema::table('olympiads', function (Blueprint $table): void {
            $table->dropColumn(['quota', 'registration_deadline', 'winners', 'is_registration_open']);
        });
    }
};
