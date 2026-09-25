<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('student_registrations', function (Blueprint $table): void {
            $table->string('registration_no', 20)->nullable()->unique()->after('id');
            $table->string('admin_note', 500)->nullable()->after('notes');
            $table->timestamp('notified_at')->nullable()->after('admin_note');
        });

        Schema::table('teacher_registrations', function (Blueprint $table): void {
            $table->string('registration_no', 20)->nullable()->unique()->after('id');
            $table->string('admin_note', 500)->nullable()->after('notes');
            $table->timestamp('notified_at')->nullable()->after('admin_note');
        });

        $this->backfillTickets('student_registrations');
        $this->backfillTickets('teacher_registrations');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('student_registrations', function (Blueprint $table): void {
            $table->dropUnique(['registration_no']);
            $table->dropColumn(['registration_no', 'admin_note', 'notified_at']);
        });

        Schema::table('teacher_registrations', function (Blueprint $table): void {
            $table->dropUnique(['registration_no']);
            $table->dropColumn(['registration_no', 'admin_note', 'notified_at']);
        });
    }

    private function backfillTickets(string $table): void
    {
        DB::table($table)
            ->whereNull('registration_no')
            ->orderBy('id')
            ->eachById(function (object $row) use ($table): void {
                DB::table($table)
                    ->where('id', $row->id)
                    ->update([
                        'registration_no' => sprintf(
                            'ALC-%s-%05d',
                            date('Y', strtotime($row->created_at)),
                            $row->id
                        ),
                    ]);
            });
    }
};
