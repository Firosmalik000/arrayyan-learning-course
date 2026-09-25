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
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->string('invoice_no', 20)->nullable()->unique();
            $table->foreignId('student_registration_id')->nullable()
                ->constrained('student_registrations')->nullOnDelete();
            $table->foreignId('student_id')->nullable()
                ->constrained('students')->nullOnDelete();
            $table->foreignId('program_id')->nullable()
                ->constrained('programs')->nullOnDelete();
            $table->decimal('amount', 12, 2)->default(0);
            $table->string('status', 20)->default('unpaid');
            $table->date('due_date')->nullable();
            $table->string('notes', 500)->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();

            $table->index('status');
            $table->index('due_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('invoices');
    }
};
