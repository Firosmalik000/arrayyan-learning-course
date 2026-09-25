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
        Schema::create('notification_logs', function (Blueprint $table) {
            $table->id();
            $table->string('event', 50);
            $table->string('channel', 20)->default('whatsapp');
            $table->string('recipient', 50);
            $table->text('message');
            $table->string('status', 20)->default('queued');
            $table->text('error')->nullable();
            $table->string('registration_type', 50)->nullable();
            $table->unsignedBigInteger('registration_id')->nullable();
            $table->timestamps();

            $table->index(['registration_type', 'registration_id']);
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notification_logs');
    }
};
