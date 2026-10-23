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
        Schema::create('class_group_lifecycles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('class_group_id')->constrained('class_groups')->cascadeOnDelete();
            $table->date('activated_at');
            $table->date('deactivated_at')->nullable();
            $table->timestamps();

            $table->index(['class_group_id', 'activated_at', 'deactivated_at'], 'class_lifecycle_range_idx');
        });

        Schema::table('class_members', function (Blueprint $table) {
            $table->date('ended_at')->nullable()->after('joined_at');
        });

        Schema::table('invoices', function (Blueprint $table) {
            $table->foreignId('class_member_id')->nullable()->after('student_id')
                ->constrained('class_members')->nullOnDelete();
            $table->foreignId('class_group_id')->nullable()->after('class_member_id')
                ->constrained('class_groups')->nullOnDelete();
            $table->string('billing_type', 20)->default('registration')->after('package_id');
            $table->date('billing_month')->nullable()->after('billing_type');

            $table->unique(['class_member_id', 'billing_month'], 'invoices_member_month_unique');
            $table->index(['billing_type', 'billing_month']);
            $table->index(['class_group_id', 'billing_month']);
        });

        DB::table('invoices')
            ->whereNull('student_id')
            ->whereNotNull('student_registration_id')
            ->select(['id', 'student_registration_id'])
            ->orderBy('id')
            ->chunkById(200, function ($invoices): void {
                $registrationIds = $invoices->pluck('student_registration_id')->filter()->unique();
                $studentIds = DB::table('student_registrations')
                    ->whereIn('id', $registrationIds)
                    ->whereNotNull('student_id')
                    ->pluck('student_id', 'id');

                foreach ($invoices as $invoice) {
                    $studentId = $studentIds[$invoice->student_registration_id] ?? null;

                    if ($studentId) {
                        DB::table('invoices')->where('id', $invoice->id)->update(['student_id' => $studentId]);
                    }
                }
            });

        DB::table('class_groups')
            ->select(['id', 'is_active', 'created_at', 'updated_at'])
            ->orderBy('id')
            ->chunkById(200, function ($classes): void {
                $rows = [];

                foreach ($classes as $classGroup) {
                    $rows[] = [
                        'class_group_id' => $classGroup->id,
                        'activated_at' => substr((string) ($classGroup->created_at ?? now()), 0, 10),
                        'deactivated_at' => $classGroup->is_active
                            ? null
                            : substr((string) ($classGroup->updated_at ?? now()), 0, 10),
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];
                }

                if ($rows !== []) {
                    DB::table('class_group_lifecycles')->insert($rows);
                }
            });

        DB::table('class_members')
            ->where('status', '<>', 'active')
            ->update(['ended_at' => DB::raw('DATE(updated_at)')]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('invoices', function (Blueprint $table) {
            $table->dropUnique('invoices_member_month_unique');
            $table->dropIndex(['billing_type', 'billing_month']);
            $table->dropIndex(['class_group_id', 'billing_month']);
            $table->dropConstrainedForeignId('class_group_id');
            $table->dropConstrainedForeignId('class_member_id');
            $table->dropColumn(['billing_type', 'billing_month']);
        });

        Schema::table('class_members', function (Blueprint $table) {
            $table->dropColumn('ended_at');
        });

        Schema::dropIfExists('class_group_lifecycles');
    }
};
