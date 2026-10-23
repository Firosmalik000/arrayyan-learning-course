<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('invoices')
            ->whereNotNull('student_id')
            ->whereNull('class_member_id')
            ->whereNull('billing_month')
            ->where('billing_type', 'registration')
            ->select(['id', 'student_id', 'program_id', 'package_id', 'created_at'])
            ->orderBy('id')
            ->chunkById(200, function ($invoices): void {
                foreach ($invoices as $invoice) {
                    $members = DB::table('class_members')
                        ->join('class_groups', 'class_groups.id', '=', 'class_members.class_group_id')
                        ->where('class_members.student_id', $invoice->student_id)
                        ->when($invoice->program_id, fn ($query, $programId) => $query->where('class_groups.program_id', $programId))
                        ->when($invoice->package_id, fn ($query, $packageId) => $query->where(function ($inner) use ($packageId): void {
                            $inner->whereNull('class_groups.package_id')->orWhere('class_groups.package_id', $packageId);
                        }))
                        ->select(['class_members.id', 'class_members.class_group_id', 'class_members.joined_at'])
                        ->get();

                    $invoiceDate = Carbon::parse($invoice->created_at);
                    $member = $members->first(function ($member) use ($invoiceDate): bool {
                        if (! $member->joined_at) {
                            return false;
                        }

                        $joinedAt = Carbon::parse($member->joined_at);

                        return $joinedAt->isSameMonth($invoiceDate)
                            || ($joinedAt->gte($invoiceDate) && $joinedAt->diffInDays($invoiceDate) <= 31);
                    });

                    if (! $member) {
                        continue;
                    }

                    $billingMonth = Carbon::parse($member->joined_at)->startOfMonth()->toDateString();
                    $duplicateExists = DB::table('invoices')
                        ->where('class_member_id', $member->id)
                        ->whereDate('billing_month', $billingMonth)
                        ->exists();

                    if ($duplicateExists) {
                        continue;
                    }

                    DB::table('invoices')->where('id', $invoice->id)->update([
                        'class_member_id' => $member->id,
                        'class_group_id' => $member->class_group_id,
                        'billing_month' => $billingMonth,
                        'updated_at' => now(),
                    ]);
                }
            });
    }

    public function down(): void {}
};
